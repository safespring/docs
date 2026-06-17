# Issue S3 credentials with the openstack CLI

In addition to using the dashboard "View Credentials" button (see
[Get S3 credentials](../getting-started.md#get-s3-credentials)), you can issue
S3 credentials from the command line using the `openstack` CLI authenticated
with an Application Credential. This is useful when you want to script the
creation, rotation or revocation of S3 credentials without going through the
dashboard.

The credentials produced this way are the same project-scoped EC2 access/secret
key pair that the dashboard exposes — they are not personal.

## Why authenticate with an Application Credential

Application Credentials let you delegate a reduced set of privileges (the
project only) and rotate or revoke secrets independently of the user account.
See [Application Credentials](../../compute/app-creds.md) for the full
background and rationale.

## Prerequisites

1. The `openstack` command line client installed — see
   [Install the Openstack command line client](../../compute/api.md#install-the-openstack-command-line-client).
1. An Application Credential created in the project where you want S3
   credentials. Follow
   [Creating application credentials](../../compute/app-creds.md#creating-application-credentials-using-the-dashboard)
   and securely record the `id` and `secret`.

## Configure authentication

Configure the `openstack` CLI to authenticate with the Application Credential,
either through a `clouds.yaml` file or environment variables.

`clouds.yaml` in `~/.config/openstack/` (sto1 example):

```
clouds:
  sto1-myproject:
    auth:
      auth_url: https://v2.dashboard.sto1.safedc.net:5000/v3/
      application_credential_id: <your_id>
      application_credential_secret: <your_secret>
    region_name: sto1
    interface: public
    identity_api_version: 3
    auth_type: v3applicationcredential
```

Then select the cloud:

```
export OS_CLOUD=sto1-myproject
```

Or, using environment variables only:

```
export OS_AUTH_TYPE=v3applicationcredential
export OS_AUTH_URL=https://v2.dashboard.sto1.safedc.net:5000/v3
export OS_IDENTITY_API_VERSION=3
export OS_APPLICATION_CREDENTIAL_ID=<your_id>
export OS_APPLICATION_CREDENTIAL_SECRET=<your_secret>
```

!!! note "Make sure none of the user or project related environment variables are set, since that can prevent application credentials from working."

Adjust `auth_url` and `region_name` for the site you want (`sto1`, `sto2` or
`osl2`). See [Sites and Data Locality](../../compute/sites.md) for the full
list of endpoints.

## Issue S3 credentials

Create a new S3 (EC2) credential pair for the current project:

```
openstack ec2 credentials create
```

The output contains the `access` and `secret` values to use as the S3 access
key and secret key.

List existing S3 credentials in the project:

```
openstack ec2 credentials list
```

Show a specific credential:

```
openstack ec2 credentials show <access-key>
```

Delete a credential when it is no longer needed:

```
openstack ec2 credentials delete <access-key>
```

!!! note
    The `access` and `secret` returned here are the same key pair you would
    see under "View Credentials" in the dashboard. They are tied to the
    project, not to the user or to the Application Credential used to create
    them, and they remain valid even if the Application Credential is later
    revoked.

## Endpoint URLs

The S3 service endpoints are listed in [Get S3 credentials](../getting-started.md).
Point your S3 client at the URL for the site where you created the
credentials.
