output "appUrl" {
  value = "https://${aws_apprunner_service.app.service_url}"
}

output "appServiceArn" {
  value = aws_apprunner_service.app.arn
}

output "appLogGroup" {
  value = local.appLogGroup
}

output "ecrRepositoryUrl" {
  value = aws_ecr_repository.app.repository_url
}

output "alertsLambdaName" {
  value = aws_lambda_function.alerts.function_name
}

output "devinApiKeySecretArn" {
  value = aws_secretsmanager_secret.devinApiKey.arn
}

output "githubDeployRoleArn" {
  value = aws_iam_role.githubDeploy.arn
}
