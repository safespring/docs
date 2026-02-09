# Access the compute service API

For advanced use cases and automation it is necessary to use the
Openstack API endpoints directly.

## API access is IP-restricted

Safespring restricts API access to whitelisted IP addresses for security reasons. This protects customer infrastructure since OpenStack API credentials often exist in plaintext in configuration files, and there is no multi-factor authentication between CLI tools or Terraform and the OpenStack APIs.

There are two ways to get API access:

1. **Contact support** to have your external IP address whitelisted. See [Getting support](../service/support.md) for details.
2. **Use a jump host on the Safespring platform** (recommended).

## Using a jump host for API access (recommended)

All IP addresses within the Safespring platform are already whitelisted for API access. The simplest way to get started without contacting support is to create a small instance in the Horizon dashboard and use it as a jump host for running API commands.

This approach has several advantages:

- **Self-service** — you control which IP addresses can perform API commands by managing the SSH security group on the jump host
- **No waiting** — no need to contact support when your IP address changes
- **Centralized** — a single place to install CLI tools, store credentials, and run automation
- **Access to private networks** — the jump host can reach instances on the default and private networks directly

### Setting up a jump host

1. Create a small instance (for example `b2.c1r2`) through the Horizon dashboard on the **public** network.
2. Add an SSH security group to allow access from your IP address.
3. SSH into the instance and install the OpenStack CLI client (see instructions below).
4. Source your credentials and run API commands from there.

### Accessing APIs from your local machine with sshuttle

If you prefer to run CLI tools and Terraform on your local machine, you can use [sshuttle](https://github.com/sshuttle/sshuttle) to tunnel API traffic through the jump host. sshuttle works as a lightweight SSH-based VPN and requires no server-side configuration beyond a working SSH server.

```shell
sshuttle -r ubuntu@<jumphost-ip> <api-endpoint-ip>/32
```

Forward only the IP address that your OpenStack `auth_url` resolves to, rather than broad IP ranges.

!!! info
    sshuttle is available on macOS, Linux, and BSD. For Windows users, consider using the [VPN options](vpn.md) instead.

For a more detailed walkthrough, see the blog post [Using a Jump Host for Persistent Access to Safespring's APIs](https://www.safespring.com/blogg/2022/2022-08-using-jumphost-for-safespring-apis/).

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
