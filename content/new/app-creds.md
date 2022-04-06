# Application credentials

Application credentials are credentials (id and secret) a user can create in a
project. These credentials are non-personal but cease to exist when the user
that created them is deleted/disabled. Application credentials in Safespring
compute platform gives the same permissions as the user creating them, but only
in the project the credentials is created.

!!! note "Application credentials is only relevant in context of using compute API and/or tools using the API (i.e. terraform, openstack cli etc)"

## Why application credentials
Application credentials enables better security in two ways:

1. Enables delegation of a reduced set of privileges (the project only), if the user created it have access to more resources (projects)
2. Enables revocation and rotation of secrets independently of the user creating it

Examples:

* A super user at an organisation may have access to a number of different
  projects at different sites. If other users only need access to a subset of
  all the projects that the superuser have access to, they can create application
  credentials in these projects, and hand out to users. When access
  is no longer needed the credentials can be revoked by deleting them.
* An application in the project need access to the compute API on behalf of a
  user. If the user stores their own user credentials in the application the
  application potentially gets a lot more privilege than needed, i.e. the
  impact of a break in will be more severe. Also it is wise to rotate secrets
  stored in applications regularly. If the user credential is used in the
  application those credentials need to follow the rotation policy of the
  application which may (should) be more frequent than the users' own
  credentials

## Creating application credentials
Application credentials can be generated both when logging in with SWAMID or with local account. To generate them log in
to the platform and go to https://v2.dashboard.sto1.safedc.net/dashboard/identity/application_credentials/. You then
click the button "Create Application Credential". You will then be presented with the following dialoge:


![image](../images/app-creds-dia.png)

Fill in the fields to generate the credentials. You can choose to provide a secret yourself or you can let the platform
do it. If you let the platform do it, make sure to write the secret down since this is what you will be using to contact
    the platform.



1. Install the openstack command line client
2. Configure the environment variables and/or `clouds.yaml` file with your user credentials and correct site and project.
3. Run `openstack application credential create <name-of-credential>`.
4. Note the `id` and the `secret` of the application credential.
5. Store or transfer the secret to the user, and/or the application that will consume it, in a secure manner.
6. Also transfer/store the id of the applicaiton credentials

Getting help is the same as always with openstack cli:

```
openstack application credential --help
Command "application" matches:
  application credential create
  application credential delete
  application credential list
  application credential show

openstack application credential create --help 
...
```

and so on


## Using application credential
There is few differences to which environment-variables (or clouds.yaml entries) compared to using username and password.

Here are the variables to use:

```
OS_AUTH_TYPE=v3applicationcredential
OS_AUTH_URL=<url to the compute API f.ex. https://v2.dashboard.sto1.safedc.net:5000/v3>
OS_IDENTITY_API_VERSION=3
OS_APPLICATION_CREDENTIAL_ID=<id of the noted credential>
OS_APPLICATION_CREDENTIAL_SECRET=<secret of the noted credential>
```

In order to rotate credentials, just create a new one, change the application to consume the new one and then delete the old one. 

!!! note "Make sure none of the user or project related environment variables are set, since that can prevent application credentials to work."

