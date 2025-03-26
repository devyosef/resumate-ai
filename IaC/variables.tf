variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "ats-system-v2"
}

variable "environment" {
  description = "Environment (e.g., dev, prod)"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "openai_api_key" {
  description = "OpenAI API key"
  type        = string
  sensitive   = true
}

variable "openai_model" {
  description = "OpenAI model"
  type        = string
  default     = "gpt-4o-mini"
}

variable "aws_account_id" {
  description = "AWS Account ID"
  type        = string
} 