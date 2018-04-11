# VMware import

## i. Overview

To import disk images from VMware, a few steps are required.

A bare minimum approach listed below. We use two different Linux servers below since it allows separation of the image raw copying job from the Libvirt preparation job.  Optimize as desired, perhaps by combining these two roles into one server if suitable, and uploading non-boot storage volumes directly to Safespring Compute from the "datamover".

The reason we copy the image before we make driver modifications is to preserve the clean VMware server just in case. Relying on VMware snapshots isn't ideal because it is complicated to make raw copies of volumes that are snapshotted.

**Method at a glance**

  1. Transfer boot volume to the Linux server with Libvirt and KVM.
  2. Prepare libvirt template for the server being transferred:
    * Boot up the server, login, install Virtio drivers, guest tools and uninstall VMware tools
    * Reboot server and validate driver installation
  3. Upload image to Safespring Compute, create volume and boot new server from volume

### Prerequisites

  * A CentOS (7 preferred) "datamover" server VM setup in the VMware cluster, with EPEL repository and `pigz`, `pv`, `screen` installed. Give it 4-8 GB RAM and 2-4 vCPUs.
  * Another Linux server, "libvirt-host", accessible using SSH from above CentOS host, prepared with Openstack CLI, libvirt/KVM and a several hundred GB large storage volume (HDD performance (100+ MB/s) is sufficient). **Do not connect its network adapter to a working network** (for safety).
  * Credentials to access the OpenStack Project using CLI -- not explained in this guide.
  * If Windows among VM OS' to be transferred, download `virtio-win.iso` from https://fedoraproject.org/wiki/Windows_Virtio_Drivers


## 1. Image transfer to "libvirt-host"

In vCenter / vSphere:

  * Take note of what OS the VM to be copied is and what the path(s) to its storage volume(s) are.
  * Shut off VM to be copied.
  * Remove any snapshots of the drives that are to be copied (see Overview).
  * Shut off the "datamover" VM if it isn't powered down already.
  * Edit the settings of the "datamover", and add the harddrive(s) that the source VM had ("use existing harddrive"). (Adapt accordingly if it was using local storage by migrating the "datamover" to the same host.). Add these harddrives in a non-persistent way, reverting any changes.
  * Boot the "datamover"

In the "datamover":

  * Login to the linux
  * Start a screen window (e.g `screen -S datamover`)
  * Verify e.g. using `cfdisk /dev/sdb` that the recently added harddrive is indeed `/dev/sdb`. (`lsblk` is another useful tool.)
  * Run a line similar to:
```shell
dd if=/dev/sdb bs=16M | pigz -c -1 | pv | \
  ssh -c chacha20-poly1305@openssh.com -p 22 $username@$hostname \
  "pigz -cd | dd of=/mnt/bigstoragedevice/imagename.raw bs=16M"
```
(where `$username` is the username at and `$hostname` the hostname or IP address of the "libvirt-host".)

## 2. Image driver preparation

Note:

  * It is recommended to first make a local copy of the image file on the same storage device, in case you mess up something, so you don't need to redo the SSH copy.
  * If being the first VM to be copied, prepare a VM template in libvirt. Example that follows uses `virt-manager`:
    * Choose to create a new VM from an existing disk image and point out the recently copied image. Pick the correct OS.
  * Follow the OS-specific steps below.

### Windows 2012 R2

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
    * Browse to `guest-agent` and double click `qemu-ga-x64.msi`. It will automatically install.
  * Open up Windows' `Add or remove programs` window, and uninstall `VMware Tools`. **Do NOT accept to reboot the server at the end**
  * Power off the server completely.
  * Once powered off, go to the VM configuration and remove the 1MB dummy harddrive, then change the bus type emulation of C: from IDE to Virtio. Save changes.
  * Boot the VM again (for fun: note the speed difference from last time)
  * Validation: Login, open up `device manager` and check that the following devices & drivers showed up:
    * `Disk drives/Red Hat VirtIO SCSI Disk Device`
    * `Network adapters/Red Hat VirtIO Ethernet Adapter`
    * `Storage controllers/Red Hat VirtIO SCSI controller`
    * `System devices/VirtIO Balloon Driver`
    * `System devices/VirtIO Serial Driver`
  * Power off the VM one last time.

### Windows 2008 R2 (x64)

  * Make sure the VM template imports C: using `IDE` bus type emulation.
  * Add a secondary dummy harddrive at 1 MB and use `Virtio` bus type emulation.
  * Make sure the CD-ROM emulation uses `IDE` bus type emulation and has the virtio-win ISO mounted.
  * Boot machine and login (for fun: note how slow it is to boot):
    * Windows will at or after login attempt to install device drivers for new devices.
    * It will not succeed.
    * It will ask to reboot
    * **NB!** Do not reboot!
    * Instead continue and fix the drivers.
  * Devices that Windows should have found, that are not working properly, are:
    - "Ethernet Controller"
    - "SCSI Controller"
    - "PCI Device"
    - "PCI Simple Communications Controller"
    - "High Definition Audio Controller"
    - It may have automatically and successfully installed the driver for an audio controller
  * Open up the "Device Manager" and go to "Other Devices" where these should be listed with a warning icon.
  * For each of the devices, right click the line item and choose "Update Driver Software" and then "Browse My Computer":
    - For "Ethernet Controller": Choose `virtio/netkvm/2k8r2/amd64/` -- check the box for "Always trust [...] Red Hat [...]".
    - For "PCI Device": Choose `virtio/Balloon/2k8r2/amd64/`
    - For "PCI Simple Communications Controller": Choose `virtio/vioserial/2k8r2/amd64/`
    - For "SCSI Controller": Choose `virtio/viostor/2k8r2/amd64/`
  * Then, browse to the installed ISO in a file browser, and install `guest-agent/qemu-ga-x64.msi`.
  * Open up Windows' `Programs and Features` window, and uninstall `VMware Tools`. **Do NOT accept to reboot the server at the end**
  * Power off the server completely.
  * Once powered off, go to the VM configuration and remove the 1MB dummy harddrive, then change the bus type emulation of C: from IDE to Virtio. Save changes.
  * Boot the VM again (for fun: note the speed difference from last time)
  * Occasionally, Windows may do some driver work and immediately ask to reboot again -- if so, do it.
  * Validation: Login, open up `device manager` and check that the following devices & drivers showed up:
    * `Disk drives/Red Hat VirtIO SCSI Disk Device`
    * `Network adapters/Red Hat VirtIO Ethernet Adapter`
    * `Storage controllers/Red Hat VirtIO SCSI controller`
    * `System devices/VirtIO Balloon Driver`
    * `System devices/VirtIO Serial Driver`
  * Power off the VM one last time.

