#!/bin/bash

set -e

cd ..
cd infrastructure

ACCESS_KEY="xxxx"
SECRET_KEY="abcd"
TF_STATE_BUCKET="your-bucket-name-here"
OPEN_WEATHER_API_KEY="xxx"

terraform init \
-backend-config="access_key=$ACCESS_KEY" \
-backend-config="secret_key=$SECRET_KEY" \
-backend-config="bucket=$TF_STATE_BUCKET"

terraform plan \
-var="aws_access_key=$ACCESS_KEY" \
-var="aws_secret_key=$SECRET_KEY" \
-var="open_weather_api_key=$OPEN_WEATHER_API_KEY"

terraform apply \
-auto-approve \
-var="aws_access_key=$ACCESS_KEY" \
-var="aws_secret_key=$SECRET_KEY" \
-var="open_weather_api_key=$OPEN_WEATHER_API_KEY"