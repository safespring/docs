# Flavors
This chapter describes the different flavors and how they are used in the platform. It is important to understand what the different flavors imply and which combinations that is possible to boot a working instance.

# b. and lb. flavors
The flavors not starting with an l (b and legacy m flavors) does not come with any disk space in the flavor. You can see this in the flavor listing when starting the instance that they have a zero in the "Root Disk" column. This means that in order to boot an instance with such a flavor the root disk must be created beforehand under "Volumes". The procedure is to create a new volume and choosing that it should contain an image that you pick in the dropdown "Use Image as Source" which is visible if you pick "Image" under the dropdown "Volume Source".

Once the boot volume is created you can choose that as you boot media when creating the instance by first chosing "Volume" under the "Select Boot Source" under the "Source"-tab in the "Launch instance"-dialogue. 

!!! info "PRO tip"
    You can also start from the "Volumes" view and click the "Launch as Instance" in the context menu at the end of the row of the volume you just have created. You will now be redirected to the "Launch Instance"-dialogue with the correct settings in the "Source"-tab to boot your instance from the volume.

The flavors starting with l works a little bit different since they come with a root disk in the flavor. The l signals "local disk" and means that the instance will be created with a local disk coming with the flavor.

To boot these instance one should boot from "Image" under the "Source"-tab in the "Launch Instance"-dialogue. The image will be copied to the root disk of the instance before start.

!!! info "Important Note"
    It is important to understand the implications of the local disk flavors. The performance of them will be higher but the disk the image is created on  will be a single point of failure. If the disk crashes, the instance will not be restorable. **Therefore it is important that these instances either are stateless or backed up properly.** 

To spread capacity fairly over instances the IOPS quota on them are linear to the amount of disk space they reserve. This means that an l-flavor ending with 2d has twice the amount of IOPS reserved than an l-flavor ending with 1d. A flavor ending with 4d has four times IOPS quota compared to 1d. This should be taken into consideration if IOPS is important for you application running in the instance even though you do not need a larger disk space. The higher amount of disk reserved the faster the disk will be. 

If you have API-access you can view the IOPS quota with the command:
```
    openstack flavor list --long

!!! info "Conclusion"
    Flavors starting with an "l"  should be booted from "Image". Flavors NOT starting with an l should be booted from a volume created from an image. Combinations such as booting a l-flavor from volume or b-flavor from image will not work and render an error.


## Flavor naming convention
The table below shows some flavor names and a description of what they mean so that you can see the logic behind the naming.

| Flavor name    | Description                                                                  |
| -------------- | ---------------------------------------------------------------------------- |
| `b2.c2r8`      | No local disk (boot from volume) with 2 vCPUs and 8 GB of memory             |
| `l2.c2r4.100`  | 100 GB local disk (boot from image) with 2 vCPUs, 4 GB of memory             |
| `l2.c4r8.500`  | 500 GB local disk with 4 vCPUs and 8 GB of memory                            |
| `l2.c8r16.1000`| 100 GB local disk with 8 vCPUs and 16 GB of memory                           |


