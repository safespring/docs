# Migrate from legacy platform

Safespring has developed a method for migrating volumes from the legacy platform to our
current platform. This guide describes what the user needs to do in order to use the method. 

## Two cases
The preparations will differ depending on which kind of flavor or storage that the instance in the legacy platform is using:
1. Instance is booting from volume using persistent storage.
2. Instance is booting from image using ephemeral boot storage.

There is also a third case if the instance is booting from local disk. At the moment the method does not cover this case, but if it is ok to instead use central Ceph backed storage in the new platform this case will be the same as case 2.

The goal for the preparations in order to migrate the volume to the new platform is to convert it to a volume. Safespring can then be contacted with the following information and perform the migration:
1. Source project name in legacy platform.
2. Instance name in legacy platform.
3. Volume ID of the volume that should be migrated.
4. Volume IDs of any additional volumes that belong to the instance
5. Destination project name in the new platform.

## Case one
This case covers when the instance boot from volume. Since it already is booting from volume there are very few things that needs to be done:
1. Shut off the instance
2. Contact Safespring with the information above
3. Safespring will perform the migration and make contact when it is done.
4. The volumes belonging to the instance will now be visible in the destination project in the new platform so you can now create the instance again from the boot volume, and potential additional volumes that the instance had in the legacy platform.

## Case two
This case needs some more preparations. 
1. Shut off the instance. Detach any additional volumes. 
2. Create a snapshot of the instance.
3. When the snapshot has finished, go to "Images" and then pick "Create Volume" from the snapshot just created.
4. When that operation has finished, contact safespring with the information in the checklist above. Make sure to list the volume IDs of the additional volumes you detached earlier as well. 
5. Safespring will migrate the boot volume (and additional volumes you detached) and contact you back when it is done.
6. Recreate the instance from the boot volume and the additional volumes that you now can see in your destination project.

## Instances using local disk in the legacy platform
If the instance you want to migrate is booting from local disk and you could live with not using that in the destination platform you could do the same as in case 2. We are still working on a method to be able to move the data backend to backend for local disk but has no ready solution for that yet. You could also make a green field migration by creating a new instance in the new platform and migrate the actual data with rsync or such.


