# FFC Pay Request Editor

## Prerequisites

- Access to an instance of an
[Azure Service Bus](https://docs.microsoft.com/en-us/azure/service-bus-messaging/)(ASB).
- Docker
- Docker Compose

Optional:
- Kubernetes
- Helm

### Azure Service Bus

This service depends on a valid Azure Service Bus connection string for
asynchronous communication.  The following environment variables need to be set
in any non-production (`!config.isProd`) environment before the Docker
container is started or tests are run.

When deployed into an appropriately configured AKS
cluster (where [AAD Pod Identity](https://github.com/Azure/aad-pod-identity) is
configured) the microservice will use AAD Pod Identity.

| Name                                   | Description                                                            |
| ----                                   | -----------                                                            |
| MESSAGE_QUEUE_HOST                     | Azure Service Bus hostname, e.g. `myservicebus.servicebus.windows.net` |
| MESSAGE_QUEUE_PASSWORD                 | Azure Service Bus SAS policy key                                       |
| MESSAGE_QUEUE_USER                     | Azure Service Bus SAS policy name, e.g. `RootManageSharedAccessKey`    |
| MESSAGE_QUEUE_SUFFIX                   | Developer initials                                                     |


## Running the application

The application is designed to run in containerised environments, using Docker Compose in development and Kubernetes in production.

- A Helm chart is provided for production deployments to Kubernetes.

### Build container image

Container images are built using Docker Compose, with the same images used to run the service with either Docker Compose or Kubernetes.

When using the Docker Compose files in development the local `app` folder will
be mounted on top of the `app` folder within the Docker container, hiding the CSS files that were generated during the Docker build.  For the site to render correctly locally `npm run build` must be run on the host system.


By default, the start script will build (or rebuild) images so there will
rarely be a need to build images manually. However, this can be achieved
through the Docker Compose
[build](https://docs.docker.com/compose/reference/build/) command:

```
# Build container images
docker-compose build
```

### Start

Use Docker Compose to run service locally.

The service uses [Liquibase](https://www.liquibase.org/) to manage database migrations. To ensure the appropriate migrations have been run the utility script `scripts/start` may be run to execute the migrations, then the application.

Alternatively the steps can be run manually:
* run migrations
  * `docker-compose -f docker-compose.migrate.yaml run --rm database-up`
* start
  * `docker-compose up`
* stop
  * `docker-compose down` or CTRL-C


## Test structure

The tests have been structured into subfolders of `./test` as per the
[Microservice test approach and repository structure](https://eaflood.atlassian.net/wiki/spaces/FPS/pages/1845396477/Microservice+test+approach+and+repository+structure)

### Running tests

A convenience script is provided to run automated tests in a containerised
environment. This will rebuild images before running tests via docker-compose,
using a combination of `docker-compose.yaml` and `docker-compose.test.yaml`.
The command given to `docker-compose run` may be customised by passing
arguments to the test script.

Examples:


### Run all tests
```
scripts/test
```

### Run Acceptance tests
```shell
scripts/acceptance arg
```
- `debug` -- Build docker image and run acceptance test against Browserstack
- `local` -- Start the service locally, run test on your local machine. Note: You should have chrome browser installed

# Run tests with file watch
scripts/test -w

# Run tests with debugger attachable
scripts/test -d
```

## CI pipeline

This service uses the [FFC CI pipeline](https://github.com/DEFRA/ffc-jenkins-pipeline-library)

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
