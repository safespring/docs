## Methods of restoring files to alternate node

1. Let the owner node delegate access to it's backup to another node. The restore node then uses it's own configuration, but tells TSM to access the data from the owner node.

2. Use the owner nodes configuration.

If you are doing restore testing, then method 1 is preferred. This method however requires that the owner node is still alive and able to delegate access to it's data.   

### Steps to use method 1

#### On the owner node

The owner node has to delegate access to it's backups, otherwise the restore node will not have permissions to access the data.

To authorize another node to restore or retrieve your files using the GUI:

1. Click `Utilities` → `Node Access List` from the main window.

2. In the `Node Access List` window, click the `Add` button.

3. Type the `NODENAME` on the node that should get access in the `Grant Access to Node` field.

4. In the `Filespace` and `Directory` field, select the file space and the directory that the user can access. You can select one file space and one directory at a time. If you want to give the user access to another file space or directory, you must create another access rule.

5. If you want to limit the user to specific files in the directory, type the name or pattern of the files on the server that the other user can access in the `Filename` field. You can make only one entry in the `Filename` field. It can either be a single file name or a pattern that matches one or more files. You can use a wildcard character as part of the pattern. Your entry must match files that have been stored on the server.

6. If you want to give access to all files that match the file name specification within the selected directory including its subdirectories, click `Include subdirectories`.

7. Click `OK` to save the access rule and close the `Add Access Rule` window.

8. The access rule that you created is displayed in the list box in the `Node Access List` window. When you have finished working with the `Node Access List` window, click `OK`. If you do not want to save your changes, click `Cancel` or close the window.

If you prefer the command line client, then use the set access command to authorize another node to restore or retrieve your files. You can also use the query access command to see your current list, and delete access to delete nodes from the list.

!!! note "Example"

    ```shell
    prompt> dsmc set access backup \\landsort\e$\* GYMMIX

    prompt> dsmc query access
    Type     Node        User        Path
    ----     ----------------------------
    Backup   FILE        *           \\landsort\e$\*
    Backup   GYMMIX      *           \\landsort\e$\*

    prompt> dsmc delete access
    Index Type     Node        User        Path    
    ----- ----     ----------------------------
      1   Backup   FILE        *           \\landsort\e$\*
      2   Backup   GYMMIX      *           \\landsort\e$\*

    Enter Index of rule(s) to delete, or quit to cancel:
    1,2

    prompt> dsmc query access
    ANS1302E No objects on server match query
    ```

#### On the restore node

Start the GUI and under the meny `Utilities` select `Access Another Node` and enter the node name.  Now you can do a restore as usual, but the client is reading the data from the owner nodes backup.

When doing a command line restore the option is `-fromnode=NODENAME`.

!!! note "Example"
    ```shell
    dsmc restore -fromnode=XXXXXXXXXX \\cougar\d$\projx\* d:\projx\
    ```

### Steps to use method 2

#### Windows

Copy `dsm.opt` from owner node to restore node, but change the name of the optfile to  another name. E.g. `dsm-restore.opt` The config file can also be downloaded from the portal or API if owner node is dead.

Reset the password for owner node in order to get a known password.  This can be done from the portal/API.

1. On the owner node make sure it knows it's new password. Start a new TSM session in order to enter the password (dsmc q session).   **Warning** do not forget this step - otherwise the backups will fail for owner node in the future.   Of course if owner node is dead, then you can skip this step.

2. On the restore node start the tsm GUI with the option `-optfile=dsm-restore.opt`  

!!! note "Example"
    ```shell
    dsm -optfile=dsm-restore.opt
    ```


!!! warning
    Sometimes admins replace dsm.opt on the restore node with to owner nodes `dsm.opt`.  This is dangerous since if you forget to undo the change, then two nodes with the same configuration will run backup under the same nodename.  This will corrupt the backups.

#### Linux/UNIX

Copy the content from the owner nodes `dsm.sys` and add append it to the restore nodes `dsm.sys`, but change the `SERVERNAME` line to `SERVERNAME  RESTORE_OWNERNODE`.

Reset the password for owner node in order to get a known password.  This can be done from the portal/API.

1. On the owner node make sure it knows it's new password. Start a new TSM session in order to enter the password (`dsmc q session`).

    !!! warning
        Do not forget this step - otherwise the backups will fail for owner node in the future. Of course if owner node is dead, then you can skip this step.

2. On restore node start the tsm GUI or command line with this option:
    ```shell
    -server=RESTORE_OWNERNODE
    ```

    !!! note "Example"
        ```shell
        dsmc -server=RESTORE_OWNERNODE
        ```
