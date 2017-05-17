# Access the compute service API

## Requirements

For advanced use cases or automation it is neccessary to use the
Openstack API endpoints directly.

To do this, contact support to make sure you get an API-enabled
user account created for you. A federated user account from e.g SWAMID
or Dataporten can't be used in this case.

##Installation of OpenStack CLI clients
Instructions on how to install the clients can be found [here](https://docs.openstack.org/user-guide/common/cli-install-openstack-command-line-clients.html).

A safer way is to install the clients in a Python Virtual Environment:

```shell
$ sudo apt-get install python-pip virtualenv virtualenvwrapper build-essential
$ mkdir ~/PythonProjects
$ cat - >> ~/.bashrc << EOF
export WORKON_HOME=~/Envs
export PROJECT_HOME=~/PythonProjects
source /usr/share/virtualenvwrapper/virtualenvwrapper.sh
EOF
$ . ~/.bashrc
$ mkproject os
$ pip install --upgrade pip
$ pip install python-openstackclient python-cinderclient python-glanceclient python-keystoneclient python-neutronclient python-novaclient
$ cat - >> openstackrc << EOF
<contents of rc-file from template below>
EOF
$ source openstackrc
$ openstack token issue 
```
Whenever you like to go back to the system installed Python:
```shell
(os) $ deactivate
```

Whenever you like to go back to the virtual environment use the command:
```shell
$ workon os
```


## Example rc files

These are example rc files (settings) for accessing our Norwegian and
Swedish Compute services. Replace the bracketed variables with your own
information.

### no-south-1

```shell
export OS_AUTH_URL=https://keystone.api.cloud.ipnett.no/v3
export OS_IDENTITY_API_VERSION=3
export OS_PASSWORD=<PASSWORD>
export OS_PROJECT_DOMAIN_NAME=<DOMAIN>
export OS_PROJECT_NAME=<PROJECT>
export OS_REGION_NAME=no-south-1
export OS_USERNAME=<USERNAME>
export OS_USER_DOMAIN_NAME=<DOMAIN>
```

### se-east-1

```shell
export OS_AUTH_URL=https://keystone.api.cloud.ipnett.se/v3
export OS_IDENTITY_API_VERSION=3
export OS_PASSWORD=<PASSWORD>
export OS_PROJECT_DOMAIN_NAME=<DOMAIN>
export OS_PROJECT_NAME=<PROJECT>
export OS_REGION_NAME=se-east-1
export OS_USERNAME=<USERNAME>
export OS_USER_DOMAIN_NAME=<DOMAIN>
```
