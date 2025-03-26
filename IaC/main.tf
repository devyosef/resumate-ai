terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# S3 bucket for storing files and templates
resource "aws_s3_bucket" "resume_bucket" {
  bucket        = "${var.project_name}-${var.environment}-resume-bucket"
  force_destroy = true
}

# Create templates folder in S3
resource "aws_s3_object" "templates_folder" {
  bucket = aws_s3_bucket.resume_bucket.id
  key    = "templates/"
}

# Upload resume template to S3
resource "aws_s3_object" "resume_template" {
  bucket       = aws_s3_bucket.resume_bucket.id
  key          = "templates/resume_template.html"
  source       = "../lambda/templates/resume_template.html"
  content_type = "text/html"
  depends_on   = [aws_s3_object.templates_folder]
}

resource "aws_s3_bucket_versioning" "resume_bucket_versioning" {
  bucket = aws_s3_bucket.resume_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

# SNS Topic for Textract notifications
resource "aws_sns_topic" "textract_notifications" {
  name = "${var.project_name}-${var.environment}-textract-notifications"
}

# SNS Topic Policy
resource "aws_sns_topic_policy" "textract_notifications_policy" {
  arn = aws_sns_topic.textract_notifications.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "textract.amazonaws.com"
        }
        Action   = "SNS:Publish"
        Resource = aws_sns_topic.textract_notifications.arn
      }
    ]
  })
}

# SNS Subscription for Lambda
resource "aws_sns_topic_subscription" "lambda_subscription" {
  topic_arn = aws_sns_topic.textract_notifications.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.resume_processor.arn
}

# Lambda permission for SNS
resource "aws_lambda_permission" "sns_permission" {
  statement_id  = "AllowSNSTrigger"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.resume_processor.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.textract_notifications.arn
}

# IAM role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-${var.environment}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy for Lambda
resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.project_name}-${var.environment}-lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket",
          "textract:StartDocumentTextDetection",
          "textract:GetDocumentTextDetection",
          "lambda:InvokeFunction",
          "apigateway:PostToConnection",
          "apigateway:ManageConnections",
          "execute-api:ManageConnections",
          "execute-api:Invoke",
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "sns:Subscribe",
          "sns:Unsubscribe",
          "sns:ListSubscriptionsByTopic",
          "sns:GetTopicAttributes",
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface",
          "ec2:AssignPrivateIpAddresses",
          "ec2:UnassignPrivateIpAddresses",
          "ec2:DescribeVpcEndpoints",
          "ec2:DescribeVpcAttribute",
          "ec2:DescribeSubnets",
          "ec2:DescribeSecurityGroups",
          "ec2:DescribeDhcpOptions",
          "ec2:DescribeVpcs",
        ]
        Resource = [
          "${aws_s3_bucket.resume_bucket.arn}/*",
          "${aws_s3_bucket.resume_bucket.arn}",
          "arn:aws:textract:${var.aws_region}:*:*",
          "arn:aws:lambda:${var.aws_region}:*:function:${aws_lambda_function.resume_processor.function_name}",
          "${aws_apigatewayv2_api.websocket_api.execution_arn}/*/*",
          "${aws_sns_topic.textract_notifications.arn}",
          "arn:aws:execute-api:${var.aws_region}:*:${aws_apigatewayv2_api.websocket_api.id}/*",
          "*"
        ]
        }, {
        Effect = "Allow"
        Action = [
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface",
          "ec2:AssignPrivateIpAddresses",
          "ec2:UnassignPrivateIpAddresses"
        ]
        Resource = "*"
      }
    ]
  })
}

# IAM role for SNS
resource "aws_iam_role" "sns_role" {
  name = "${var.project_name}-${var.environment}-sns-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "sns.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy for SNS
resource "aws_iam_role_policy" "sns_policy" {
  name = "${var.project_name}-${var.environment}-sns-policy"
  role = aws_iam_role.sns_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = [
          aws_lambda_function.resume_processor.arn
        ]
      }
    ]
  })
}

# Lambda function using container image
resource "aws_lambda_function" "resume_processor" {
  function_name = "${var.project_name}-${var.environment}-resume-processor"
  role          = aws_iam_role.lambda_role.arn
  package_type  = "Image"
  image_uri     = "${data.aws_ecr_repository.lambda_repo.repository_url}:latest"
  timeout       = 300
  memory_size   = 2048

  image_config {
    command = ["lambda_function.lambda_handler"]
  }

  environment {
    variables = {
      AWS_TEXTRACT_REGION = var.aws_region
      AWS_S3_BUCKET       = aws_s3_bucket.resume_bucket.id
      AWS_SNS_TOPIC_ARN   = aws_sns_topic.textract_notifications.arn
      AWS_SNS_ROLE_ARN    = aws_iam_role.sns_role.arn
      OPENAI_API          = var.openai_api_key
      OPENAI_MODEL        = var.openai_model
      AWS_APIGW_DOMAIN    = "${aws_apigatewayv2_api.websocket_api.id}.execute-api.${var.aws_region}.amazonaws.com"
      AWS_APIGW_STAGE     = var.environment
      ENVIRONMENT         = var.environment
    }
  }
}

# Data source for existing ECR repository
data "aws_ecr_repository" "lambda_repo" {
  name = "${var.project_name}-${var.environment}-lambda-repo"
}

# WebSocket API
resource "aws_apigatewayv2_api" "websocket_api" {
  name                       = "${var.project_name}-${var.environment}-websocket-api"
  protocol_type              = "WEBSOCKET"
  route_selection_expression = "$request.body.action"
}

