# Access the compute service API

## Requirements

For advanced use cases or automation it is neccessary to use the
Openstack API endpoints directly.

To do this, contact support to make sure you get an API-enabled
user account created for you. A federated user account from e.g SWAMID
or Dataporten can't be used in this case.

## Installation of OpenStack CLI clients
Instructions on how to install the clients can be found [here](https://docs.openstack.org/user-guide/common/cli-install-openstack-command-line-clients.html).

A safer way is to install the clients in a Python virtual environment. First,
prepare a requirements.txt file that specifies the correct versions of the
client components needed for programmatic access:

```shell
cat - > requirements.txt <<EOF
python-keystoneclient>=2.0.0,!=2.1.0,<=3.6.0           # Mitaka, Newton
python-novaclient>=2.29.0,!=2.33.0,<=6.0.0             # Liberty, Mitaka, Newton
python-neutronclient>=5.1.0,<=6.0.0                    # Newton
python-glanceclient==2.5.0                             # Newton
python-heatclient==1.5.0                               # Newton
python-cinderclient>=1.6.0,!=1.7.0,!=1.7.1,<=1.9.0     # Mitaka, Newton
python-swiftclient>=2.2.0,<=3.1.0                      # Liberty, Mitaka, Newton
python-ceilometerclient>=2.5.0,<=2.6.1                 # Newton
python-openstackclient==2.3.0                          # Mitaka, Newton
EOF
```

Next, create the Python virtual environment, using the file above in the last
step:

```shell
sudo apt-get install python-pip virtualenv virtualenvwrapper build-essential
mkdir ~/PythonProjects
cat - >> ~/.bashrc <<EOF
export WORKON_HOME=~/Envs
export PROJECT_HOME=~/PythonProjects
source /usr/share/virtualenvwrapper/virtualenvwrapper.sh
EOF
. ~/.bashrc
mkproject os
pip install --upgrade pip
pip install -r requirements.txt
```

Create a openstackrc file with your environment information and credentials:

```shell
$ cat - >> openstackrc << EOF
<contents of rc-file from template below>
EOF
source openstackrc
openstack token issue
```

Whenever you like to go back to the system installed Python:

```shell
(os) $ deactivate
```

Whenever you like to go back to the virtual environment use the command:

```shell
workon os
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

