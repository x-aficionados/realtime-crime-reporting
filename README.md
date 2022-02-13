# Real-time Crime Reporting

Design Document: https://www.notion.so/harsh8398/Interactive-Map-for-Crime-Reporting-8dbbf9a934db4fb080a5881f4c4c26db

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