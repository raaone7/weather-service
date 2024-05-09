terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.48.0"
    }
  }
  backend "s3" {
    key    = "tfstate"
    region = "us-east-1"
  }
  required_version = "1.8.2" # Terraform Version
}

data "aws_caller_identity" "current" {}

variable "aws_access_key" { type = string }
variable "aws_secret_key" { type = string }
variable "open_weather_api_key" { type = string }

locals {
  region    = "us-east-1"
  accountId = data.aws_caller_identity.current.account_id
}

provider "aws" {
  region     = local.region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}