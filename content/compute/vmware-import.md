# VMware import

## Overview

To import disk images from VMware, a few steps are required.

A bare minimum approach listed below. Optimize as desired.

Pre-requisites:

  * A CentOS (7 preferred) "datamover" VM setup in the VMware cluster, with EPEL repository and `pigz`, `pv`, `screen` installed. Give it 4-8 GB RAM and 2-4 vCPUs.
  * Another Linux host, accessible using SSH from above CentOS host, prepared with Openstack CLI, libvirt/KVM and a several hundred GB large storage volume (HDD performance (100+ MB/s) is sufficient). **Do not connect its network adapter to a working network** (for safety).
  * Credentials to access the OpenStack Project using CLI -- not explained in this guide.
  * If Windows among VMs to be transferred, [virtio-win.iso](https://fedoraproject.org/wiki/Windows_Virtio_Drivers)

Method at a glance:

  * Transferring the volume to the libvirt/KVM host:
    * Take not of what OS the VM to be copied contains, and what the path to its storage is.
    * Shut off VM to be copied.
    * Shut off the "datamover" VM if it isn't powered down already.
    * Edit the settings of the "datamover", and add the harddrive(s) that the source VM had ("use existing harddrive"). (Adapt accordingy if it was using local storage by migrating the datamover to the same host.). Add these harddrives in a non-persistent way, reverting any changes.
    * Boot the datamover, start a screen window (`screen -S datamover`) and verify e.g. using `cfdisk /dev/sdb` that the recently added harddrive is indeed `/dev/sdb`. (`lsblk` is another useful tool.) Run a line similar to: `dd if=/dev/sdb bs=16M | pigz -c -1 | pv | ssh -c chacha20-poly1305@openssh.com -p 22 $username@$hostname "pigz -cd | dd of=/mnt/bigstoragedevice/imagename.raw bs=16M`"`
  * After transfer is complete, at libvirt/KVM host:
    * It is recommended to first make a local copy of the image file on the same storage device, in case you mess up something, so you don't need to redo the SSH copy.
    * If being the first VM to be copied, prepare a VM template in libvirt. Example that follows using `virt-manager`
      * Choose to create a new VM from existing disk image and point out the recently copied image. Pick the correct OS.
    * Follow the OS-specific steps below.

**Windows 2012 R2**

  * Make sure the VM template imports C: using `IDE` bus type emulation.
  * Add a secondary dummy harddrive at 1 MB and use `Virtio` bus type emulation.
  * Make sure the CD-ROM emulation uses `IDE` bus type emulation and has the virtio-win ISO mounted.
  * Boot machine and login (for fun: note how slow it is to boot)
  * Go to the CD drive, and:
    * Browse to `Balloon/2k12r2/amd64/` and right-click `balloon.inf` and hit "Install". Accept and trust the driver publisher.
    * Browse to `NetKVM/2k12r2/amd64/` and right-click `netkvm.inf` and hit "Install".
    * Browse to `vioscsi/2k12r2/amd64/` and right-click `vioscsi.inf` and hit "Install".
    * Browse to `vioserial/2k12r2/amd64/` and right-click `vioserial.inf` and hit "Install".
    * Browse to `viostor/2k12r2/amd64/` and right-click `viostor.inf` and hit "Install".
    * Browse to `qemu-agent` and double click `qemu-ga-x64.msi`. It will automatically install.
  * Open up Windows' `Add or remove programs` window, and uninstall `vmware-tools`. **Do NOT accept to reboot the server at the end**
  * Power off the server completely.
  * Once powered off, go to the VM configuration and remove the 1MB dummy harddrive, then change the bus type emulation of C: from IDE to Virtio. Save changes.
  * Boot the VM again (for fun: note the speed difference from last time)
  * Login, open up `device manager` and check that the following devices & drivers showed up:
    * `Disk drives/Red Hat VirtIO SCSI Disk Device`
    * `Red Hat VirtIO Ethernet Adapter`
    * `Storage controllers/Red Hat VirtIO SCSI controller`
    * `System devices/VirtIO Balloon Driver`
    * `System devices/VirtIO Serial Driver`
  * Power off the VM a last time.

**Upload to Safespring Compute**

Once the process above is complete, you should have a Safespring Compute bootable image.
Now it's time to:

  * Upload image
  * Create volume from image
  * Boot server
  * Associate floating IP to server
  * Set security groups to server

**Upload image**
In your Openstack CLI shell, run:
`openstack image create --min-disk 100 --file $imagename.raw $imagename` -- replace image name and min-disk as necessary. `min-disk` should be equal to the drive size. Unit is GB. Round up. :)

This command creates an image in Openstacks Image Service, Glance. The upload takes a while and there is no progress bar. Check your network transfer rate.

**Create volume from image**
`openstack volume create --size 10 --type fast --image $imagename $volumename`

This creates an SSD-based image (`fast`). There is also a HDD-based option (`large`). This operation is pretty instant.
`$volumename == $imagename` seems like a good choice.

**Get network UUID**

`openstack network list` -- copy the UUID of the network you wish to boot the server in, to variable `$net_uuid` below.

**Boot server**
`openstack server create --volume $imagename --flavor b.large --nic net-id=$net_uuid --wait $vmname`

There are several flavors to choose from. Consult the other documentation.

**Associate floating IP to server**

Login using the web interface to associate a floating IP to the server.

**Set security groups to server**

Set security groups to the server.
