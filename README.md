# Research Data Collector Platform 

## Pre-requisites
- Node.js
- Yarn
- Docker
- Docker Compose

## Setup
- Clone the repository
- Run `yarn install` to install the dependencies
- Run `docker-compose up` to start the database and redis server
- Run `yarn start:dev` to start the application in development watch mode


## Useful Commands

### Installation

```bash
$ yarn install
```

### Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

### Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```
