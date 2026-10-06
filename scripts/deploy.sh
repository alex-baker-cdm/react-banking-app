#!/usr/bin/env bash
# Build the container image, push it to ECR and (first run only) create the App Runner service + alert pipeline.
# Later runs: the push to :latest auto-deploys App Runner; terraform apply picks up any infra changes.
set -euo pipefail

repoRoot="$(cd "$(dirname "$0")/.." && pwd)"
region="${AWS_REGION:-us-east-1}"
imageTag="${IMAGE_TAG:-$(git -C "$repoRoot" rev-parse --short HEAD)}"

cd "$repoRoot/infra"
terraform init -input=false >/dev/null
terraform apply -input=false -auto-approve -target=aws_ecr_repository.app
ecrUrl="$(terraform output -raw ecrRepositoryUrl)"

aws ecr get-login-password --region "$region" | docker login --username AWS --password-stdin "${ecrUrl%%/*}"
docker build --platform linux/amd64 -t "$ecrUrl:$imageTag" -t "$ecrUrl:latest" "$repoRoot"
docker push "$ecrUrl:$imageTag"
docker push "$ecrUrl:latest"

terraform apply -input=false -auto-approve
echo
echo "App:        $(terraform output -raw appUrl)"
echo "Log group:  $(terraform output -raw appLogGroup)"
echo "Alerts fn:  $(terraform output -raw alertsLambdaName)"
