# cph-service-backend

Core delivery platform Node.js Backend Template.

- [Quick Start Guide](#quick-start-guide)
  - [Local Configuration](#local-configuration)
  - [Install Dependancies](#install-dependancies)
  - [cph-form-test-frontend Project](#cph-form-test-frontend-project)
  - [Running the project](#running-the-project)
  - [Simulating the Form](#simulating-the-form)
- [Process](#process)
  - [Pull Requests](#pull-requests)
- [Standards](#standards)
- [Reference](#reference)
- [Testing](#testing)
- [Requirements](#requirements)
  - [Node.js](#nodejs)
- [Local development](#local-development)
  - [Setup](#setup)
  - [Git hooks](#git-hooks)
  - [Development](#development)
  - [Testing](#testing)
  - [Production](#production)
  - [Npm scripts](#npm-scripts)
  - [Update dependencies](#update-dependencies)
- [API endpoints](#api-endpoints)
- [Development helpers](#development-helpers)
  - [MongoDB Locks](#mongodb-locks)
  - [Proxy](#proxy)
- [Docker](#docker)
  - [Docker Compose](#docker-compose)
  - [Dependabot](#dependabot)
  - [SonarCloud](#sonarcloud)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Quick Start Guide

### Local Configuration

Configure the following files using the parameters provided.

#### .env

```text
MONGO_URI=mongodb://localhost:27017/
SQS_QUEUE_URL=http://localhost:4566/000000000000/cph-form
AWS_ENDPOINT_URL=http://localhost:4566
AWS_REGION=eu-west-2
AWS_DEFAULT_REGION=eu-west-2
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
```

#### ./compose/aws.env

```environment
AWS_REGION=eu-west-2
AWS_DEFAULT_REGION=eu-west-2
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_ENDPOINT_URL=http://localhost:4566
```

#### ./.vscode/launch.json

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "attach",
            "name": "Docker: Attach to cph-service-backend",
            "address": "localhost",
            "port": 9229,
            "localRoot": "${workspaceFolder}",
            "remoteRoot": "/home/node",
            "restart": true,
            "skipFiles": [
                "<node_internals>/**"
            ]
        }
    ]
}
```

### Install Dependencies

Run:

```bash
npm install
```

Followed by:

```bash
npx playwright install chromium
```

The above installs the playwright dependency for being able to auto fill the CPH form.

### cph-form-test-frontend Project

The [cph-form-test-frontend](https://github.com/DEFRA/cph-form-test-frontend) project should be available in the same directory as this project e.g.

```text
./projects/cph-service-backend
./projects/cph-form-test-frontend
```

This is achieved by navigating to your projects folder and running:

```text
git clone https://github.com/DEFRA/cph-form-test-frontend.git
```

As long as the code is available in the correct location, it is not necessary to do anything else. The cph-form-test-frontend is built and run from within this projects docker compose configuration.

### Geospatial Data

The parish lookup needs two large files that are not in git (`geospatial-data` is git-ignored). Without them `npm run services:up` fails with a `NoSuchKey` error.

| File | Size | Purpose |
| --- | --- | --- |
| `MAFF_Parishes_1998_PseudoCode.geojson` | ~261MB | MAFF parish boundaries, loaded into MongoDB at startup |
| `OSTN15_NTv2_OSGBtoETRS.gsb` | ~15MB | OSTN15 grid shift file for OSGB36 to WGS84 conversion |

1. Obtain both files. 
If you go to the CDP portal:
Go to the cph-service-backend service
Click the "Terminal" tab
Launch a terminal for the DEV environment
When the terminal is launched you can see the files by running:
aws s3 ls s3://dev-geospatial-data-c63f2/geospatial-data/
here is the documentation https://portal.cdp-int.defra.cloud/documentation/how-to/terminal.md#s3

You can then copy the files using this command 
aws s3 cp s3://<bucket-name>/<path>/<file-name> 
There are 2 files that need downaloading
1. MAFF_Parishes_1998_PseudoCode.geojson
2. OSTN15_NTv2_OSGBtoETRS.gsb 
These files can be downloaded from Paul's sharepoint link https://defra-my.sharepoint.com/shared?listurl=https%3A%2F%2Fdefra%2Dmy%2Esharepoint%2Ecom%2Fpersonal%2Fpaul%5Fandrews%5Fdefra%5Fgov%5Fuk%2FDocuments&e=5%3A37172f5a577143858d267e3d029983b2&sharingv2=true&fromShare=true&at=9&clickparams=eyAiWC1BcHBOYW1lIiA6ICJNaWNyb3NvZnQgT3V0bG9vayIsICJYLUFwcFZlcnNpb24iIDogIjE2LjAuMjA1MjcuMjAwODgiLCAiT1MiIDogIldpbmRvd3MiIH0%3D&cidOR=SPO&id=%2Fpersonal%2Fpaul%5Fandrews%5Fdefra%5Fgov%5Fuk%2FDocuments%2FCPH%2Fgeospatial%2Ddata&FolderCTID=0x01200066A4F01AA03B2F4A8D508527E0DDA51E 

OR can be dwonloaded from S3 bucket on CDP

2. Place them in `./geospatial-data/` at the project root, keeping the exact file names.
3. Start the stack with `npm run services:up`. Floci mounts `./geospatial-data` at `/geospatial-data`, and `compose/floci/start.d/10-setup-resources.sh` creates the `cph-geospatial-data` bucket and uploads both files on startup.

If you add or change the files after Floci has started, remove its data volume and restart so the startup script runs again:

```bash
npm run services:down
docker volume rm cph-service-backend_floci-data
npm run services:up
```

To check the files were loaded:

```bash
aws s3 ls s3://cph-geospatial-data/ --endpoint-url http://localhost:4566
```

### Verifying the Parish Lookup

Once the backend logs show the map data has loaded, call the lookup endpoint with an easting and northing (OSGB36):

```bash
curl "http://localhost:3001/api/countyparish?easting=<EASTING>&northing=<NORTHING>"
```

Expected result: county `10`, parish `241`. TODO: fill in the easting and northing used during testing, and paste the exact expected JSON response.

For the Test server, repeat the same request against its base URL with the same easting and northing, and confirm the same county and parish are returned.

### Running the project

The project and all necessary dependencies can be run through docker compose using:

```bash
npm run services:up
```

Alternatively the project can be run in debug mode using:

```bash
npm run services:up:debug
```

This starts the backend paused for debugging. In VS Code, run the `Docker: Attach to cph-service-backend` launch configuration above, then resume execution to complete startup.

The project can be stopped using:

```bash
npm run services:down
```

### Simulating the Form

There are two options for simulating the form data.

#### Publishing a SQS Message

Run:

```bash
npm run publish:sqs-test-message
```

This generates a basic SQS message that is published to the SQS queue for processing by cph-service-backend. The script that controls this can be found in ./scripts/publish-sqs-test-message.js.

#### Auto Fill the CPH Form

Run:

```bash
npm run fill-form:basic
```

This runs the docker hosted cph-form-test-frontend on [http://localhost:3000/](http://localhost:3000/) to simulate the live CPH form data being published to the SQS queue.

#### Creating Additional Versions of the Automated Form

The form is complex and has many different user flows. Therefore it may be necessary to create different versions of this script.

With the project running through:

```bash
npm run service:up
```

Run:

```bash
npx playwright codegen http://localhost:3000/
```

Fill in the form in the browser window that opens, then copy the generated code into a test file with the ./scripts folder e.g.

```text
./scripts/fill-cph-form-another-flow.spec.js
```

The additional file can be run using:

```json
npx playwright test scripts/fill-cph-form-basic-another-flow.spec.js --headed
```

or by adding a new script to the package.json file e.g.

```bash
"fill-form:another-flow": "npx playwright test scripts/fill-cph-form-basic-another-flow.spec.js --headed"
```

## Process

### Pull Requests

The pull request process is documented here: [Defra Software Development Standards - Pull Requests](https://defra.github.io/software-development-standards/processes/pull_requests/)

#### Branch Naming

Branch names will use the following format.

```text
{type}/{ticket-id}-{description}
```

- Type: Categorises the intent of the work right away.
- Ticket ID: Connects the branch to your project management tool (like Jira or GitHub Issues).
- Description: A short, kebab-case summary of the task.

##### Type

- feat: For introducing new functionality or features.
- fix: For resolving standard bugs or defects.
- chore: For maintenance tasks like updating dependencies or documentation.

#### Core Formatting Rules

- Use Lowercase and Hyphens: Write everything in lowercase alphanumeric characters and separate words using hyphens (kebab-case).
- Avoid Special Characters: Never use spaces, underscores, uppercase letters, or consecutive hyphens.
- Keep It Concise: Avoid overly long or ambiguous names; state the specific context clearly (e.g., feat/PROJ-123-dark-mode-toggle).

## Standards

- [Style Guide](docs/STYLEGUIDE.md)

## Reference

- [Core Delivery Platform](https://portal.cdp-int.defra.cloud/documentation/README.md)
- [Create CPH form field inventory (DEV)](docs/create-cph-form-field-mapping.md)

## Testing

Test files are named using the .test.js file extension. Tests should be located in the ./test folder using a structure that reflects the code structure e.g.

Code:

```text
./src/handlers/cphs/create.js
```

Tests:

```text
./test/handlers/cphs/create.test.js
````

To test the application run:

```bash
npm run test
```

## Requirements

### Node.js

Please install [Node.js](http://nodejs.org/) `>= v24` and [npm](https://nodejs.org/) `>= v11`. You will find it
easier to use the Node Version Manager [nvm](https://github.com/creationix/nvm)

To use the correct version of Node.js for this application, via nvm:

```bash
cd cph-service-backend
nvm use
```

## Local development

### Setup

Install application dependencies:

```bash
npm install
```

### Git hooks

Install git hooks (optional)

```bash
npm run git:hooks
```

### Development

To run the application in `development` mode run:

```bash
npm run dev
```

### Production

To mimic the application running in `production` mode locally run:

```bash
npm start
```

### Npm scripts

All available Npm scripts can be seen in [package.json](./package.json).
To view them in your command line run:

```bash
npm run
```

### Update dependencies

To update dependencies use [npm-check-updates](https://github.com/raineorshine/npm-check-updates):

> The following script is a good start. Check out all the options on
> the [npm-check-updates](https://github.com/raineorshine/npm-check-updates)

```bash
ncu --interactive --format group
```

## API endpoints

| Endpoint             | Description                    |
| :------------------- | :----------------------------- |
| `GET: /health`       | Health                         |

## Development helpers

### MongoDB Locks

If you require a write lock for Mongo you can acquire it via `server.locker` or `request.locker`:

```javascript
async function doStuff(server) {
  const lock = await server.locker.lock('unique-resource-name')

  if (!lock) {
    // Lock unavailable
    return
  }

  try {
    // do stuff
  } finally {
    await lock.free()
  }
}
```

Keep it small and atomic.

You may use **using** for the lock resource management.
Note test coverage reports do not like that syntax.

```javascript
async function doStuff(server) {
  await using lock = await server.locker.lock('unique-resource-name')

  if (!lock) {
    // Lock unavailable
    return
  }

  // do stuff

  // lock automatically released
}
```

Helper methods are also available in `/src/helpers/mongo-lock.js`.

### Proxy

We are using forward-proxy which is set up by default. To make use of this: `import { fetch } from 'undici'` then
because of the `setGlobalDispatcher(new ProxyAgent(proxyUrl))` calls will use the ProxyAgent Dispatcher

If you are not using Wreck, Axios or Undici or a similar http that uses `Request`. Then you may have to provide the
proxy dispatcher:

To add the dispatcher to your own client:

```javascript
import { ProxyAgent } from 'undici'

return await fetch(url, {
  dispatcher: new ProxyAgent({
    uri: proxyUrl,
    keepAliveTimeout: 10,
    keepAliveMaxTimeout: 10
  })
})
```

## Docker

Build:

```bash
docker build --no-cache --tag cph-service-backend .
```

Run:

```bash
docker run -e PORT=3001 -p 3001:3001 cph-service-backend
```

### Docker Compose

A local environment with:

- Floci for AWS services (S3, SQS, SNS etc)
- Redis
- MongoDB
- This service.
- A commented out frontend example.

```bash
docker compose up --build -d
```

Mock AWS resources can be created when Floci starts up by editing the scripts in `./compose/floci/start.d/`.
MongoDB records can also be created when Mongo starts by editing the scripts in `./compose/mongo/`.

### Dependabot

We have added an example dependabot configuration file to the repository. You can enable it by renaming
the [.github/example.dependabot.yml](.github/example.dependabot.yml) to `.github/dependabot.yml`

### SonarCloud

Instructions for setting up SonarCloud can be found in [sonar-project.properties](./sonar-project.properties)

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
