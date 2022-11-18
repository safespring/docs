# Introduction to TSM

_This page covers the following topics:_

* Installing TSM
* Adding trust to the Safespring PKI
* Requesting TSM node credentials
* Configuring TSM autostart
* Basic TSM configuration (initial backup)
* Start/stop WebUI (Unix only)
* Recovering files


## Install TSM

See [TSM Installation](/backup/install/overview).


## Backup

### Scheduled Backup

Scheduled backup requires the TSM client acceptor daemon service (dsmcad),
managed using the dsmcad init script:

```shell
/etc/init.d/dsmcad {start|stop|restart|status}
```

### Manual Backup

Incremental backup, backup changed files, file path/filesystem optional
parameter:

```shell
cd /opt/tivoli/tsm/client/ba/bin
dsmc
tsm> incremental [/path/to/backup]
```

Selective backup (always backup, including non-changed files):

```shell
cd /opt/tivoli/tsm/client/ba/bin
dsmc
tsm> selective </path/to/backup> [option]
```

## Restore

Restore a file examples (dsmc help restore):

```shell
cd /opt/tivoli/tsm/client/ba/bin
dsmc
```

Restore the most recent version of a deleted file:

```shell
tsm> restore /path/to/file.txt -latest
```

List all versions of a file, pick one to restore:

```shell
tsm> restore /path/to/file.txt -pick -inactive
```

Restore file1 to new name and location:

```shell
tsm> restore /path/to/file1.txt /path/to/new/dir/file2.txt
```

Restore file structure to original location including subdirectories:

```shell
tsm> restore /home/ -subdirs=yes  
```

Restore many files to new location, trailing / is important if "projects" is a dir, use " " for paths with wildcards:

```shell
tsm> restore "/home/john/Documents/*" /home/glenn/projects/
```
