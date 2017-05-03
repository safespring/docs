# Access the compute service API

## Requirements

For advanced use cases or automation it is neccessary to use the
Openstack API endpoints directly.

To do this, contact support to make sure you get an API-enabled
user account created for you. A federated user account from e.g SWAMID
or Dataporten can't be used in this case.

## Example rc files

These are example rc files (settings) for accessing our Norwegian and
Swedish Compute services. Replace the bracketed variables with your own
information.

### no-south-1

```shell
OS_AUTH_URL=https://keystone.api.cloud.ipnett.no/v3
OS_IDENTITY_API_VERSION=3
OS_PASSWORD=<PASSWORD>
OS_PROJECT_DOMAIN_NAME=<DOMAIN>
OS_PROJECT_NAME=<PROJECT>
OS_REGION_NAME=no-south-1
OS_USERNAME=<USERNAME>
OS_USER_DOMAIN_NAME=<DOMAIN>
```

### se-east-1

```shell
OS_AUTH_URL=https://keystone.api.cloud.ipnett.se/v3
OS_IDENTITY_API_VERSION=3
OS_PASSWORD=<PASSWORD>
OS_PROJECT_DOMAIN_NAME=<DOMAIN>
OS_PROJECT_NAME=<PROJECT>
OS_REGION_NAME=se-east-1
OS_USERNAME=<USERNAME>
OS_USER_DOMAIN_NAME=<DOMAIN>
```
