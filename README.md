# Real-time Crime Reporting

Design Document: https://www.notion.so/harsh8398/Interactive-Map-for-Crime-Reporting-8dbbf9a934db4fb080a5881f4c4c26db

### Sign Up or Use Google Auth to login to the application.
![sign_up_dark](https://user-images.githubusercontent.com/41751613/157589392-a895ee16-05f2-4144-8984-cd2041ec7193.PNG)

### Use either dark mode or light mode based on the system theme
![sign_up](https://user-images.githubusercontent.com/41751613/157589390-16fbc938-e390-4570-b908-395a6c6a713e.PNG)
![sign_in_dark](https://user-images.githubusercontent.com/41751613/157589385-06849b57-d686-4958-b4d9-04d2b622bad8.PNG)

### View and edit profile details
![profile_details_dark](https://user-images.githubusercontent.com/41751613/157589378-0323c461-af12-4663-b29c-ddd37222ad79.PNG)

### Report Crime by selecting a crime type and adding description (optional)
![report_crime](https://user-images.githubusercontent.com/41751613/157589389-603cc528-d2eb-4c7b-aff5-c7061cfcaf47.PNG)


## Setting Up Development Environment

### Pre-requisites

- [Docker](https://docs.docker.com/get-docker/)
- [Python>=3.9](https://www.python.org/downloads/)
- [Poetry](https://python-poetry.org/docs/#installation)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable)
- [Ngrok](https://ngrok.com/download)
- [Expo](https://docs.expo.dev/get-started/installation/)


### Generating JWT key pairs for auth service and api service to consume

1. Follow the steps mentioned in the auth service [README](./auth/README.md).
2. Follow the steps mentioned in the api service [README](./api/README.md).

### Setting up environment variables for docker services

1. Copy [.env.example](./.env.example) to `.env` at the project root
2. Replace placeholders (e.g. `<your client id>`) in .env file with your retrieved values

### Bootstart the services

- Finally, build the images and bootstart containerized services using docker-compose.
  ```shell
  docker-compose up
  ```

### Running react native app

1. Once docker services gets up and running, check `ngrok` service logs for generated temporary public URL:
   ```shell
   docker-compose logs --follow ngrok
   ```
   Output should look something as follows (see highlighted URL):
   > ngrok  | t=2022-02-12T17:38:00+0000 lvl=info msg="started tunnel" obj=tunnels name=command_line addr=http://webserver:80 url=**http://xyz.ap.ngrok.io**
2. Copy [app/.env.example](./app/.env.example) file to `app/.env` file.
3. Paste the ngrok provided public URL and add it to `app/.env` file created in previous step.
4. Also, provide values for other env variables in `app/.env`
5. `cd` into `app` directory and start the app with following command.
   ```shell
   yarn start
   ```
