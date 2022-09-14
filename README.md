# FFC Pay Request Editor

## Description
FFC web front-end microservice which performs debt enrichment and ledger assignment overrides. 

For how the repo fits into the architecture and what components or dependencies it interacts with please refer to the following diagram: [ffc-pay.drawio](https://github.com/DEFRA/ffc-diagrams/blob/main/Payments/ffc-pay.drawio)

# Prerequisites

## Software required
- Access to an instance of
[Azure Service Bus](https://docs.microsoft.com/en-us/azure/service-bus-messaging/)
- [Docker](https://docs.docker.com)
- [Docker Compose](https://docs.docker.com/compose/)

Optional:
- [Kubernetes](https://kubernetes.io/docs/home/)
- [Helm](https://helm.sh/docs/)

## Configuration
### Azure Service Bus

This service depends on a valid Azure Service Bus connection string for
asynchronous communication.  The following environment variables need to be set
in any non-production (`!config.isProd`) environment before the Docker
container is started or tests are run.

When deployed into an appropriately configured AKS
cluster (where [AAD Pod Identity](https://github.com/Azure/aad-pod-identity) is
configured) the microservice will use AAD Pod Identity through the manifests
for
[azure-identity](./helm/ffc-pay-batch-processor/templates/azure-identity.yaml)
and
[azure-identity-binding](./helm/ffc-pay-batch-processor/templates/azure-identity-binding.yaml).

| Name                                   | Description                                                            |
| ----                                   | -----------                                                            |
| MESSAGE_QUEUE_HOST                     | Azure Service Bus hostname, e.g. `myservicebus.servicebus.windows.net` |
| MESSAGE_QUEUE_PASSWORD                 | Azure Service Bus SAS policy key                                       |
| MESSAGE_QUEUE_USER                     | Azure Service Bus SAS policy name, e.g. `RootManageSharedAccessKey`    |
| MESSAGE_QUEUE_SUFFIX                   | Developer initials                                                     |


### Azure App Registration

This service has been integrated into Azure App Registration using the msal-node [npm package](https://www.npmjs.com/package/@azure/msal-node)

By default, authentication is disabled.  It can be enabled by setting the `AUTHENTICATION_ENABLED` environment variable to `true`

If authentication is enabled, this service needs to be registered with [Azure App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

The following environment variables need to be set:

| Name                  | Description |
|-----------------------|-------------|
| AZUREID_CLIENT_ID     | The client (application) ID of an App Registration in the tenant. |
| AZUREID_TENANT_ID     | The Azure Active Directory tenant (directory) ID. |
| AZUREID_CLIENT_SECRET | A client secret that was generated for the App Registration. |

These can be retrieved from the App Registration overview blade.

### Azure App Registry roles
The following roles need [setting up](https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-add-app-roles-in-azure-ad-apps)

- Payments.Enrichment.Admin
- Payments.Ledger.Amend
- Payments.Ledger.Check

For users to access this service, the users need to be assigned to the relevant roles above through Azure Enterprise Applications.

# Setup

The application is designed to run in containerised environments, using Docker Compose in development and Kubernetes in production.

- A Helm chart is provided for deployments to Kubernetes.

## Configuration
### Build container image

By default, the start script will build (or rebuild) images so there will
rarely be a need to build images manually. However, this can be achieved
through the Docker Compose
[build](https://docs.docker.com/compose/reference/build/) command:

```
docker-compose build
```

# How to start the Request Editor

The service can be run using the convenience script:
```
./scripts/start
```

# How to get an output

There are several different possible outputs:

1. **To access the web front-end for the service**  
**Input:** Start the service (as described [above](#how-to-start-the-request-editor)).  
**Output:** If you then go to `localhost:3001` (may be subject to change) you should see the home screen for the Request Editor's web front-end.  

2. **To get a request awaiting debt data** (i.e. payment request for an amount less than the previously settled amount).  
**Pre-requisite:** The customer in question already has a settled payment.  
**Input:** Submit a [payment request](./docs/asyncapi.yaml) for the customer that is less than the customer's already settled balance.  
**Output:** The request should now be awaiting debt data enrichment on the web front-end.  

3. **To create a new debt dataset.**  
**Input:** On the web front-end click on the Capture New Dataset button and fill in the details.  
**Output:** The new dataset should now be added and viewable on the web front-end.  

4. **To get a request awaiting ledger assignment or correction.**  
**Pre-requisite:** Receive the output of 2. above.  
**Input:** Using the web front-end, add debt enrichment data to the request.  
**Output:** The request should now be awaiting ledger assignment or correction on the web front-end.  

5. **To get a request awaiting ledger assignment quality check.**  
**Pre-requisite:** Receive the output of 4. above.  
**Input:** Using the web front-end sign off on the ledger assignment.  
**Output:** The request should now be awaiting ledger quality check on the web front-end.  

6. **To sign off a request after quality check**
**Pre-requisite:** Receive the output of 5. above.  
**Input:** Using the web front-end sign off on the quality check.  
**Output:** The [payment request](./docs/asyncapi.yaml) is sent to the Topic `QC_TOPIC_ADDRESS`.  

> Note: 3, 4 and 5 are provisional measures requested by the RPA that may be removed at a future stage.

>Note that duplicate message detection is based on a `referenceId` property which must be a `UUID`.  If this property is not provided then the `invoiceNumber` property is used instead.

>When authentication is disabled, then the user will automatically be given all roles within the service and assigned a unique user Id.  For testing scenarios where multiple users are required, for example quality checks, then sign in again and a new Id will be assigned.


# How to stop the Request Editor

The service can be stopped in different ways:
- [Bring the service down](#bring-the-service-down)
- [Bring the service down and clear its data](#bring-the-service-down-and-clear-its-data)

### Bring the service down  
```
docker-compose down
```

### Bring the service down and clear its data  
```
docker-compose down -v
```

# How to test the Request Editor

## Running tests
Tests can be run in several modes
- [Run tests and exit](#run-tests-and-exit)
- [Run tests with file watch](#run-tests-with-file-watch)
- [Run tests with debugger attachable](#run-tests-with-debugger-attachable)

## Run tests and exit
```
scripts/test
```

## Run tests with file watch
```
scripts/test -w
```

## Run tests with debugger attachable
```
scripts/test -d
```

## CI pipeline

This service uses the [FFC CI pipeline](https://github.com/DEFRA/ffc-jenkins-pipeline-library)

# Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
