output "websocket_endpoint" {
  description = "The WebSocket API endpoint"
  value       = "wss://${aws_apigatewayv2_api.websocket_api.id}.execute-api.${var.aws_region}.amazonaws.com/${var.environment}"
}

# Output ALB DNS
output "alb_url" {
  value       = "http://${aws_lb.frontend.dns_name}"
  description = "URL of the Application Load Balancer"
}