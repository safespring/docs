Image service
=============

> **note**
>
> Some of these instructions require use of Openstack command line
>
> :   tools.
>
Uploading an image
------------------

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

Downloading an image based on an existing instance
--------------------------------------------------

Downloading an image based on an existing instance currently requires
running Openstack cli commands and cannot solely be done through the
Horizon webui.

1.  Create a snapshot from an existing instance (either via openstack
    cli or in the Horizon webui).

> **note**
>
> Creating a snapshot takes some time since the whole instance disk image
>
> :   will be uploaded to the Glance image service over a
>     network connection. This will be the time to get some coffee.
>
2.  From the command line, list the all images in the project and verify
    that the snapshot is visible:

        glance image-list

3.  Use the following commmand to download the image to local storage:

        glance image-download <uuid-of-previously-created-snapshot> \
            --file <where-you-want-to-store-the-image-file-in-raw-format> \
            --progress

Launching a new instance based on an uploaded custom image
----------------------------------------------------------

Uploading a raw image can be done through the command line:

    glance image-create \
        --file <path-to-local-raw-image> \
        --disk-format=raw \
        --name <name-of-this-image> \
        --property architecture=x86_64 \
        --protected False \
        --visibility private \
        --container-format bare \
        --progress

After the upload have finished, verify that the image is visible:

    glance image list

The uploaded image can now be used to launch new instances. In the
Horizon webui, navigate to "Compute" -&gt; "Images". The uploaded image
should now be visible in the list. Click the "Launch" button to the
right of the uploaded image and fill in instance information as usual.
