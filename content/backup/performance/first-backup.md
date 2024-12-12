The First Backup
=========================

The Backup-Archive client can back up files using two methods, incremental and
selective backup. We recommend using selective backup when backing up machines
with a large number of files for the _first time_. 
This article explains why, and how to do so.

If you are only interested in knowing _how_ to perform
your first backup this way, skip to **How to Back up**.

Normal Operation
------------------
Under normal operation, we recommend using the **incremental** backup method. 
According to IBM:
```
The incremental command backs up all new or changed data in the locations 
that you specify, unless you exclude them from backup services.
```
Source: <a target="_blank" href="https://www.ibm.com/docs/en/storage-protect/8.1.24?topic=commands-incremental">
Incremental command documentation</a>

The `dsmc incremental` command:

- Only backs up new and modified files & directories **(*)**.
- Will obey the include/exclude rules in dsm.sys (or dsm.opt on Windows).

This is also what 
**scheduled backups** that are enabled from the Backup Portal do, 
they are incremental backups.

**(*)** A local deduplication cache (<a target="_blank" href="https://www.ibm.com/docs/en/storage-protect/8.1.24?topic=reference-enablededupcache">docs</a>), which is enabled by default, helps 
incremental backups run efficiently. This cache can be found on Linux systems 
at:
```
/opt/tivoli/tsm/client/ba/bin/TSMDEDUPDB_${SERVERNAME}${NODENAME}.DB
```
However, even with such optimizations, there is 
going to be some overhead incurred from comparing the metadata from your 
filesystems with the metadata from the backup server to prevent
unnecessary uploads to the server.

!!! note
      There are several variations of incremental backups. In this documentation, we
      are referring to <a target="_blank" href="https://www.ibm.com/docs/en/storage-protect/8.1.24?topic=use-file-backup-techniques#r_client_bup_method_filebackup__prog_incr__title__1">
progressive incremental backup</a>, unless specified otherwise. This is the recommended variation for normal 
      operation.

The First Complete Backup
----------------------------
When backing up a machine for the _first time_, you know beforehand that there 
is no data from your machine on the backup server. 
In such a case, the optimization above (caching) yields no benefit, 
and the Backup-Archive client will only incur an unnecessary overhead when using 
the incremental backup method.

This is why we recommend running the _first backup_ on a node with a large 
number of files using the 
**selective** backup method. According to IBM:
```
During a selective backup, copies of the files are sent to the server even if 
they did not change since the last backup - which can result in more than one 
copy of the same file on the server.
```
Source: <a target="_blank" href="https://www.ibm.com/docs/en/storage-protect/8.1.24?topic=commands-selective">
Selective command documentation</a>


The `dsmc selective` command:

- Will back up the files that you explicitly select, regardless if they already
  exist on the backup server or not.
- Will obey the include/exclude rules in dsm.sys (or dsm.opt on Windows).

Unlike incremental backups, the client does not 
consult the server to know which files to send. It will always attempt to back 
up the files and directories that are selected. **This allows the selective
method to be more efficient when all files must be backed up.**

Generally, a selective backup will consume more network bandwidth. But when 
performing a first backup, the difference to the incremental method will not
be as significant, as all files will be sent to the server regardless.

Benchmark
----------
To illustrate the difference, we can benchmark an initial incremental backup 
and an initial selective backup on similar systems. 

### System Specifications

Host OS: Ubuntu 24.04
Kernel version: 6.8.0-44-generic
CPU: 
RAM: 16 GB

### Caveat

Note that although we control for the set of files, there could be other 
factors that may differ, such as the load on the VM's storage backend, 
and the load on the backup server. 
The benchmarks were performed at a time when the backup server was known to 
be less busy, and in sequence, to lower the effect of these factors.

### Results



How to Back up
---------------

### Linux

1. Configure the [include/exclude rules](../howto/include-exclude.md) in 
   `/opt/tivoli/tsm/client/ba/bin/dsm.sys` according to your
   requirements. If nothing is specified, all local filesystems will be
   backed up.

2. Run:
   ```
   dsmc selective -subdir=yes '/*'
   ```
   The flag `-subdir=yes` means recursively backup subdirectories.

   **Suggestion:** If you are connecting to the machine remotely, it can be 
   a good 
   idea to use something like `tmux` and run the command inside it, which 
   prevents the command from stopping if your SSH session disconnects, 
   as the backup can take a while to run.
3. When done, from here on out, routinely back up the machine use the 
   incremental method. The easiest way to do so is to enable scheduled backups
   from the Backup Portal. Make sure that the `dsmcad` daemon is running
   on the system. More info is available [here](../install/linux.md#schedule-daily-backups).

   You can _manually_ run incremental backups as well:
   ```
   dsmc incremental
   ```
   Or shorter:
   ```
   dsmc i
   ```

### Windows

1. Configure the [include/exclude rules](../howto/include-exclude.md) in 
   `C:\Program Files\Tivoli\TSM\baclient\dsm.opt` according to your
   requirements. If nothing is specified, all local filesystems will be
   backed up except for certain locations that are excluded by default.

2. Open an administrative Command Prompt, and run:
   ```
   cd C:\Program Files\Tivoli\TSM\baclient
   dsmc selective -subdir=yes 'C:\*'
   ```
   If the machine has several drives, run this step once for each drive but 
   replace `C:\*` with the correct label.
3. Open another administrative Command Prompt, and run:
   ```
   cd C:\Program Files\Tivoli\TSM\baclient
   dsmc backup systemstate -systemstatebackupmethod=full
   ```
   The flag `-systemstatebackupmethod=full` means all system writer files are 
   backed up irrespective of what is already on the server.

4. When done, from here on out, routinely back up the machine use the 
   incremental method. The easiest way to do so is to enable scheduled backups
   from the Backup Portal. Make sure that the `TSM Client Scheduler` and 
   `TSM Client Acceptor` exist, and that `TSM Client Acceptor` is always 
   running. More info is available 
   [here](../install/windows.md#schedule-daily-backups).

    You can _manually_ run incremental backups as well by using the 
    Backup-Archive GUI:

      1. Click on Backup.
      2. Select `Incremental (complete)`.
      3. Select SystemState and Local on the tree view to the left.
      4. Click on the Backup button in the same window.
