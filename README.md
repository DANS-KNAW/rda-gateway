<table align="center">
  <tr>
    <td align="center">
      <a href="https://dans.knaw.nl/" target="_blank">
        <img src="https://dans.knaw.nl/wp-content/uploads/2021/10/Logo-DANS.svg" width="400" alt="DANS Logo" />
      </a>
    </td>
    <td align="center">
      <a href="https://www.rd-alliance.org/" target="_blank">
        <img src="https://www.rd-alliance.org/wp-content/uploads/2024/04/RDA_Logotype_CMYK.png" width="350" alt="RDA LOGO" />
      </a>
    </td>
  </tr>
</table>


<p align="center">Micro-service for storing RDA Tiger deposits and annotations </p>

## Description

This service is part of the RDA Tiger initiative and is developed by the Data Archiving and Networked Services (DANS) in the Netherlands.
This micro-service is responsible for storing various deposits. It includes the following capabilities:

- CSV seed ingest
- Annotation creation

## Usage and Management

This repo includes two setups: a `production` setup and a `local` setup.

### Environment Variables Files

The service can use three different .env files: `.env.local`, `.env.development`, `.env.production`.

It is **_IMPORTANT_** to note that if multiple .env files are present, it will use them in the following order: `local -> development -> production`.

The easiest method is to simply copy the needed file from the `.env.example` file:

```bash
cp .env.example .env.local
```

### Local Usage

The following prerequisites are needed for the project:

- Valid RabbitMQ instance
- Docker
- Node/pnpm

#### Installation

```bash
# The service is set up with pnpm, so make sure to install packages with it.
pnpm install
```

#### Start the required Services

The required services are included in the `docker-compose.yml` file. You can start all needed services with the following command:

```bash
# Docker only supports .env files by default, so we need to specify the exact file.
docker compose up --env-file .env.local -d
```

#### Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

#### Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
