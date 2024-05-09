resource "aws_dynamodb_table" "network_log_table" {
  name         = "NetworkLog"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  attribute {
    name = "id"
    type = "S"
  }
  tags = {
    infrastructure = "Terraform"
  }
}

resource "aws_dynamodb_table" "weather_history" {
  name         = "WeatherHistory"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "city"
  range_key    = "createdAt"
  attribute {
    name = "city"
    type = "S"
  }
  attribute {
    name = "createdAt"
    type = "S"
  }
  tags = {
    infrastructure = "Terraform"
  }
}

resource "aws_dynamodb_table" "city" {
  name         = "City"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "city"

  attribute {
    name = "city"
    type = "S"
  }
  tags = {
    infrastructure = "Terraform"
  }
}
