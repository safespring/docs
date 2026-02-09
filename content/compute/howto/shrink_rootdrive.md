## Shrinking the root drive of an instance

This page includes OpenStack CLI commands. See the [API Access documentation](../api.md) for instructions on how to install and configure the command line client.

In openstack you can resize an instance, ie change core count, add/remove ram and add local drive space relatively easily.

Due to complexity issues what you can _not_ do is to shrink the local drive - for example from a l2.c2r4.1000 flavor down to a l2.c2r4.100 one.

There are still ways to do this, if needed, although the procedure will vary based on which operating system and what filesystems you are running on the instance.

This guide will show one way to do this on an Ubuntu 20.04 instance with a gpt formatted drive using an external linux-based computer. The main steps will be similar in all cases, but tooling to edit filesystem sizes etc will vary between os'es and filesystem types.

In this example I am using a computer running Fedora 38, with the following installed:

* python3-openstackclient (for openstack cli commands)
* qemu-img (for doing resize and mounting the image locally)
* gparted (to resize partitions)
* gdisk (to fix gpt info after resizing the disk)


## IMPORTANT PRE-RESIZE STEPS

There are two things that must (and must not) be done during this process:

### Keeping the original ip address

The ip address of a normally created instance is ephemeral and will auto-release itself when the port using it is disconnected from the original instance.

If you want to keep the current ip address of the instance, please create an issue with support@safespring.com where you specify the instance id of your instance and that you want to set / verify that the connected ports are set to be persistent.

A persistent port will not disappear on disconnect from the instance and can therefore be moved to another instance, which is what we want here.

### DO NOT DELETE THE ORIGINAL INSTANCE

The resize process has a couple of steps where all data being worked on can be lost. To insure that the original data is intact until you have a new working instance, *do not delete the original instance until you have a new verified working smaller instance*.

As long as the original instance is present you can always restart the process, and if the process for some reason does not work you can just abort and power on the original instance again.

## Resizing the local drive

Just to reiterate, before starting make sure you

* have a persistent ip address
* have made a mental note _not to delete the original instance until you are 100% sure the new one works_.

Also, the total amount of data on the current root drive can not exceed the space you are resizing to, so if you want to resize to 100G but have 101G of data you will have to do some cleanup.

When you have made sure of these things, do the following:

* (optional, but probably smart) - power down the instance
* Snapshot the instance `openstack server image create <instance_id> --name <snapshotname>`
* You will get a confirmation that the operation is `queued`. Wait until the image gets an `active` status - you can check this by taking the image id and running `openstack image show <image_id>` - it should change from `queued` to `saving` and then become `active` after a while.
* Download the snapshot image to your computer `openstack image save --file full_image.qcow2 <image_id>` - the `full_image.qcow2` file will be saved locally so make sure you have enough space for it.
* Load the nbd module - this makes it possible to mount qcow2 images locally `sudo modprobe nbd max_part=10`
* Mount the qcow2 image `sudo qemu-nbd -c /dev/nbd0 full_image.qcow2`
* run gparted on the mounted drive `gparted /dev/nbd0`
* right-click the root partition, select "resize/move", input a "new size" that is smaller than the rootdrive you are migrating to (so _less than_ 100G if you migrate to a 100G drive) - the cloudinit system should expand the drive to max available on first boot, but instance create will fail if the image is too big.
* when happy with the partition setup, click "apply all operations" (little green checkmark) then "Apply" and then wait until done.
* Quit gparted
* Unmount the nbd drive `sudo qemu-nbd -d /dev/nbd0`
* Shrink the qcow2 image `qemu-img resize --shrink full_image.qcow2 95G` (this will effectively chop off anything past the 95G mark)
* Mount the smaller qcow2 image `sudo qemu-nbd -c /dev/nbd0 full_image.qcow2`
* GPT drives have important (back-up)data at the end of the drive which is now gone. To fix this run `gdisk /dev/nbd0` to see that not everything is ok, then `w` and accept the warnings to write the partition table including the GPT backup correctly to the image.
* Unmount the nbd drive once more `sudo qemu-nbd -d /dev/nbd0`
* Upload the new smaller image to openstack `openstack image create --file full_image.qcow2 <name_of_new_image>`
* Again, wait until the upload is done
* The image is now ready to be used in a new instance.

## Using the image in a new instance.

This will be a more cursory walkthrough, as it is not directly involved in the resize process

* Power off the original instance
* Detach the network port from the original instance
* Create a new instance with
  * The image you uploaded as boot source (Select Boot Source > Image, then select your image)
  * The flavor you want (Note that the disk needs to be able to fit your new image here)
  * No network (this is covered by the network port in the next step)
  * The Network Port you detached from the original instance
  * Any security groups, server groups etc as you had in the original instance

You should now have an instance with a smaller drive but apart from that the same content as you started with.
