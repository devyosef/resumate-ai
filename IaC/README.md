# ATS System Infrastructure as Code

This directory contains the Terraform configuration for deploying the ATS System infrastructure on AWS. The infrastructure is designed to provide a scalable, secure, and efficient environment for processing and optimizing resumes using AI.

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) installed (version 1.0.0 or later)
- [Docker](https://docs.docker.com/get-docker/) installed
- AWS account with appropriate permissions
- OpenAI API key

## Required AWS Services

The following AWS services will be created:
- Amazon ECR (for storing Lambda and Frontend container images)
- Amazon S3 (for storing resumes and templates)
- Amazon Textract (for document processing)
- AWS Lambda (container-based for processing resumes)
- Amazon API Gateway (WebSocket API for real-time communication)
- Amazon SNS (for Textract notifications)
- Amazon VPC (using default VPC)
- Amazon ECS (for running the frontend application)
- Application Load Balancer (for frontend traffic distribution)
- CloudWatch Logs (for logging and monitoring)
- IAM roles and policies

## Network Architecture

The infrastructure is deployed using the default VPC and subnets with the following networking components:
- Default VPC and subnets
- Security groups for:
  - Lambda function
  - ECS tasks
  - Application Load Balancer
- VPC endpoints for AWS services
- CORS configuration for S3 bucket
- WebSocket API Gateway for real-time communication

## Infrastructure Components

### Backend Services
- Lambda function (2048MB memory, 300s timeout)
- S3 bucket with versioning enabled
- Textract integration with SNS notifications
- WebSocket API Gateway for real-time updates

### Frontend Services
- ECS Fargate cluster
- Application Load Balancer
- ECS service with task definition
- CloudWatch logging

### Security
- IAM roles with least privilege principle
- Security groups with minimal required access
- S3 bucket versioning
- ECR repository encryption
- VPC isolation
- Secure environment variables

## Setup Instructions

The `build.sh` script provides a streamlined way to deploy the entire infrastructure. By default, it will:


Run the build script (to deploy the infrastructure):
   ```bash
   ./build.sh
   ```

The script will:
- Initialize Terraform
- Create all required AWS resources
- Build and push the Docker images to ECR
- Deploy the frontend application
- Display the WebSocket URL and ALB URL at the end of the process

Run the build script (to destroy the infrastructure):
   ```bash
   ./build.sh --destroy
   ```


## Security Considerations

- AWS credentials are stored in `terraform.tfvars` and should be kept secure
- OpenAI API key is stored as an environment variable in the Lambda function
- IAM roles follow the principle of least privilege
- S3 bucket versioning is enabled for better data protection
- ECR repository is created with default encryption settings
- Lambda functions run in private subnets for enhanced security
- Network access is controlled via security groups and VPC endpoints
- CORS is configured for secure S3 access
- All sensitive data is encrypted at rest
- Regular security updates through container image updates 