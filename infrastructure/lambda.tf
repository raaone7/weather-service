## Lambda

### S3 Bucket for storing lambda builds
resource "aws_s3_bucket" "lambda_assets" {
  bucket = "lambda-assets-${local.accountId}"
  tags = {
    infrastructure = "Terraform"
  }
}

### Lambda execution role
data "aws_iam_policy_document" "lambda_log_access" {
  statement {
    sid       = "LambdaLogAccess"
    effect    = "Allow"
    resources = ["arn:aws:logs:${local.region}:${local.accountId}:log-group:*"]
    actions = [
      "logs:PutLogEvents",
      "logs:CreateLogStream",
      "logs:CreateLogGroup"
    ]
  }
}

data "aws_iam_policy_document" "lambda_dynamodb_access" {
  statement {
    sid       = "LambdaDynamodbAccess"
    effect    = "Allow"
    resources = ["arn:aws:dynamodb:${local.region}:${local.accountId}:table/*"]
    actions = [
      "dynamodb:BatchGet*",
      "dynamodb:DescribeStream",
      "dynamodb:DescribeTable",
      "dynamodb:Get*",
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:BatchWrite*",
      "dynamodb:CreateTable",
      "dynamodb:Delete*",
      "dynamodb:Update*",
      "dynamodb:PutItem"
    ]
  }
}

resource "aws_iam_role" "lambda_execution_role" {
  name = "lambda-execution-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })

  inline_policy {
    name   = "LambdaLogAccess"
    policy = data.aws_iam_policy_document.lambda_log_access.json
  }

  inline_policy {
    name   = "LambdaDynamodbAccess"
    policy = data.aws_iam_policy_document.lambda_dynamodb_access.json
  }
}

## log group
resource "aws_cloudwatch_log_group" "weather_service" {
  name              = "/aws/lambda/weather-service"
  retention_in_days = 14
}

## lambda
module "weather_service_lambda_function" {
  source = "terraform-aws-modules/lambda/aws"

  function_name                      = "weather-service"
  description                        = "weather-service"
  handler                            = "index.handler"
  logging_log_format                 = "JSON"
  publish                            = false
  attach_cloudwatch_logs_policy      = false
  attach_create_log_group_permission = false
  create_role                        = false
  use_existing_cloudwatch_log_group  = true
  lambda_role                        = aws_iam_role.lambda_execution_role.arn
  logging_log_group                  = aws_cloudwatch_log_group.weather_service.id
  store_on_s3                        = true
  s3_bucket                          = aws_s3_bucket.lambda_assets.id

  memory_size = 512
  runtime     = "nodejs20.x"
  source_path = [{
    path             = "../lambda/build",
    npm_requirements = false,
  }]
  architectures = ["arm64"]

  environment_variables = {
    APP_ENV   = "QA"
    NODE_ENV  = "production"
    LOG_LEVEL = "debug"
    OPEN_WEATHER_API_KEY   = var.open_weather_api_key
  }

  tags = {
    infrastructure = "Terraform"
  }
}
