## Converting a l. to a b. flavor while keeping the original ip address

This guide show the steps to convert a localdisk-backed (l.) flavor to volume-backed (b.) while keeping the original ip address.

A port that is created in the same process as creating an instance will automatically be deleted when detaching from an instance or when the instance is deleted. 

Before you start you should therefore get confirmation that we have set `preserve_on_delete` to `true` for the port connected to the specific instance.

## Pre-conversion steps

Before starting the conversion it is a good idea to make note of the following:

* Instance name
* Instance IP address
* Security groups
* (current) Flavor name
* List of currently connected volumes
* Any potential server groups

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
 * Choose a non-localdisk (b.*) flavor
 * DO NOT select a network
 * Under "Network Ports", select the same port as you detached earlier. The ip address should match the one you made a note of
 * Select the same Security Groups you had earlier
 * Key pair is not necessary
 * If you wish to use server groups for instance separation this is it.
* Launch instance.
* IF you detached extra volumes from the old instance earlier, attach these to the new one:
 * Under Compute -> Instances, select "Attach Volume" in the drop-down menu of the new instance, then select volume to attach and click "Attach volume". This needs to be done for each volume you need to attach

