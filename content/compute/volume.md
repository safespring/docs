# Volume service

## Changing volume type

Safespring Compute has two volume types available, *fast* and *large*. It is
possible to migrate between these volume types using the API or the UI.

### Prerequisities

* The volume has to be *detached* from any instance for the migration to work.

Please make sure to unmount the volume from within the instance before
detaching it. The volume will be detached from the I/O subsystem of your
instance, so not removing it properly could cause a "hard" disconnect,
with risk of data loss.

### Migrating using the UI

1. Find the correct volume using the Volumes tab of your compute project.

1. Select *Change Volume Type* in the pulldown menu for the volume you want to
   migrate.

    ![Edit volume](/images/cinder-edit-volume.png)

1. Select the new volume type from the pulldown list

1. Set *Migration policy* to *On demand*

1. Click *Change Volume Type*

The volume service will now copy the volume from the old backend to the new.
Depending on the size of the volume, this operation will take some time.
