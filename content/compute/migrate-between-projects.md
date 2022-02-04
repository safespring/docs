## Migrate an instance to another project
In order to migrate an instance from one project to another please perform the following steps:

### 1. Create a snapshot

Create a snapshot of the instance in the source project. Be aware that this takes a long time to complete.

![image](../images/snapshot.png)

### 2. Create a new volume

Create a new volume with the contents of the snapshot (instead of empty volume) in the source project.

![image](../images/create-volume.png)

### 3. Create a "Volume Transfer"

Create a "Volume Transfer" in the source project.

![image](../images/create-transfer.png)

Name the transfer something:

![image](../images/create-transfer-diag1.png)

You will be given back a transfer ID and an authorization key. Please write those down somewhere.

![image](../images/create-transfer-diag2.png)

### 4. Accept the volume transfer

Accept the volume transfer in the destination project.

![image](../images/accept-transfer-1.png)

Provide the transfer ID and the authorization key.

![image](../images/accept-transfer-2.png)

### 5. Start the instance

Start the instance again from the volume in the destination project. Under `Source` in the `Launch Instance`-dialog - pick `Volume` and then the transferred volume.

![image](../images/launch-instance-from-volume.png)
