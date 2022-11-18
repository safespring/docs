# Debian/Ubuntu Linux (64-bit)

There are two ways of installing the software needed for the Safespring Backup
service:

- Automatically signing up nodes
- Manually signing up nodes,

In both cases, the software is distributed through deb repositories and the
first parts of the installation are identical.

## 1. Configure the repository

Packages are provided for the following distributions:

- Debian 10 Buster
- Debian 9 Stretch
- Ubuntu 20 Focal Fossa
- Ubuntu 18 Bionic Beaver
- Ubuntu 16 Xenial Xerus

The following table contains the ```apt``` configuration for each of the
supported distributions:

| Distribution            | Apt repository configuration                            |
| ----------------------- | ------------------------------------------------------- |
| Debian 10 Buster        | deb https://repo.service.safedc.net/debian buster main  |
| Debian 9 Stretch        | deb https://repo.service.safedc.net/debian stretch main |
| Ubuntu 20 Focal Fossa   | deb https://repo.service.safedc.net/debian focal main   |
| Ubuntu 18 Bionic Beaver | deb https://repo.service.safedc.net/debian bionic main  |
| Ubuntu 16 Xenial Xerus  | deb https://repo.service.safedc.net/debian xenial main  |

Find the ```apt``` configuration for your server in the table above and run the
following commands on the server that will run the backup client software. In
the example below we will configure the repository for a Debian 9 server.

Create the file ```/etc/apt/sources.list.d/safespring-backup``` with the
following content:

```shell
DISTRIBUTION="stretch"
echo "deb https://repo.service.safedc.net/debian ${DISTRIBUTION} main" > /etc/apt/sources.list.d/safespring-backup.list
```

Fetch the repository key and install it in the file ```/tmp/safespring-repo-key```:

```shell
wget -O /tmp/safespring-repo-key https://repo.service.safedc.net/repokey/PACKAGES-GPG-KEY-Safespring
```

Import the key:

```shell
apt-key add /tmp/safespring-repo-key && rm /tmp/safespring-repo-key
```

!!!note
    If you are using Debian you are required to install the package
    ```apt-transport-https``` before updating the repository caches.

Update repository caches:

```shell
apt-get update
```

## 2. Installation of software

### 2.a) Installation with automatic node registration

The ```safespring-backup-setup``` package contains an enrollment-script which
will install backup client software as well as enable and run the ```dsmcad```
service. The bare metal restore service TBMR is installed as a dependency.

```shell
apt-get install safespring-backup-setup
```

#### 2.a.1) Automatic enrollment

After installation the server can be automatically registered in the Safespring
Backup service by using the  ```safespring-backup-setup``` script.  A brief
usage instruction is listed below:

```shell
# safespring-backup-setup 
safespring-backup-setup [-a application] [-c ON|OFF] [-C cost_center] [-d ON|OFF]
   [-D ON|OFF] [-e ON|OFF] [-f credentials_file] [-H host_name]
   [-i host_description] [-m mail_address] [-p platform]
   [-t auth_token]
```

The ```safespring-backup-setup``` script requires an authentication token to
communicate with the API.

!!!note
    It is recommended to use an API key with enrollment capabilities since these
    keys have limited permissions and will only be able to register a configured
    number of backup clients.

The API-key can be given to ```safespring-backup-setup``` in two ways:

A) Via `safespring-backup-setup -f $path-to-file` which expects a YAML
formatted file like the following:

```yaml
access_key_id: $the_access_key
secret_access_key: $the_secret_key
```

!!!warning
    Strict permissions on the credentials file is required! The script will
    fail if strict permissions are not set. A malicious user can use the
    credentials to delete or modify backup nodes and schedules.

B) Via `safespring-backup-setup -t $token` which expects a base64 encoding of
the key and secret key as in the following command:

```shell
echo -n $the_access_key:$the_secret_key | openssl enc -base64 -e
```

A typical invocation of the script would be something like:

```shell
/usr/bin/safespring-backup-setup -f /root/safespring-backup-credentials.yaml \
    -m user@example.com \
    -C $costcenter \
    -p Debian-7
```

More detailed usage instructions are found in the man-page, `man
safespring-backup-setup`.  Please study the man page to see all the available
instructions.

#### 2.a.2) Service activation

The ```safespring-backup-setup``` script will enable and launch the
```dsmcad``` service (as a systemd unit).  There is however one final task to
be done before the service is fully activated and the client will start to
perform backup, which is explained in step 3 below.

### 2.b) Installation with manual node registration

The manual node registration procedures follows a similar method. Issuing the
following command will install the meta-package which depends on TSM:

```shell
apt-get install install safespring-backup
```

It will install TSM and prepare it for operations with the service (i.e.
install CA certificates, etc) but it will _not_ register the client with the
Backup service. The manual routine for node registration is described below.

#### 2.b.1) Create a node in the Backup Portal

You must first create a node (backup client entitlement) in the BaaS Portal (or
using the [API](https://github.com/safespring/cloud-BaaS/blob/master/API.md)).
When you create a node, you receive both a ```nodename``` and a ```password```.
Keep these for the duration of the installation.

#### 2.b.2) Retrieve and install TSM configuration files

The TSM configuration files are unique to each node, and if you created the
node on the BaaS Portal, you were prompted to download the configuration there.
It can also be retrieved from the API directly.

Place the two files according to below:

```shell
/opt/tivoli/tsm/client/ba/bin/dsm.sys
/opt/tivoli/tsm/client/ba/bin/dsm.opt
```

#### 2.b.3) Initialize TSM

When you start the TSM client for the first time, you will be prompted for your
password. If you get asked for the nodename, accept the default which is
configured in ```dsm.sys``` already (see previous step).

```shell
dsmc query session
```

#### 2.b.4) Service activation

```shell
systemctl enable dsmcad
```

#### 2.b.5) Start Backup client service

```shell
systemctl start dsmcad
```

### 3) Activation of backup schedule and backup policy

Currently it is required to wait until after the creation of the node, to
configure a backup schedule and backup policy for it.  This is either done via
the Portal, or via the API directly.

### 4) Activation of TBMR and generation of machine restore configuration

The ```safespring-backup-tbmr``` package provides a simple script to request a
new TBMR licence and generate a bare metal restore machine configuration:

```shell
/usr/bin/safespring-backup-tbmr
```
