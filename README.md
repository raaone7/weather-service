# weather-service

This repository contains the lambda code (built on ts/node), infrastructure code (built on Terraform) and ui code (build on react/node). See more details below

- About [infrastructure](./infrastructure/README.md)
- About [lambda](./lambda/README.md)
- About [ui](./ui/README.md)



# quick and easy setup (ETA 10 mins)

## Step 1 - setting credentials
Checklist: total 6 values need to be set, alternatively we follow the readme of each one of them 

lambda/.env - 2 of them
- [ ] AWS_CREDENTIALS_PROFILE=replace_profile_name
- [ ] OPEN_WEATHER_API_KEY=api_key

scripts/deploy.sh - 4 of them
- [ ] ACCESS_KEY="aaaa"
- [ ] SECRET_KEY="bbbb"
- [ ] TF_STATE_BUCKET="bucket_name"
- [ ] OPEN_WEATHER_API_KEY="api_key"

## Step 2 - installing dependencies
cd lambda
pnpm i or npm i
cd ..

## Step 3 - spinning up infrastrucuture
cd scripts
sh build.sh
sh deploy.sh
cd ..

## Step 4 - testing 
cd lambda
pnpm test
cd .. 
cd ui 
pnpm i
pnpm dev

open http://localhost:3000/ , give it a shot

change to new api been spun up above at below location
ui/app/page.tsx - 1 of them, you may change it later after deployment
- [ ] url = "https://op64a8aate.execute-api.us-east-1.amazonaws.com/v1"
