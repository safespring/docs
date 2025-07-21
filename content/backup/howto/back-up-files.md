Back up Files or Directories
=============================

!!! note "Recommendation"
    In general, it is recommended to schedule automatic backup jobs as 
    described in the 
    [installation guide](../quickstart-guide.md#install-ibm-storage-protect-backup-archive-client) 
    of your operating system.
    This guide explains how to back up data _manually_.

It is possible to manually run backups of individual directories or files. Your
[include/exclude list](include-exclude.md) will be obeyed.

There are two ways to back up files or directories, using the graphical user 
interface (GUI) or the terminal.

Back up Using the GUI
----------------------
The GUI is available on both [Linux](linux-gui.md) and Windows but is more 
commonly used on Windows.

To back up directories and files:

1. Open the **Backup-Archive GUI**.
2. Click on **Backup**.
3. Select the directories and files you wish to back up.
   <br/>
   **Windows only:** If you desire a full system backup, 
   make sure to include `SystemState` as well.
4. Make sure to select **Incremental (complete)** on the dropdown menu.
5. Click on the **Backup** button in the top-left corner to begin the backup 
   process.

Back up Using the Terminal
---------------------------
Storage Protect's command line backup-archive client is called `dsmc`. This is
the most common client used on Linux. 
But it is available on Windows as well.

`dsmc` needs administrative privileges, so run it as root 
(or Administrator on Windows).

On **Linux**:
```shell
sudo -i
dsmc ...
```

On **Windows** (using the Administrative command prompt):
```shell
cd "C:\Program Files\Tivoli\TSM\baclient"
dsmc ...
```

Other than that, the `dsmc` will work mostly the same way on both operating 
systems.

To perform an incremental backup, use the `dsmc incremental` subcommand:
```shell
dsmc incremental -subdir=yes /home
```

### Explanation
This will back up everything under the `/home` directory recursively. 
The `-subdir=yes` flag tells the client that it the backup process must be 
recursive. 
If this flag was omitted, only the `/home` directory (and nothing inside) would 
have been backed up, which wouldn't have been very helpful.

More information about how this subcommand works can be found <a href="https://www.ibm.com/docs/en/storage-protect/8.1.26?topic=commands-incremental" target="_blank">here</a>.