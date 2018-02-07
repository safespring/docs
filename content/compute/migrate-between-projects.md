#Migrate an instance to another project
In order to migrate an instance from one project to another please perform the following steps:

1. Create a snapshot of the instance in the source project.
2. Create a new volume with the contents of the snapshot (instead of empty volume) in the source project.
3. Create a "Volume Transfer" in the source project.
4. Accept the volume transfer in the destination project.
5. Start the instance again from the volume in the destination project.

