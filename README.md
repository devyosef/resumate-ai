# 🎯 ResuMate - AI-Powered Resume Optimization System

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.1.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Flowbite](https://img.shields.io/badge/Flowbite-0.10.2-3B82F6?style=for-the-badge&logo=flowbite)](https://flowbite.com/)
[![Docker](https://img.shields.io/badge/Docker-27.1.1-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Enabled-4479A1?style=for-the-badge&logo=websocket)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
[![Terraform](https://img.shields.io/badge/Terraform-1.7.5-7B42BC?style=for-the-badge&logo=terraform)](https://www.terraform.io/)
[![AWS](https://img.shields.io/badge/AWS-Infrastructure-orange?style=for-the-badge&logo=amazon-aws)](https://aws.amazon.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-Powered-412991?style=for-the-badge&logo=openai)](https://openai.com/)
[![Python](https://img.shields.io/badge/Python-3.10-blue?style=for-the-badge&logo=python)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)

</div>

## 📖 Overview

ResuMate is an intelligent resume optimization system that leverages AI to help job seekers tailor their resumes to specific job descriptions. The system analyzes resumes using AWS Textract, processes them with OpenAI's GPT models, and provides real-time feedback and optimization suggestions. (**97% Project Completed**)

## 🚀 Features

- 📄 PDF Resume Upload & Analysis
- 🤖 AI-Powered Resume Optimization
- ⚡ Real-time Processing Status
- 📊 Resume Match Statistics
- 🌓 Dark/Light Mode Support
- 🔒 Secure File Handling
- 📱 Responsive Design

## 🛠️ Tech Stack

### Frontend
- Next.js 15
- TypeScript
- Tailwind CSS
- Flowbite Components

### Backend
- AWS Lambda (Container)
- Python 3.10
- OpenAI API
- AWS Services:
  - API Gateway (WebSocket)
  - S3
  - Textract
  - SNS
  - ECR
  - ECS (Fargate)
  - Application Load Balancer
  - CloudWatch Logs
  - VPC (Default)
  - IAM
  - Security Groups

### Infrastructure
- Terraform
- Docker
- AWS VPC & Networking

## 📋 Prerequisites

1. **AWS Account** with appropriate permissions
2. **OpenAI API Key**
3. Install the following tools:
   - Node.js (v18+)
   - Docker
   - Terraform (v1.0.0+)
   - AWS CLI

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/resumate-ai.git
cd resumate
```

### 2. Add AWS Prerequisites (to add access and secret keys)
```bash
aws configure
```

### 3. Add OpenAI API Key
```bash
export OPENAI_API_KEY="sk-proj-********************"
```

### 4. Deploy the project
```bash
chmod +x build.sh
./build.sh
```

## 🚀 Running the Application


**At the end the build, a frontend URL  will be logged in the console to use the application**

## 📁 Project Structure 

```
resumate/
├── front/                  # Frontend application
│   ├── app/                # Next.js application
│   │   ├── components/     # React components
│   │   ├── api/            # API routes
│   │   └── assets/         # Static assets
│   ├── public/             # Public assets
│   └── package.json        # Frontend dependencies
├── lambda/                 # Lambda function code
│   ├── templates/          # Templates folder
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Container configuration
|   └── lambda_function.py  # Source code
└── IaC/                    # Infrastructure as Code
    ├── main.tf             # Main Terraform configuration
    ├── variables.tf        # Terraform variables
    └── outputs.tf          # Terraform outputs
```

## 🔐 Security Considerations

- S3 bucket configured with appropriate permissions
- ECR repository uses encryption at rest
- All network traffic is encrypted in transit
- IAM roles follow principle of least privilege

## 🌐 Environment Variables

### Infrastructure (terraform.tfvars)
```hcl
aws_region     = "your_region"
aws_account_id = "your_account_id"
openai_api_key = "your_openai_key"
```

## 🔄 Workflow

1. User uploads resume (PDF) and job description
2. Frontend sends files to S3
3. WebSocket connection established for real-time updates
4. Lambda processes the resume using Textract
5. AI analyzes and optimizes the resume
6. Results returned via WebSocket with:
   - Match percentage before optimization
   - Match percentage after optimization
   - Optimization improvement percentage
7. User receives optimized resume and statistics