# Migrate with API
To migrate from one site to another, the simplest way is to use the API and the scripts provided by safespring [here](https://github.com/safespring-community/utilities/tree/main/v1v2-migration).

In order to use the scripts you need the following:

1. A host where to run the scripts from.
2. Download OpenStack RC files from both the old and the new platform
3. Install the scripts on the migration instance
4. API access

## Host to run the scripts from
Since the scripts download and upload from the old and to the new platform it is recommended run the scripts from
a machine that has good network connectivity to both the old and the new platform. The easiest way to ensure this is
to start a migration instance in the new platform and run the scripts from there. This way you will ensure to have
the best possible network connectivity when doing the migrations.

!!! note Safespring has a number of images in our platform running different flavors of Linux which also is the recommended platform to use when setting up a machine with API access to facilitate migrations. 

Make sure to apply a SSH-key to the instance you create and also apply a Security Group which allows SSH-access to the instance.

Once the instance has been created, make sure that you can run SSH to it. 

## Download OpenStack RC files
First login to the old platform to where you will migrate you instances from. Go to "API Access" and then click the button "Download OpenStack RC File", and then pick "OpenStack RC File". If the projects in the old and the new platform has the same name it is good to suffix the downloaded file with "old".


Then login to the new platform and do the same operation there. Download the RC file and suffix it with the word "new".

In each of the files comment out the following lines:

```shell
#echo "Please enter your OpenStack Password: "
#read -sr OS_PASSWORD_INPUT
#export OS_PASSWORD=$OS_PASSWORD_INPUT
```

and replace them with: 
```shell
export OS_PASSWORD=<your openstack password>
```
Now use SCP to copy the files to your migration instance. Make sure you have added the SSH-key you provided to the instance when creating it with the command "ssh-add". Run the command below for each of the files.

```shell
$ scp localfile ubuntu@<migration-instance-ip>:.
```
Now connect to you migration instance with SSH:

```shell
$ ssh ubuntu@<migration-instance-ip>
```
Once connected to the instance it is time to install git and dowload the scripts.

```shell
$ sudo apt install git
$ git clone https://github.com/safespring-community/utilities.git
```
This will create the utility-directory in your home directory. For simplicity copy you OpenStack RC-files that you have copied to your home directory into the directory utilities/v1v2-migration

```shell
$ cp <old-rc-file> utilities/v1v2-migration
$ cp <new-rc-file> utilities/v1v2-migration
```


## API access
In these examples we will use Ubuntu as the OS for the migration host but any RHEL or Debian based distribution works. To install the OpenStack API client follow the instructions [here](https://docs.safespring.com/new/api/).

Once installed you can test that you have API-access to both platforms:

```shell
$ source <old-rc-file>
$ openstack token issue
$ source <new-rc-file>
$ openstack token issue
```

## migrate-instance-snapshot.sh
Prerequisites: Openstack Python CLI client, qemu-utils, double the space to hold the size of the snapshot you want to migrate in the directory where you run the script

Install qemu-utils by running the following command:

```shell
$ sudo apt install qemu-utils
```
This script is used to migrate an instance snapshot from the old platform to the new. Once it is finnished the snapshot will be found under "Images" in the new platform and can be used to boot up the instance.

First one needs to take a snapshot in the source platform of the instance that should be migrated.

The script is run with two environment files as arguments:

```shell 
$ ./migrate-instance-snapshot.sh <old-rc-file> <new-rc-file>
```

The script will list all the available images and snapshots in the source platform. The user then provides the name of the snapshot that should be migrated.

The script downloads the snapshot, runs qemu-img to convert to qcow2 (if needed)  and then uploads it to the destination platform.

## migrate-data-vol.sh
Prerequisites: Openstack Python CLI client, qemu-utils, double the space to hold the size of the volume you want to migrate in the directory where you run the script

Install qemu-utils by running the following command:

```shell
$ sudo apt install qemu-utils
```
The script is run with two environment files for OpenStack API access as arguments:
```shell
$ ./migrate-data-vol.sh <old-rc-file> <new-rc-file>
```
This script is used to migrate volumes from the old to the new platform. The migrated volumes will be found under "Volumes" in the new platform once they are migrated.

The script first lists all available volumes in the source platform. You provide the name of the volume you want to migrate and the script will do the rest. At the end the script will ask you if you want to migrate another volume which could be practical if you have more volumes than one attached to an instance you want to migrate.


## Migration of instances (different cases)
If the instance you are migration boots from an image and has no additional volumes you shut down the instance and take an instance snapshot with the button at the end of the row in the instance listing. When the snapshot has finished you boot up the instance again and run the script and points it to the instance snapshot you just made.

If the instance boots from volume you shut down the instance and perform a volume snapshot in the volume listing view. Once that is done you can boot the instance again and create a volume from the volume snapshot and use that as input when running the migrate-data-vol.sh script.

If the instance boots from image and has one or more additional data volumes you first shut down the instance. You then perform an instance snapshot (in the instance listing view) and then go to Volumes and create volume snapshots for all the volumes attached to the instance. You then create new migration volumes from the volume snapshots. When that is done you use the migrate-instance-snapshot.sh to migrate the instance and the migrate-data-vol.sh script to migrate the attached volumes. 

## unset.sh
Utility script to unset the OS-env variables. Also part of the actual migrate script so does not need to be run indvidually but added to the repo for completeness.
