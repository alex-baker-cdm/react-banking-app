variable "region" {
  type    = string
  default = "us-east-1"
}

variable "serviceName" {
  type    = string
  default = "wf-online-banking"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "appRepo" {
  description = "GitHub repository (owner/name) that holds the application code."
  type        = string
  default     = "alex-baker-cdm/react-banking-app"
}

variable "imageTag" {
  description = "ECR image tag App Runner tracks. Pushing a new image with this tag auto-deploys."
  type        = string
  default     = "latest"
}

variable "devinOrgId" {
  type    = string
  default = "org-b886dfaf7d824a7e887ed1513703f408"
}

variable "devinApiUrl" {
  type    = string
  default = "https://api.devin.ai/v3"
}

variable "devinCreateAsUserId" {
  description = "Optional Devin user id sessions are attributed to. Empty = the service user owning the API key."
  type        = string
  default     = ""
}

variable "appBranch" {
  description = "Branch the deployed image was built from; triage sessions fix and open PRs against it"
  type        = string
  default     = "master"
}
