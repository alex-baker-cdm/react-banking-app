resource "aws_iam_role" "appRunnerEcrAccess" {
  name = "${local.name}-apprunner-ecr-access"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "build.apprunner.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "appRunnerEcrAccess" {
  role       = aws_iam_role.appRunnerEcrAccess.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

resource "aws_apprunner_auto_scaling_configuration_version" "app" {
  auto_scaling_configuration_name = local.name
  max_concurrency                 = 100
  min_size                        = 1
  max_size                        = 2
}

resource "aws_apprunner_service" "app" {
  service_name = local.name

  source_configuration {
    auto_deployments_enabled = true

    authentication_configuration {
      access_role_arn = aws_iam_role.appRunnerEcrAccess.arn
    }

    image_repository {
      image_identifier      = "${aws_ecr_repository.app.repository_url}:${var.imageTag}"
      image_repository_type = "ECR"

      image_configuration {
        port = "8080"
        runtime_environment_variables = {
          APP_ENV      = var.environment
          SERVICE_NAME = var.serviceName
          NODE_ENV     = "production"
        }
      }
    }
  }

  instance_configuration {
    cpu    = "256"
    memory = "512"
  }

  health_check_configuration {
    protocol            = "HTTP"
    path                = "/health"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 1
    unhealthy_threshold = 5
  }

  auto_scaling_configuration_arn = aws_apprunner_auto_scaling_configuration_version.app.arn

  depends_on = [aws_iam_role_policy_attachment.appRunnerEcrAccess]
}

locals {
  # App Runner creates this group itself once the first instance starts logging.
  appLogGroup = "/aws/apprunner/${aws_apprunner_service.app.service_name}/${aws_apprunner_service.app.service_id}/application"
}
