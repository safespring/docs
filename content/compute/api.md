# Access the compute service API

!!! warning "API access is restricted"
    For access to the Openstack API, contact support. See [Getting support](/service/support) for details.
## Requirements

For advanced use cases and automation it is necessary to use the
Openstack API endpoints directly.

## Install the Openstack command line client

Openstack.org instructions on how to install the client can be found
[here]. We recommend installing the client in a Python virtual environment.

[here]: https://docs.openstack.org/user-guide/common/cli-install-openstack-command-line-clients.html

### Linux

First install the necessary OS packages depending on what distribution you are
using. If the `python-virtualenvwrapper` package is not available you might have to install `epel-release` first.

```shell tab="Red Hat Enterprise Linux, CentOS or Fedora"
yum install python-devel python-pip python-virtualenvwrapper gcc
```

```shell tab="Ubuntu or Debian"
apt-get install python-dev python-pip virtualenvwrapper build-essential
```

```shell tab="Ubuntu 24.04"
apt-get install python3-dev python3-pip virtualenvwrapper build-essential
```
#### Installing the client using virtualenvwrapper and pip

Restart your shell. Create a virtualenv and install the client into it.

```shell
mkvirtualenv oscli
pip install --upgrade pip
pip install python-openstackclient python-neutronclient
```

To stop or start using this virtual Python environment, type

```shell
# to activate it
workon oscli
# to exit, when finished
deactivate
```

### Windows

!!! note
    These instructions aren't well tested or perhaps even incomplete.
    Please let us know if you need help or know how to improve them!

To be able to use the Openstack client from Windows you need [Python 2.7].
After the installation is finished, open a command prompt:

```shell
C:
cd C:\Python27\Scripts
```

Use `easy_install` to install _pip_

```shell
C:\Python27\Scripts>easy_install pip
```

Then install _python-openstackclient_ using pip
```shell
C:\Python27\Scripts>pip install python-openstackclient
```


### Configuration and credentials

Create a openstackrc file with your environment information and API account
credentials. On Linux, you could do it like this:

```shell
# create a config file
$ cat - >> openstackrc << EOF
<paste of rc-file from template below>
EOF
# edit it to include real credentials
vi openstackrc
# then activate it
source openstackrc
```

Run a command to see if it works , this command tests authentication only

```shell
openstack token issue
```

## Terraform
[Terraform] is a tool to provision infrastructure on cloud platforms. It is built to be an agnostic tool which uses the same templates regardless of the underlying cloud provider.

Safespring has developed a number of Terraform modules for different kind of instances and comes with an examples directory which describes how to use them. The modules can be found at: [Safespring terraform modules]
[Python 2.7]: https://www.python.org/downloads/
[Terraform]: https://www.terraform.io
[Safespring terraform modules]: https://github.com/safespring-community/terraform-modules
