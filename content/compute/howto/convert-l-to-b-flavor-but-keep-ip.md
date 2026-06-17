## Converting a l. to a b. flavor while keeping the original ip address

This page includes OpenStack CLI commands. See the [API Access documentation](../api.md) for instructions on how to install and configure the command line client.

This guide show the steps to convert a localdisk-backed (l.) flavor to volume-backed (b.) while keeping the original ip address.

A port that is created in the same process as creating an instance will automatically be deleted when detaching from an instance or when the instance is deleted. 

Before you start you should therefore get confirmation from support that we have set `preserve_on_delete` to `true` for the port connected to the specific instance.

## Pre-conversion steps

Before starting the conversion it is a good idea to make note of the following:

* Instance name
* Instance IP address
* Security groups
* (current) Flavor name
* List of currently connected volumes
* Any potential server groups
* For Linux systems, see what is written below under Notes, especially it is a good idea to check mount points.

## Time usage

A snapshot takes about 1min/GB to create, depending on the amount of data _used_ on root volume of the source image. This means that if you have a 100GB image, but is using 12GB, the snapshot process should take about 12 minutes.

Creating a volume from snapshot should be a bit quicker, at about 1min/3GB - although this is also dependent on the total volume size. A 100GB volume should be faster than the snapshot process, but a 1000GB will be slower due to the time used creating the volume before copying data to it.

## Notes

For linux installs, the host key will change.

If you want to use server groups to put certain instances on separate hosts, this is a very good time to do so as this parameter needs to be set on instance creation.

If you have multiple volumes connected - and are mounting these by disk path (i.e. /dev/sdb1 or equivalent) there _could_ be a problem mounting these in the correct order . If you mount volumes by uuid, drive label or similar there should be no issue. Not mounting by disk path is in any case generally a good idea.

## Conversion

### Prepare and shut down the source instance

* Go to compute -> instances and select "Create Snapshot" for the instance you want to convert
* Name the snapshot something like <instancename>-snap so it can easily be identified. This will take a while
* When snapshot is created, go to Compute -> Images, find the snapshot you created and select "Create Volume" from the drop-down menu. This will be the root volume of the new instance.

* Detach interface on source instance (Actions -> Detach Interface -> Select Port -> Detach Interface). Make a note of the ip address
* Detach any attached volumes (Compute -> Instance -> Click on "Instance Name", then for each "Volumes Attached", click on the volume and then select "Manage Attachments" from the top right drop-down menu and click "Detach Volume".)

### Create new instance

* Launch a new Instance (Compute -> Instances -> Launch Instance):
 * Give the instance a name
 * In the "Source" menu under "Select Boot Source" select "Volume", then find the volume you created earlier under "Available" and select it (click the "up" arrow)
 * Choose a non-localdisk (b.) flavor
 * DO NOT select a network
 * Under "Network Ports", select the same port as you detached earlier. The ip address should match the one you made a note of
 * Select the same Security Groups you had earlier
 * Key pair is not necessary
 * If you wish to use server groups for instance separation, add server to desired group here.
* Launch instance.
* IF you detached extra volumes from the old instance earlier, attach these to the new one:
 * Under Compute -> Instances, select "Attach Volume" in the drop-down menu of the new instance, then select volume to attach and click "Attach volume". This needs to be done for each volume you need to attach


## Shell script

Using the openstack CLI can speed up the process.

The code below is tested using the `python3-openstackclient 5.2.0` on ubuntu, run by a regular user with access to the relevant openstack projects and instances.

As with every script downloaded from the internet, it is extremely important to read through and understand the steps before actually running the script.

The script needs to be run with either instance name or instance uuid as the first parameter, and an optional server group name (from `openstack server group list`) as second parameter.

There is currently very little sanity checking going on, so please verify input parameters.

The script shuts down the original instance, detaches network port and any volumes, creates a temporary snapshot of the instance, creates a bootable volume, deletes the temp snapshot, tries to figure out a comparable flavor to use (removes .disksize at end, changes leading l. to b.), tnen creates new instance with the created boot volume and attaches port and any volumes.

The `l2.c32r64.1000` flavor does not have a b. equivalent, all other currently available flavours should be handled by the script.

Source instance is *not* deleted automatically and should not be deleted manually before you verify that the new one works as expected.

```code
#!/bin/bash
instance=${1}
group=${2}

# Get instance info+++
echo -n "Gathering data.."
instance_uuid=$(openstack server show ${instance} -c id -f value)
instance_name=$(openstack server show ${instance} -c name -f value)
instance_portid=$(openstack port list --server ${instance_uuid} -c ID -f value)
instance_volumes=$(openstack server show ${instance_uuid} -c volumes_attached -f value|cut -d\' -f2)
original_flavor=$(openstack server show ${instance_uuid} -c flavor -f value|awk '{ print $1 }')
new_flavor=$(echo ${original_flavor}|cut -d'.' -f1,2|sed -e 's/^l/b/g')
secgroups=$(openstack server show ${instance_uuid} -c security_groups -f value|cut -d\' -f2)
echo "done!"

## Name of new instance
new_instance_name=${instance_name}_volbacked

# Server grouping, if any. Fail if group does not exist.
if [[ ! -z "${group}" ]]; then
        openstack server group show ${group} || exit 1
fi
[[ ! -z "${group}" ]] && servergroup="--hint group=$(openstack server group show ${group} -c id -f value)" || servergroup=""


### HANDLE OLD INSTANCE STUFF

# Stop instance
echo "Stopping original instance"
openstack server stop ${1}

# Create snapshot
echo "Creating snapshot from original instance"
openstack server image create --name tempsnap-${instance_name} --wait ${instance_uuid}

# Get snapshot uuid and min disk
snap_uuid=$(openstack image show tempsnap-${instance_name} -c id -f value)
min_disk=$(openstack image show tempsnap-${instance_name} -c min_disk -f value)

# Create volume from snapshot
echo "Starting volume creation from snapshot"
openstack volume create --image ${snap_uuid} --size ${min_disk} --type fast ${instance_name}-bootvolume

# Get volume uuid
vol_uuid=$(openstack volume show ${instance_name}-bootvolume -c id -f value)

# Wait until volume is available
echo "Waiting for volume creation to be done, checking status every 10 seconds. This will take a while"
while [ $(openstack volume show ${vol_uuid} -c status -f value) != "available" ]; do
	openstack volume show ${vol_uuid} -c status -f value
	sleep 10
done

echo "Root volume created"

# Delete temp snapshot
echo "Deleting temporary snapshot ${snap_uuid}"
openstack image delete ${snap_uuid}

# Detach ports
echo "Detaching port ${instance_portid} from original instance"
openstack server remove port ${instance_uuid} ${instance_portid}

# Detach volumes
for v in ${instance_volumes}; do
	echo "detaching volume ${v}.."
	openstack server remove volume ${instance_uuid} ${v}
done

### CREATE NEW INSTANCE

echo "Creating new instance ${new_instance_name}"
echo "openstack server create --wait --volume ${vol_uuid} --flavor ${new_flavor} --port ${instance_portid} ${servergroup} ${new_instance_name}"
openstack server create --wait --volume ${vol_uuid} --flavor ${new_flavor} --port ${instance_portid} ${servergroup} ${new_instance_name}
new_instance_uuid=$(openstack server show ${new_instance_name} -c id -f value)

# Add volumes
for v in ${instance_volumes}; do
	echo "Adding volume ${v} to new instance"
	openstack server add volume ${new_instance_uuid} ${v}
done
```
