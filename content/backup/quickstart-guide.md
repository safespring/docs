# Quickstart Guide

In this Quickstart Guide will we cover how to create 

- Consumption Unit and Assign that with a backup node
- Install IBM Spectrum Protect Backup-Archive Client
- Configure IBM Spectrum Protect Backup-Archive Client
- Schedule our first backup

## Create Consumption Unit

For more information please read [How-To Consumption Units](howto/consumption-units.md)

Login to [Safespring Backup Portal](https://portal.backup.sto2.safedc.net/) with your credentials. [Need new credentials?](faq.md) talk to our [support](../service/support.md)

![BaaS Portal Login](images/baas-portal-login.png)

When you login for the first time you will see a empty desktop but if you already have node assigned you will see a summary on all created nodes.

![Clean BaaS Portal Desktop](images/baas-portal-summary.png)

Click on the "Consumption Units" tab and then "Add"

![New Consumption Unit](images/baas-portal-new-consumption-unit.png)

Type a friendly name, e.g. hostname or FQDN. and press "Add"
When the consumption unit has been created the portal will ask you if you want to add/assign a backup node to the consumption unit, press "Yes" to continue.

Fillout the form like, Platform, preferred backup server, Domain, Client Option set and contact details (e.g. Server owner E-Mail or Support Email).

The Client Option Set defaults to Dedup_and_Compression to allow but not force the client
to attempt to use deduplication and compression before sending data over to the server
in order to reduce transfer time and amount. Other options include Force_Encrypt which
will unconditionally make the client locally encrypt all data before transfer with a
key you need to enter once. These two options are mutually exclusive. There is a
None option which sets no client options from server-side.

![Consumption Unit New Node](images/baas-portal-consumption-unit-node.png)

We are recommending that you let "Data-source" be empty to let us randomize the nodename.
Press "Activate" to proceed with the activation of your consumption unit.

![Activate Consumption Unit](images/baas-portal-consumption-unit-node-activate.png)

Next step is to install the IBM Spectrum Protect Backup-Archive Client.

## Install IBM Spectrum Protect Backup-Archive Client

Install the IBM Spectrum Protect Backup-Archive Client, you can download the latest client from [IBMs FTP Server][https://www3.software.ibm.com/storage/tivoli-storage-management]

- [Patch Version](https://www3.software.ibm.com/storage/tivoli-storage-management/patches/client/)
- [Maintenance Version](https://www3.software.ibm.com/storage/tivoli-storage-management/maintenance/client/)

Please follow in the installation instructions for your Operating System.

- [Microsoft Windows](install/windows.md)
- [Linux](install/linux.md)