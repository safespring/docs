# Access the compute service API

## Requirements

For advanced use cases and automation it is neccessary to use the
Openstack API endpoints directly.

To do this, contact support to make sure you get an API-enabled
user account created for you. A federated user account from e.g SWAMID
or Dataporten can't be used directly in this case.

## Install the Openstack command line client

Openstack.org instructions on how to install the client can be found
[here]. We recommend installing the client in a Python virtual environment.

[here]: https://docs.openstack.org/user-guide/common/cli-install-openstack-command-line-clients.html

### Linux

First install the neccessary OS packages depending on what distribution you are
using.

#### Red Hat Enterprise Linux, CentOS or Fedora

If the _python-virtualenvwrapper_ package is not available you might have to
install _epel-release_ first.

```
yum install python-devel python-pip python-virtualenvwrapper gcc
```

#### Ubuntu or Debian

```
apt-get install python-dev python-pip virtualenvwrapper build-essential
```

#### Installing the client using virtualenvwrapper and pip

Restart your shell. Create a virtualenv and install the client into it.

```shell
mkvirtualenv oscli
pip install --upgrade pip
pip install python-openstackclient
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

[Python 2.7]: https://www.python.org/downloads/

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

## Example scripts to create servers

This instruction will show you how to start new servers through the API. To simplify we will first create
a network in the gui to which we then connect all our servers.

Make sure that you have a working rc-file according to the insctructions [here](https://docs.safespring.com/compute/api/).

Then create a network according to this [instruction](https://docs.safespring.com/compute/network/).

You should also create a [key pair](https://docs.safespring.com/compute/keypairs/) as described here if you want to be able to connect to the servers over [SSH](https://docs.safespring.com/compute/keypairs/).

Now it is time to find the ID of the network:

```shell
$ neutron net-list
```

Find the ID if the network that you just created and save it for later.

Now you want to find the image and the flavor for the server you want to create:

```shell
$ openstack image list
```
Find the image ID of the operating system you want to use and save it for later.
You can use an image provided by us, one you have uploaded yourself or a snapshot (which could be practical if
the servers you want to create should have certin software installed or be configured in a certain way)
```shell
$ openstack flavor list
```
Find the flavor you want to use. You do not need the ID - only the name

Get the name of you key pair:
```shell
$ openstack keypair list
```
and save the name for later.

Create your server. Everyting inside brackets should be replaced with your own information.
```shell
$ openstack server create --image <IMAGE-ID> --flavor <FLAVOR-NAME> --network <NETWORK-ID> --key-name <KEYNAME> <INSTANCE-NAME>
```

If you would like to create several servers you can create a skript like this:
```shell
#!/bin/bash
NETID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
IMAGEID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
FLAVOR=b.tiny
KEYNAME="keyname"

while read servername; do
    openstack server create --image $IMAGEID --flavor $FLAVOR --network $NETID --key-name $KEYNAME $servername
done <servers.txt
```

You also need to put the names of the servers that you want to create in the text-file servers.txt in the same folder as the script one name per line.

```shell
server1
server2
server3
```

If you want to delete the servers you could use the following script:

```shell
#!/bin/bash

while read servername; do
    openstack server delete $servername"
done <servers.txt
```

In order to connect to you servers you need to add security groups and add floating IPs. If you book floating IPs
and create security groups in the portal you can use these alternate scripts to add that to you instances
on the fly.

You first need to create a server2.txt file with the following content:
```shell
server_name_1;floating_IP_1;security_group
server_name_2;floating_IP_2;security_group
```

You must ensure that the name of the security group exists and that the floating IPs you are using are reserved in
your project but unallocated. Once you have that file in place you can use the follwing script to create the servers
with the correct names, security group and a floating IP assigned to it:
```shell
#!/bin/bash
NETID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
IMAGEID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
FLAVOR=b.tiny
KEYNAME="keyname"

while read serverdef; do
    IFS=';' read -r -a serverinfo <<< "$serverdef"
    servername=${serverinfo[0]}
    fip=${serverinfo[1]}
    secgroup=${serverinfo[2]}
    echo "openstack server create --image $IMAGEID --flavor $FLAVOR --security-group $secgroup --network $NETID --key
-name $KEYNAME $servername"
    openstack server create --image $IMAGEID --flavor $FLAVOR --security-group $secgroup --network $NETID --key-name
$KEYNAME $servername
    echo "openstack server add floating ip $servername $fip"
    openstack server add floating ip $servername $fip
done <servers2.txt
```

And in order to delete the servers again - use this altered script:
```shell
#!/bin/bash

while read serverdef; do
    IFS=';' read -r -a serverinfo <<< "$serverdef"
    servername=${serverinfo[0]}
    echo "openstack server delete $servername"
    openstack server delete $servername
done <servers2.txt
```

## Example Terraform configuration

This example configuration starts a test cirros instance using Terraform.
Please use resource IDs instead of names in production to avoid suprises.

```json
provider "openstack" {
  auth_url  = "https://keystone.api.cloud.ipnett.se/v3"
}

resource "openstack_networking_network_v2" "terraform-test-network" {
  name           = "terraform-test-network"
  admin_state_up = "true"
}

resource "openstack_networking_subnet_v2" "terraform-test-subnet" {
  network_id = "${openstack_networking_network_v2.terraform-test-network.id}"
  cidr       = "192.168.199.0/24"
}

resource "openstack_compute_instance_v2" "terraform-test-instance" {
  name        = "terraform-test-instance"
  image_name  = "cirros-0.3.4"
  flavor_name = "b.tiny"

  network {
    name = "terraform-test-network"
  }

  depends_on = [
    "openstack_networking_network_v2.terraform-test-network"
  ]
}
```

```shell
export OS_DEBUG=1
export TF_LOG=DEBUG
terraform plan
terraform apply
terraform destroy
```
