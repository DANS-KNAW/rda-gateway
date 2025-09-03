# RDA-GATEWAY

<p align="center">
  <a href="http://rd-alliance.org/" target="blank"><img src="https://www.rd-alliance.org/wp-content/themes/rda/assets/images/logo.png" width="240" alt="RDA LOGO" /></a>
  <a href="https://www.rd-alliance.org/working-groups/rda-tiger/" target="blank"><img src="./docs/assets/rda-tiger-logo.png" width="240" alt="RDA TIGER PROJECT LOGO" /></a>
  <a href="https://dans.knaw.nl/" target="blank"><img src="https://dans.knaw.nl/wp-content/uploads/2025/07/DANS_Logo_RGB.svg" width="240" alt="DANS KNAW LOGO" /></a>
</p>

## Description

This service provides the backend infrastructure for the [RDA TIGER](https://www.rd-alliance.org/working-groups/rda-tiger/) project, facilitating annotation management, deposit storage, and vocabulary services for RDA domain specific terms.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Usage

### Development

The main method of working on this project will be through Docker. The application itself is containerized and that includes the development flow. We use Docker Compose in watch mode. We expect that you run this in debug mode as a debugger is **_ALWAYS_** superior to logging when developing. The section below describes how to set up the application in combination with a debugger.

#### Prerequisites:

- [Docker](https://docs.docker.com/get-started/get-docker/)
- IDE (options: [`vscode`](https://code.visualstudio.com/), _more to be added_)

#### VSCODE:

To make the debugger attach to the container in VS Code we do the following.

1. Copy the content of `.env.example` to `.env`

```bash
cp .env.example .env
```

2. Start services using docker compose

```bash
docker compose up --watch
```

3. Create the debug configuration file at `/.vscode/launch.json`.

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach to Docker NestJS",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "address": "localhost",
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "/app",
      "restart": true,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

4. Navigate to `Run and Debug (Ctrl+Shift+D on Linux/Win)` and press `Start Debugging (F5)`. You might have to select the configuration from the dropdown; it will be called `Attach to Docker NestJS`.

5. You should see the following message after starting the session `Debugger attached.` in the terminal.
