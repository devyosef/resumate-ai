#!/bin/bash

# Exit on any error
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default AWS Region
AWS_REGION="us-east-1"
LAMBDA_ECR_REPO_NAME="ats-system-v2-dev-lambda-repo"
FRONTEND_ECR_REPO_NAME="ats-system-v2-dev-frontend-repo"

# Function to log steps
log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Function to log success
log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to log warning
log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to log error and exit
log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Function to check if a command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 is required but not installed."
    fi
}

# Function to check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."
    
    # Check required commands
    check_command "aws"
    check_command "docker"
    check_command "terraform"

    # Check AWS credentials
    log_step "Checking AWS credentials..."
    if ! aws sts get-caller-identity &>/dev/null; then
        log_error "AWS credentials not configured. Please run 'aws configure' first."
    fi

    # Get AWS Account ID
    log_step "Getting AWS Account ID..."
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --region "$AWS_REGION")
    if [ -z "$AWS_ACCOUNT_ID" ]; then
        log_error "Failed to get AWS Account ID"
    fi

    # Get current AWS credentials
    log_step "Getting AWS credentials..."
    # Get current credentials from AWS CLI
    AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id)
    AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key)
    
    if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        log_error "Failed to get AWS credentials"
    fi

    # Export the credentials so they're available throughout the script
    export AWS_ACCESS_KEY_ID
    export AWS_SECRET_ACCESS_KEY

    # Check OpenAI API key
    if [ -z "$OPENAI_API_KEY" ]; then
        log_error "OPENAI_API_KEY environment variable is not set"
    fi

    log_success "All prerequisites checked"
}

# Function to ensure ECR repository exists
ensure_ecr_repo() {
    local repo_name=$1
    log_step "Checking if ECR repository $repo_name exists..."
    if ! aws ecr describe-repositories --repository-names "$repo_name" --region "$AWS_REGION" > /dev/null 2>&1; then
        log_step "Creating ECR repository $repo_name..."
        aws ecr create-repository --repository-name "$repo_name" --region "$AWS_REGION"
        log_success "ECR repository created"
    else
        log_warning "ECR repository '$repo_name' already exists."
    fi
}

# Function to cleanup Docker images
cleanup_docker() {
    log_step "Cleaning up Docker images..."
    # Cleanup Lambda images
    docker rmi -f ats-system-lambda:latest 2>/dev/null || true
    docker rmi -f "$LAMBDA_REPO_URI" 2>/dev/null || true
    # Cleanup Frontend images
    docker rmi -f frontend-app:latest 2>/dev/null || true
    docker rmi -f "$FRONTEND_REPO_URI" 2>/dev/null || true
    log_success "Docker images cleaned up"
}

# Function to build and deploy infrastructure
deploy_infrastructure() {
    # Ensure ECR repositories exist first
    ensure_ecr_repo "$LAMBDA_ECR_REPO_NAME"
    ensure_ecr_repo "$FRONTEND_ECR_REPO_NAME"

    # Build and push Lambda image
    log_step "Building Lambda Docker image..."
    if ! docker build -t ats-system-lambda ./lambda ; then
        log_error "Failed to build Lambda Docker image"
    fi
    log_success "Lambda Docker image built successfully"

    # Build and push Frontend image
    log_step "Building Frontend Docker image..."
    if ! docker build -t frontend-app ./front ; then
        log_error "Failed to build Frontend Docker image"
    fi
    log_success "Frontend Docker image built successfully"

    # Login to ECR
    log_step "Logging into ECR..."
    if ! aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com" ; then
        log_error "Failed to login to ECR"
    fi
    log_success "Successfully logged into ECR"

    # Tag and push Lambda image
    log_step "Tagging and pushing Lambda image..."
    LAMBDA_REPO_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$LAMBDA_ECR_REPO_NAME:latest"
    if ! docker tag ats-system-lambda:latest "$LAMBDA_REPO_URI" ; then
        log_error "Failed to tag Lambda image"
    fi
    if ! docker push "$LAMBDA_REPO_URI" ; then
        log_error "Failed to push Lambda image to ECR"
    fi
    log_success "Lambda image pushed to ECR"

    # Tag and push Frontend image
    log_step "Tagging and pushing Frontend image..."
    FRONTEND_REPO_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$FRONTEND_ECR_REPO_NAME:latest"
    if ! docker tag frontend-app:latest "$FRONTEND_REPO_URI" ; then
        log_error "Failed to tag Frontend image"
    fi
    if ! docker push "$FRONTEND_REPO_URI" ; then
        log_error "Failed to push Frontend image to ECR"
    fi
    log_success "Frontend image pushed to ECR"

    # Now deploy with Terraform
    log_step "Initializing Terraform..."
    cd IaC || log_error "IaC directory not found"
    if ! terraform init -input=false ; then
        log_error "Failed to initialize Terraform"
    fi
    log_success "Terraform initialized"

    # Create terraform.tfvars file
    log_step "Creating terraform.tfvars..."
    cat > terraform.tfvars << EOF
aws_account_id = "$AWS_ACCOUNT_ID"
openai_api_key = "$OPENAI_API_KEY"
aws_region = "$AWS_REGION"
EOF
    log_success "terraform.tfvars created"

    # Apply Terraform configuration
    log_step "Applying Terraform configuration..."
    if ! terraform apply -auto-approve -input=false ; then
        log_error "Failed to apply Terraform configuration"
    fi
    log_success "Terraform configuration applied successfully"

    # Get WebSocket endpoint and ALB URL
    log_step "Getting endpoints..."
    WEBSOCKET_ENDPOINT=$(terraform output -raw websocket_endpoint)
    ALB_URL=$(terraform output -raw alb_url)
    S3_BUCKET_NAME=$(terraform output -raw s3_bucket_name)
    if [ -z "$WEBSOCKET_ENDPOINT" ] || [ -z "$ALB_URL" ] || [ -z "$S3_BUCKET_NAME" ]; then
        log_error "Failed to get endpoints"
    fi
    log_success "Deployment complete!"
    echo -e "${GREEN}WebSocket endpoint:${NC} $WEBSOCKET_ENDPOINT"
    echo -e "${GREEN}Frontend URL:${NC} $ALB_URL"

    # Update frontend environment variables
    log_step "Updating frontend environment variables..."
    cd ..
    cat > front/.env << EOF
AWS_REGION=${AWS_REGION}
AWS_S3_BUCKET=${S3_BUCKET_NAME}
NEXT_PUBLIC_WEBSOCKET_URL=${WEBSOCKET_ENDPOINT}
EOF
    log_success "Frontend environment variables updated"

    # Cleanup Docker images
    cleanup_docker
}

