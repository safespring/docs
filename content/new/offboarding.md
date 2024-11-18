# Offboarding services

Safespring believes in the idea that you as a customer stays with us because you want to and not because you have to. With our open APIs and self service portal you can both start and delete resources by yourself. 

## How does billing work?
You as a customer only pays for resources you are using in the platform. With used resources we mean the following:
- Storage by created volumes
- Storage of volume snapshots
- Uploaded images (if you have uploaded your own)
- Snapshots of instances
- Instances not coompletely deleted from the platform. **Even if an instance it is turned off, Safespring still reserves the capacity so that you can turn it on at any time. Therefore the instance is still billed even when turned off.** To deregister an instance from billing the instance needs to be **deleted** completely from the platform. 

## Cleaning up projects
As a cloud provider Safespring does not know what is running inside of an instance, nor the data stored there. To avoid problems with responsibility of accidental loss of data Safespring will never delete anything for you. Once you have cleaned up a project Safespring can delete it, but only if the project is completely empty. Therefore the procedure for cleaning up a project is the following:

- Delete all instances (Compute->Instances)
- Delete all snapshots (Compute->Images)
- Delete all volume snapshots (Volumes->Snapshots)
- Delete all volumes (Volumes->Volumes)
- Email support@safespring.com and ask to remove the project. 

## Is my instance booting from image or from volume?
The tasks described below differs depending on if the instance you want to delete is booting from image or from volume.

To see if you instance is booting from image or volume do the following:

- Go to the "Volumes Attached"  under the instance Overview. You reach this page by clicking the instance name and then choose the Overview pane. At the bottom you see "Volumes Attached" where you find which volume the instance is booting from. 
- If there is no volume atteched to /dev/sda or /dev/vda this means that your instance is booting from image. Note that you can have other volumes attached to other devices such as /dev/sdb. This does NOT mean that you are booting from image, as long as there is no volume attached to an device ending with the letter “a”, your instance is booting from image.
- If you have a volume mounted to either /dev/sda or /dev/vda your instance is booting from volume. Also take not of which volume you instance is booting from as it will be needed later.

## Keeping instances ready to start
Sometimes you do not want to pay for an instance but be able to start it at anytime. In order to do that you will have to keep a snapshot of the instance (if it is booting from image with l2 flavor), or keep the booting volume (if the instance is booting from volume with a b2 flavor).

You will then only be billed for the storage of the instance, but not the cpu and memory allocations. 

For an instance booting from image (l2 flavor) the procedure is the following:

- Create a snapshot of the instance (Compute->Instances)
- Wait for the creation of the snapshot to succeed, it might take up to half an hour. Once the snapshot is marked as "Active" under Compute->Images the snapshot is finished. 
- Delete the instance (Compute->Instances)
- When you want to start the instance again, go to "Launch Instance" and choose "Snapshot" under Source and then pick the snapshot taken earlier to start and instance from the snapshot. 

For an instance booting from volume (b2 flavor) do the following:

- Delete the instance
- When you want to start the instance again, go to Volumes and choose "Launch as instance" from the dropdown menu of the volume reached by clicking the arrow down button at the end of the row.

## Deleting an instance completely
Is case you want to delete an instance completely, do the following:

- Delete the instance.
- Delete all snapshots taken of the instance under Compute->Images..
- Note if the instance is booting from volume (mounted to /dev/sda or /dev/vda) under the instance Overview. You reach this page by clicking the instance name and then choose the Overview pane. At the bottom you see "Volumes Attached" where you find which volume the instance is booting from. 
- Delete the instance.
- Delete all snapshots taken of the instance under Volumes->Snapshots.
- Remove the booting volume from Volumes->Volumes.

This concludes a complete removal of a single instance, either booting from image or volume. 

## Summary
Safepspring gives you full freedom regarding how much you want to spend on our services. We will only bill you for the resources you are using. By following the steps above for the different use cases you will be able to only run exactly what you intend to in Safespring platform.  
