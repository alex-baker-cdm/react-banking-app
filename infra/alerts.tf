resource "aws_secretsmanager_secret" "devinApiKey" {
  name        = "${var.serviceName}/${var.environment}/devin-api-key"
  description = "Devin service-user API key used by the alerts Lambda to open triage sessions. Populated out of band."
}

resource "aws_secretsmanager_secret_version" "devinApiKeyPlaceholder" {
  secret_id     = aws_secretsmanager_secret.devinApiKey.id
  secret_string = "REPLACE_ME"

  lifecycle {
    ignore_changes = [secret_string]
  }
}

data "archive_file" "alertsLambda" {
  type        = "zip"
  source_file = "${path.module}/lambda/alerts.py"
  output_path = "${path.module}/build/alerts.zip"
}

resource "aws_iam_role" "alertsLambda" {
  name = "${local.name}-alerts-lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "alertsLambdaBasic" {
  role       = aws_iam_role.alertsLambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "alertsLambda" {
  name = "read-devin-key"
  role = aws_iam_role.alertsLambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = aws_secretsmanager_secret.devinApiKey.arn
    }]
  })
}

resource "aws_cloudwatch_log_group" "alertsLambda" {
  name              = "/aws/lambda/${local.name}-alerts"
  retention_in_days = 30
}

resource "aws_lambda_function" "alerts" {
  function_name    = "${local.name}-alerts"
  description      = "Opens a Devin triage session for every ERROR log line emitted by ${var.serviceName}."
  role             = aws_iam_role.alertsLambda.arn
  runtime          = "python3.12"
  handler          = "alerts.handler"
  filename         = data.archive_file.alertsLambda.output_path
  source_code_hash = data.archive_file.alertsLambda.output_base64sha256
  timeout          = 60
  memory_size      = 256

  environment {
    variables = {
      ENVIRONMENT             = var.environment
      APP_REPO                = var.appRepo
      APP_BRANCH              = var.appBranch
      APP_URL                 = "https://${aws_apprunner_service.app.service_url}"
      APP_LOG_GROUP           = local.appLogGroup
      DEVIN_API_URL           = var.devinApiUrl
      DEVIN_ORG_ID            = var.devinOrgId
      DEVIN_CREATE_AS_USER_ID = var.devinCreateAsUserId
      DEVIN_KEY_SECRET_ARN    = aws_secretsmanager_secret.devinApiKey.arn
    }
  }

  depends_on = [aws_cloudwatch_log_group.alertsLambda, aws_iam_role_policy_attachment.alertsLambdaBasic]
}

resource "aws_lambda_permission" "cloudwatchLogs" {
  statement_id  = "AllowAppLogsSubscription"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.alerts.function_name
  principal     = "logs.${var.region}.amazonaws.com"
  source_arn    = "arn:aws:logs:${var.region}:${data.aws_caller_identity.current.account_id}:log-group:${local.appLogGroup}:*"
}

resource "aws_cloudwatch_log_subscription_filter" "appErrors" {
  name            = "${local.name}-errors-to-devin"
  log_group_name  = local.appLogGroup
  filter_pattern  = "{ $.level = \"ERROR\" }"
  destination_arn = aws_lambda_function.alerts.arn

  depends_on = [aws_lambda_permission.cloudwatchLogs]
}
