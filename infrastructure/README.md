## How to build and deploy

## A:  Manual step
- Create a bucket (or use existing one) for storing terraform state

## B: Build & Deploy (Local)
In the deploy.sh file under scripts directory, add the following
1. AWS_ACCESS_KEY - key of user or role
2. AWS_SECRET_KEY - secret of user or role
3. TF_STATE_BUCKET - name of bucket created in step A
4. OPEN_WEATHER_API_KEY - open weather api key for making API calls
Note: access_key, secret_key should allow reading/writing to the bucket in step A
5. Run build script from scripts folder
    ```sh
    sh build.sh
    ```
6. Run deploy script from scripts folder
    ```sh
    sh deploy.sh
    ```
7. OAS file for enpoint could be found under API Gateway> APIs > api_id > Export, and export latest configuration as JSON, sample OAS30_latest.json is saved in scripts folder