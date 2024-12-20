Listing Backed-Up Files
===========================
This article explains how to list backed-up files.

Filespaces
-------------
On the backup server, a node's files are divided into filespaces. 

Usually, every backed-up mount-point on a machine gets its own filespace.
There are exceptions. VSS backups on Windows get their own 
filespace, and also when using the `VIRTUALMOUNTPOINT` option ([more info here](include-exclude.md#with-virtual-mount-points)) you end up creating a new 
filespace for every virtual mount-point. 

It is important to understand that this structure exists when 
listing backed-up files, or when recovering files.

Knowing which filespaces you have allows you to explicitly
specify the filespace when listing (or recovering) files. 
On a Unix-based system, your files are normally under the fs `/`, 
and you do not have to specify the filespace explicitly.
But if you have a filespace called, for example, `/home` 
alongside the filespace `/`, then it may be unclear where the files
you are looking for are if you are searching for files under `/home`.

This is how you find all filespaces on your node:
```
root@hostname ~# dsmc query filespace
IBM Storage Protect
Command Line Backup-Archive Client Interface
  Client Version 8, Release 1, Level 23.0 
  Client date/time: 2024-09-13 08:00:00
(c) Copyright by IBM Corporation and other(s) 1990, 2024. All Rights Reserved. 

Node Name: YOURNODENAME
Session established with server DCO1-BACKUP-SERVER-2: Linux/x86_64
  Server Version 8, Release 1, Level 21.000
  Server date/time: 2024-09-13 08:00:00  Last access: 2024-09-13 08:00:00

  #     Last Incr Date          Type    File Space Name
--------------------------------------------------------------------------------
  1     2024-09-13 04:16:26     EXT4    /               
```

The command `dsmc query filespace` can be shortened to `dsmc q f`.

You can also find this information in the Backup Portal by visiting 
`Consumption units -> Your Node -> File spaces`.

Listing backed-up files
---------------
A basic example of how to list backed-up files:
```
dsmc query backup -subdir=yes '{/home}/peter/'
```

### Explanation

Options:

- **-subdir=yes**: List all under the specified directory, recursively. 
  Without this option, dsmc will only show direct descendants. (<a href="https://www.ibm.com/docs/en/storage-protect/8.1.25?topic=reference-subdir" target="_blank">docs</a>)

Positional arguments:

- `'{/home}/peter/'`: The directory under which files you wish to 
  show. `/home` is the filespace. You may omit `{}` if you do not fear
  any ambiguity, by instead just writing `'/home/peter/'`. Here, the leading 
  `/` is important.

More information can be found <a href="https://www.ibm.com/docs/en/storage-protect/8.1.25?topic=commands-query-backup" target="_blank">here</a>.
