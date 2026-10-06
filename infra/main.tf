terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.80"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.6"
    }
  }

  backend "s3" {
    bucket       = "truist-digital-banking-tfstate-438468714515"
    key          = "wf-online-banking/prod/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = local.commonTags
  }
}

data "aws_caller_identity" "current" {}

locals {
  name = "${var.serviceName}-${var.environment}"

  commonTags = {
    Service     = var.serviceName
    Environment = var.environment
    Owner       = "alex.baker"
    ManagedBy   = "terraform"
    Demo        = "devin-auto-triage"
  }
}