# Function to destroy infrastructure
destroy_infrastructure() {
    log_warning "This will destroy all infrastructure. Are you sure? (yes/no)"
    read -r response
    if [[ "$response" != "yes" ]]; then
        log_error "Operation cancelled"
        exit 1
    fi

    log_step "Destroying infrastructure..."
    cd IaC || exit 1

    # Get AWS Account ID if not set
    if [ -z "$AWS_ACCOUNT_ID" ]; then
        log_step "Getting AWS Account ID..."
        AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --region "$AWS_REGION")
        if [ -z "$AWS_ACCOUNT_ID" ]; then
            log_error "Failed to get AWS Account ID"
            exit 1
        fi
    fi

    # Get current AWS credentials
    log_step "Getting AWS credentials..."
    # Get current credentials from AWS CLI
    AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id)
    AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key)
    
    if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        log_error "Failed to get AWS credentials"
    fi

    # Export the credentials so they're available throughout the script
    export AWS_ACCESS_KEY_ID
    export AWS_SECRET_ACCESS_KEY

    # Check for required environment variables
    if [ -z "$OPENAI_API_KEY" ]; then
        log_warning "OPENAI_API_KEY not set. Using placeholder value for destroy..."
        OPENAI_API_KEY="placeholder"
    fi

    # Create terraform.tfvars with required variables
    log_step "Creating terraform.tfvars..."
    cat > terraform.tfvars << EOF
aws_account_id = "$AWS_ACCOUNT_ID"
openai_api_key = "$OPENAI_API_KEY"
aws_region = "$AWS_REGION"
EOF

    # Initialize terraform
    log_step "Initializing Terraform..."
    terraform init -input=false || log_error "Failed to initialize Terraform"
    
    # Run terraform destroy
    log_step "Running terraform destroy..."
    terraform destroy -auto-approve -input=false || log_error "Failed to destroy infrastructure"
    
    log_success "Terraform destroy completed"

    # Remove ECR repositories after terraform destroy
    log_step "Removing ECR repositories..."
    aws ecr delete-repository --repository-name "$LAMBDA_ECR_REPO_NAME" --region "$AWS_REGION" --force || true
    aws ecr delete-repository --repository-name "$FRONTEND_ECR_REPO_NAME" --region "$AWS_REGION" --force || true
    log_success "ECR repositories removed"

    # Cleanup local files
    log_step "Cleaning up local files..."
    rm -f terraform.tfvars
    rm -rf .terraform
    rm -f .terraform.lock.hcl
    rm -f terraform.tfstate*
    log_success "Local files cleaned up"

    # Cleanup Docker images
    cleanup_docker

    exit 0
}

# Main script
if [ "$1" = "--destroy" ]; then
    destroy_infrastructure
else
    check_prerequisites
    deploy_infrastructure 
fi 