# WebSocket API Stage
resource "aws_apigatewayv2_stage" "websocket_stage" {
  api_id      = aws_apigatewayv2_api.websocket_api.id
  name        = var.environment
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit   = 10000
    throttling_rate_limit    = 10000
    detailed_metrics_enabled = true
  }
}

# WebSocket API Integration
resource "aws_apigatewayv2_integration" "websocket_integration" {
  api_id           = aws_apigatewayv2_api.websocket_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.resume_processor.invoke_arn
}

# WebSocket API Routes
resource "aws_apigatewayv2_route" "websocket_connect" {
  api_id    = aws_apigatewayv2_api.websocket_api.id
  route_key = "$connect"
  target    = "integrations/${aws_apigatewayv2_integration.websocket_integration.id}"
}

resource "aws_apigatewayv2_route" "websocket_disconnect" {
  api_id    = aws_apigatewayv2_api.websocket_api.id
  route_key = "$disconnect"
  target    = "integrations/${aws_apigatewayv2_integration.websocket_integration.id}"
}

resource "aws_apigatewayv2_route" "websocket_default" {
  api_id    = aws_apigatewayv2_api.websocket_api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.websocket_integration.id}"
}

resource "aws_apigatewayv2_route" "process_resume" {
  api_id    = aws_apigatewayv2_api.websocket_api.id
  route_key = "process_resume"
  target    = "integrations/${aws_apigatewayv2_integration.websocket_integration.id}"
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.resume_processor.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.websocket_api.execution_arn}/*/*"
}

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.resume_processor.function_name}"
  retention_in_days = 14
}

# Attach CloudWatch Logs policy to Lambda role
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Add VPC access permissions for Lambda
resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# S3 CORS configuration
resource "aws_s3_bucket_cors_configuration" "resume_bucket_cors" {
  bucket = aws_s3_bucket.resume_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE"]
    allowed_origins = ["http://${aws_lb.frontend.dns_name}"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "frontend_cluster" {
  name = "${var.project_name}-${var.environment}-frontend-cluster"
}

resource "aws_ecs_cluster_capacity_providers" "frontend_cluster_cp" {
  cluster_name       = aws_ecs_cluster.frontend_cluster.name
  capacity_providers = ["FARGATE"]
}

# Data source for existing Frontend ECR repository
data "aws_ecr_repository" "frontend_repo" {
  name = "${var.project_name}-${var.environment}-frontend-repo"
}

# IAM role for ECS task
resource "aws_iam_role" "ecs_task_role" {
  name = "${var.project_name}-${var.environment}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy for ECS task role
resource "aws_iam_role_policy" "ecs_task_policy" {
  name = "${var.project_name}-${var.environment}-ecs-task-policy"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
        ]
        Resource = [
          "${aws_s3_bucket.resume_bucket.arn}/*",
          aws_s3_bucket.resume_bucket.arn
        ]
      }
    ]
  })
}

# Task Definition
resource "aws_ecs_task_definition" "frontend_task" {
  family                   = "${var.project_name}-${var.environment}-frontend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "1024"  #(512)
  memory                   = "2048" #(1024)
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  

  container_definitions = jsonencode([
    {
      name  = "frontend"
      image = "${data.aws_ecr_repository.frontend_repo.repository_url}:latest"
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "AWS_REGION"
          value = var.aws_region
        },
        {
          name  = "AWS_S3_BUCKET"
          value = aws_s3_bucket.resume_bucket.id
        },
        {
          name  = "NEXT_PUBLIC_WEBSOCKET_URL"
          value = "wss://${aws_apigatewayv2_api.websocket_api.id}.execute-api.${var.aws_region}.amazonaws.com/${var.environment}"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.project_name}-${var.environment}-frontend"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
          "awslogs-create-group"  = "true"
        }
      }
    }
  ])

  depends_on = [
    aws_apigatewayv2_api.websocket_api,
    aws_apigatewayv2_stage.websocket_stage,
    aws_s3_bucket.resume_bucket
  ]
}

# ALB
resource "aws_lb" "frontend" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = data.aws_subnets.default.ids
}

resource "aws_lb_target_group" "frontend" {
  name        = "${var.project_name}-${var.environment}-tg"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = data.aws_vpc.default.id

  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 10
  }
}

resource "aws_lb_listener" "frontend" {
  load_balancer_arn = aws_lb.frontend.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# ECS Service
resource "aws_ecs_service" "frontend" {
  name            = "${var.project_name}-${var.environment}-frontend-service"
  cluster         = aws_ecs_cluster.frontend_cluster.id
  task_definition = aws_ecs_task_definition.frontend_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 3000
  }

  depends_on = [
    aws_lb_listener.frontend,
    aws_apigatewayv2_api.websocket_api,
    aws_apigatewayv2_stage.websocket_stage
  ]
}

# IAM Roles
resource "aws_iam_role" "ecs_execution_role" {
  name = "${var.project_name}-${var.environment}-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# CloudWatch Log Group for ECS
resource "aws_cloudwatch_log_group" "frontend_logs" {
  name              = "/ecs/${var.project_name}-${var.environment}-frontend"
  retention_in_days = 14
}

# Add data sources for default VPC and subnets
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# SG for Lambda
resource "aws_security_group" "lambda" {
  name        = "${var.project_name}-${var.environment}-lambda-sg"
  description = "SG for Lambda function"
  vpc_id      = data.aws_vpc.default.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# SG for ALB
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-${var.environment}-alb-sg"
  description = "SG for Application Load Balancer"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-alb-sg"
  }
}

# SG for ECS Tasks
resource "aws_security_group" "ecs_tasks" {
  name        = "${var.project_name}-${var.environment}-ecs-tasks-sg"
  description = "SG for ECS tasks"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-tasks-sg"
  }
}