### Windows 2008 (x64)

Use [the Windows 2008 R2 (x64) guide](#windows-2008-r2-x64).

### Windows 2003

  * Make sure the VM template imports C: using `IDE` bus type emulation.
  * Add a secondary dummy harddrive at 1 MB and use `Virtio` bus type emulation.
  * Make sure the CD-ROM emulation uses `IDE` bus type emulation and has the virtio-win ISO mounted.
  * Boot machine and login (for fun: note how slow it is to boot):
    * Windows will after login display a number of "Welcome to the Found New Hardware Wizard" wizard windows.
    * It is impossible to see the mapping between these and the underlying devices.
    * Close all the windows
  * You may be able to click the "Safely remove Hardware" system tray icon and see it list something like:
    - "Safely remove Microsoft UAA Bus Driver for High Definition Audio"
    - "Safely remove PCI Simple Communications Controller"
    - "Safely remove PCI Device"
    - "Safely remove SCSI Controller"
    - "Safely remove Ethernet Controller"
  * You may also experience that a hardware installation was performed automatially and successfully, in the form of a "System Settings Change" dialogue box stating "Windows has finished installing new devices. The software that supports your device requires that you restart your computer. You must restart your computer before the new settings will take effect. Do you want to restart your computer now?":
    * **NB!** Do not reboot!
    * Instead continue and fix the drivers.
  * Open up the "Device Manager" and go to "Other Devices" where these should be listed with a warning icon:
    - Other devices/Audio Device on High Definition Audio Bus
    - Other devices/Ethernet Controller
    - Other devices/PCI Device
    - Other devices/PCI Simple Communications Controller
    - Other devices/SCSI Controller
  * For each of the devices, right click the line item and choose "Update Driver Software", answer "No, not this time" to the question if Windows can connect to Windows Update and look for the drivers there, then select "Install from a list or specific location (Advanced)" then "Don't search. I will choose the driver to install", then "Show all devices", then "Have disk":
    - For "Ethernet Controller": Choose `virtio/netkvm/2k3/{x86 or amd64}/` -- check the box for "Always trust [...] Red Hat [...]".
    - For "PCI Device": Choose `virtio/Balloon/2k3/{x86 or amd64}/`
    - For "PCI Simple Communications Controller": Choose `virtio/vioserial/2k3/{x86 or amd64}/`
    - For "SCSI Controller": Choose `virtio/viostor/2k3/{x86 or amd64}/`
    - for Audio Device on High Definition Audio bus -- if Windows did not notify the successful installation of this driver, just skip it
  * Then, browse to the installed ISO in a file browser, and install either `guest-agent/qemu-ga-x86.msi` or `guest-agent/qemu-ga-x64.msi`.
  * Open up Windows' `Add or remove programs` window, and uninstall `VMware Tools`. **Do NOT accept to reboot the server at the end**:
    * If there is no option to "Remove" for VMware tools in "Add or remove programs", mount a VMware tools iso (i.e. https://packages.vmware.com/tools/esx/5.5/windows/index.html ) and, following https://kb.vmware.com/s/article/2010137, open `cmd`, navigate to the cd drive, type `setup /c` or `setup64 /c` depending on your OS architecture.
  * Power off the server completely.
  * Once powered off, go to the VM configuration and remove the 1MB dummy harddrive, then change the bus type emulation of C: from IDE to Virtio. Save changes.
  * Boot the VM again (for fun: note the speed difference from last time)
  * Occasionally, Windows may do some driver work and immediately ask to reboot again -- if so, do it.
  * Validation: Login, open up `device manager` and check that the following devices & drivers showed up:
    * `Disk drives/Red Hat VirtIO SCSI Disk Device`
    * `Network adapters/Red Hat VirtIO Ethernet Adapter`
    * `Storage controllers/Red Hat VirtIO SCSI controller`
    * `System devices/VirtIO Balloon Driver`
    * `System devices/VirtIO Serial Driver`
  * Power off the VM one last time.

### Windows 7

Probably quite similar to [the Windows 2008 R2 (x64) guide](#windows-2008-r2-x64).

## 3. Image upload

**Upload to Safespring Compute**

Once the image preparation process above is complete, you should have a Safespring Compute bootable image.

Now it's time to:

  * Upload image
  * Create volume from image
  * Boot server
  * Associate floating IP to server
  * Configure security groups on server

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
