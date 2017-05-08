# Debian/Ubuntu Linux (64-bit)

_This document describes how to manually install IBM TSM on Debian or Ubuntu Linux (64-bit)._

Since the latest release, 7.1.2, IBM ships .deb archives, so you can get them directly.
For older deb/ubuntu machine the procedure below may still be useful.

Deb archives available on our local mirror here:
   https://api.cloud.ipnett.se/dist/tsm/mirror/maintenance/storage/tivoli-storage-management/maintenance/client/v7r1/Linux/LinuxX86_DEB/
and at IBMs site:
   https://www3.software.ibm.com/storage/tivoli-storage-management/maintenance/client/v7r1/Linux/LinuxX86_DEB/

## 1. Fetch TSM installation files:

In this example, files are fetched from the IPnett TSM mirror.

    wget https://api.cloud.ipnett.se/dist/tsm/mirror/maintenance/storage/tivoli-storage-management/maintenance/client/v7r1/Linux/LinuxX86/BA/v711/7.1.1.0-TIV-TSMBAC-LinuxX86.tar

## 2. Unpack installation files

    tar xf *-TIV-TSMBAC-LinuxX86.tar

## 3a. Convert IBM GSKIT and TSM

Make sure you have `alien`and `rpm` installed first.
With root privileges, run

    for rpm in gsk*.rpm TIVsm-API64*.rpm TIVsm-BA.x86_64.rpm ; do alien -c -d $rpm ; done

## 3b. Install IBM GSKIT and TSM

With root privileges:

    dpkg -i *.deb

## 3c. Setup ldconfig

Edit `/etc/ld.so.conf.d/tsm.conf` and add, for a 64-bit system:

    /opt/tivoli/tsm/client/api/bin64/
    /usr/local/ibm/gsk8_64/lib64/

With root privileges:

   ldconfig


## 4. Add the IPnett BaaS CA to the TSM Trust database

    wget https://raw.githubusercontent.com/IPnett/cloud-BaaS/master/pki/IPnett-Cloud-Root-CA.sh
    wget https://raw.githubusercontent.com/IPnett/cloud-BaaS/master/pki/IPnett-Cloud-Root-CA.pem
    sh ./IPnett-Cloud-Root-CA.sh

## 5. Install TSM configuration files

The TSM configuration files are unique to each node, and can be generated via the BaaS API or the portal.
Place the two files at this location:

- /opt/tivoli/tsm/client/ba/bin/dsm.sys
- /opt/tivoli/tsm/client/ba/bin/dsm.opt

## 6. Initialize TSM (set client password)

When you start the TSM client for the first time, you will be prompted for your password. If you get asked for the nodename, accept the default which is configured in dsm.sys already (see previous step).

    dsmc query session

## 7. Enable TSM autostart

    # Edit the IBM-supplied /etc/init.d/dsmcad to work on your system. It seems to not-support non-RH/Suse systems, but the basics is just "start or stop dsmcad", so it should be easily edited to work on any kind of Linux system.
