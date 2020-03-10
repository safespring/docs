# RedHat Linux (64-bit)

_This document describes how to install Safespring BaaS on RedHat Enterprise Linux (64-bit)._

There are two ways of installing BaaS:

 * Manually signing up nodes,
 * Automatically signing up nodes

In both cases, the software is distributed through RPM repositories and the first parts of the installation are identical.

## 1. Configure the repository

The original instructions on the repositories are found at [Github](https://github.com/safespring/cloud-BaaS/tree/master/unix/rpm). They are replicated here for simplicity.
The repositories are located at https://repo.cloud.ipnett.com/rpm/ (though this page is currently not indexed).

### EL6
CentOS 6.7 and RedHat EL 6.7 are tested.

```shell
curl -o /etc/pki/rpm-gpg/RPM-GPG-KEY-IPnett \
  https://raw.githubusercontent.com/safespring/cloud-BaaS/master/unix/rpm/RPM-GPG-KEY-IPnett
rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-IPnett
curl -o /etc/yum.repos.d/ipnett-el6.repo \
  https://raw.githubusercontent.com/safespring/cloud-BaaS/master/unix/rpm/ipnett-el6.repo
```

The commands will:

1. Download our RPM GPG signing key,
2. Import the key,
3. Install the repo file for use by the package management system.

### EL7
CentOS 7 and RedHat EL 7 are tested.

```shell
curl -o /etc/pki/rpm-gpg/RPM-GPG-KEY-IPnett \
  https://raw.githubusercontent.com/safespring/cloud-BaaS/master/unix/rpm/RPM-GPG-KEY-IPnett
rpmkeys --import /etc/pki/rpm-gpg/RPM-GPG-KEY-IPnett
curl -o /etc/yum.repos.d/ipnett-el7.repo \
  https://raw.githubusercontent.com/safespring/cloud-BaaS/master/unix/rpm/ipnett-el7.repo
```

The commands will:

1. Download our RPM GPG signing key,
2. Import the key,
3. Install the repo file for use by the package management system.

## 2. Installation of software

Now you must decide whether you want to install a package which allows for automatic node registration or if you prefer, for one reason or another, to manage the node registration yourself.

### 2. a) Installation with automatic node registration

#### 2. a.1) Installation of software
The following command will install a package that contains an enrollment-script, and it depends on the regular `ipnett-baas` package, which in turn depends on the TSM software:

`yum install ipnett-baas-setup`

#### 2.a.2) Automatic enrollment

After successfully having installed the software, the service can be automatically enrolled with by using the  `ipnett-baas-setup` program. Brief usage instructions are listed below:

```bash
# ipnett-baas-setup
/usr/bin/ipnett-baas-setup [-a application] [-c ON|OFF] [-C cost_center] [-d ON|OFF]
  [-D ON|OFF] [-e ON|OFF] [-f credentials_file] [-H host_name]
  [-i host_description] [-m mail_address] [-p platform]
  [-t auth_token]
```

Also, see man ipnett-baas-setup for more information

The program requires an authentication token to communicate with the API.
It is recommended that an API key with enrollment capabilities are used to automatically enroll hosts, since these have limited permissions due to risk of key misplacement.

The API-key can be given to the program in two ways.

A) `ipnett-baas-setup -f $path-to-file`, expects a YaML formatted file:

    access_key_id: $the_access_key
    secret_access_key: $the_secret_key

B) `ipnett-baas-setup -t $token`, expects a base64 encoding of the key and secret key:

    echo -n $the_access_key:$the_secret_key | openssl enc -base64 -e

A typical invocation of the script would be something like:

    ipnett-baas-setup -f /root/ipnett-baas-credentials.yaml -m user@example.com -C $costcenter -p RHEL-6

The platform switch, `-p`, is `RHEL-6` for EL6-like systems and `RHEL-7` for EL7-like systems.

More detailed usage instructions are found in the man-page, `man ipnett-baas-setup`.
Please study the man page to see all the available instructions.

#### 2.a.3) Service activation

`ipnett-baas-setup` will, after a fully successful invocation, on EL6/7 both activate and launch the dsmcad service.
There is however one final task to be done before the service is fully activated and the client will start to perform backup, which is explained in step 3 below.

### 2.b) Installation with manual node registration

The manual node registration procedures follows a similar method. Issuing the following command will install the meta-package which depends on TSM:

    yum install ipnett-baas

It will install TSM and prepare it for operations with the service (i.e. install CA certificates, etc).
But it will _not_ itself register the client with the service.

The manual routine for node registration is thus described below.

#### 2.b.1) Create a node in the BaaS Portal

You must first create a node (backup client entitlement) in the BaaS Portal (or using the [API](https://github.com/safespring/cloud-BaaS/blob/master/API.md)).
When you create a node, you receive both a `nodename` and a `password`. Keep these for the duration of the installation.

#### 2.b.2) Retrieve and install TSM configuration files

The TSM configuration files are unique to each node, and if you created the node on the BaaS Portal, you were prompted to download the configuration there. It can also be retrieved from the API directly.

Place the two files according to below:

    /opt/tivoli/tsm/client/ba/bin/dsm.sys
    /opt/tivoli/tsm/client/ba/bin/dsm.opt

#### 2.b.3) Initialize TSM

When you start the TSM client for the first time, you will be prompted for your password. If you get asked for the nodename, accept the default which is configured in dsm.sys already (see previous step).

    dsmc query session

#### 2.b.4) Enable TSM autostart

EL6:

    chkconfig dsmcad on

EL7:

    systemctl enable dsmcad

#### 2.b.5) Start TSM
EL6:

    service dsmcad start

EL7:

    systemctl start dsmcad

### 3) Activation of backup schedule and backup policy

Currently it is required to wait until after the creation of the node, to configure a backup schedule and backup policy for it.
This is either done via the Portal, or via the API directly. `TODO: Add examples here`
