# weather-service

This repository contains the lambda code (built on ts/node), infrastructure code (built on Terraform) and ui code (build on react/node). See more details below

- About [infrastructure](./infrastructure/README.md)
- About [lambda](./lambda/README.md)
- About [ui](./ui/README.md)



# quick and easy setup 

## Step 1. 
Checklist: total 7 values need to be set, if we follow the readme of each one of them 

lambda/.env - 2 of them
- [ ] AWS_CREDENTIALS_PROFILE=replace_profile_name
- [ ] OPEN_WEATHER_API_KEY=api_key

scripts/deploy.sh - 4 of them
- [ ] ACCESS_KEY="aaaa"
- [ ] SECRET_KEY="bbbb"
- [ ] TF_STATE_BUCKET="bucket_name"
- [ ] OPEN_WEATHER_API_KEY="api_key"

ui/app/page.tsx - 1 of them, you may change it later after deployment if you wish
- [ ] url = "https://op64a8aate.execute-api.us-east-1.amazonaws.com/v1"
