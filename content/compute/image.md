# Image service

!!! info
    Some of these instructions require use of Openstack command line tools.
## Policy regarding images provided in the platform
Safespring provides images from the following distributions and operating systems:
1. Centos
2. Debian
3. Ubuntu
4. Windows

Safespring does not make any modifications to the images but sources them from the upstream provider from the official OpenStack image repos. 

Safespring takes the responsibility for the following things for the images uploaded to the platform:
1. That the checkssum provided by the upstream provider matches the checksom of the image uploaded to the platform
2. The the images can boot on a new instance
3. The new instance booted from the image gets an IPv4 and IPv6 adress
4. The the SSH-key provided at creation gets properly injected into the "authorized_keys"-file of the instance
5. The the instance can connect to a network with one interace.

Safespring guarantees to upload an image at most two week after a new stable release of the operating systeam listed above has been relelased.

## Uploading an image

### Size limit using the web interface

While it is possible to upload images using the Horizon web interface
there is currently a 2G size limit. For larger images, using the command
line tools will work or asking the openstack software to DL the image
from an URL you supply.

### Image format support

Due to how we use Ceph as the image backend store all images in the
image service are converted to raw format before they are booted. This
implicates that to avoid this from happening EVERY time a new instance
is booted images need to be uploaded in raw format only.

-   If a large image is uploaded in e.g qcow2 format the at-boot
    conversion of it will take a long time, making the boot process
    seem stuck.
-   Please use external tooling to convert your images to raw
    before uploading.

We have plans to mitigate and better work around some of these
limitations.

## Downloading an image based on an existing instance

Downloading an image based on an existing instance currently requires
running Openstack cli commands and cannot solely be done through the
Horizon webui.

1.  Create a snapshot from an existing instance (either via openstack
    cli or in the Horizon webui).

    !!! note
        Creating a snapshot takes some time since the whole instance disk image will be uploaded to the Glance image service over a network connection. This will be the time to get some coffee.

2.  From the command line, list the all images in the project and verify
    that the snapshot is visible:

        glance image-list

3.  Use the following commmand to download the image to local storage:
    ```
    glance image-download _uuid_of_previously_created_snapshot_ \
        --file _local_filename_to_save_raw_image_to_ \
        --progress
    ```

## Launching a new instance based on an uploaded custom image

Uploading a raw image can be done through the command line:

    glance image-create \
        --file _path_to_local_raw_image_ \
        --disk-format=raw \
        --name _name_of_image_ \
        --property architecture=x86_64 \
        --protected False \
        --visibility private \
        --container-format bare \
        --progress

After the upload have finished, verify that the image is visible:

    glance image list

The uploaded image can now be used to launch new instances. In the
Horizon webui, navigate to `Compute` -&gt; `Images`. The uploaded image
should now be visible in the list. Click the `Launch` button to the
right of the uploaded image and fill in instance information as usual.

## Changing disk type on an image

If your disk image comes from an existing installation of another
virtualization kit, the OS on the inside might have a limited amount
of drivers and specifically might be lacking the virtio drivers which
are generally considered the most performing ones.

Booting without correct drivers will mostly end up in some kind of
recovery mode in early boot at best, so changing the disk-type of an
image is sometimes vital during import.

You will need the image ID, either by looking at the web portal or
running ``glance image-list``. Then change the bus type to something
you expect will work.

IDE would be the safest for older OSes, but least performant since IDE
never can have multiple I/Os in flight so a guest using IDE will never
issue them in parallel even if our underlying storage would handle
it. The other alternatives include "scsi", "usb" and the default
"virtio".

    glance image-update \
        --property hw_disk_bus=ide \
        abcd-defg-12345678-901234-abcd

Migrations could be made with a changed bus type on an imported disk
image from another system, then from within the instance you update
and/or install virtio drivers and shutdown the instance, then make a
new image from the virtio-capable volume and then start a normal
virtio-only instance using the second image and lastly delete the
first instance.

This can also be used to change the network card type, using the
property `hw_vif_model`. Default is `virtio` but the list also has
`e1000`, `ne2k_pci`, `pcnet`, `rtl8139` where `e1000` emulates an Intel
Pro gigabit ethernet card, and the others are different versions of
old chipsets almost never used nowadays. This is rarely needed.
