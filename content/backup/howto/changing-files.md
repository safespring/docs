# Handling changing files

## Nightly emails always report errors

A very common cause for that is files which are either read-locked
from TSM completely (more common on windows OSes) or files that change
constantly during backups.

The output from command line `dsmc inc` or the contents of
`dsmsched.log` will list the progress and results of the backup. If
files are changing the client will retry them later on, several times.

In the below example, the actual files that change are log files under
`/var/log`, and one in particular is hard to back up successfully,
`/var/log/audit/audit.log`.
    ```shell
    Normal File-->            85,113 /var/log/secure  Changed
    Retry # 1  Normal File-->            21,841 /var/log/messages [Sent]
    Retry # 1  Normal File-->            85,113 /var/log/secure [Sent]
    Normal File-->           144,000 /var/log/wtmp [Sent]
    Normal File-->         1,756,058 /var/log/audit/audit.log  Changed
    Retry # 2  Normal File-->            85,113 /var/log/secure [Sent]
    Retry # 1  Normal File-->           144,000 /var/log/wtmp [Sent]
    Retry # 1  Normal File-->         1,758,725 /var/log/audit/audit.log  Changed
    Retry # 2  Normal File-->         1,775,152 /var/log/audit/audit.log  Changed
    Retry # 3  Normal File-->         1,784,573 /var/log/audit/audit.log  Changed
    Retry # 4  Normal File-->         1,788,872 /var/log/audit/audit.log  Changed
    Normal File-->         6,291,591 /var/log/audit/audit.log.1 [Sent]
    Normal File-->         6,291,599 /var/log/audit/audit.log.2 [Sent]
    Normal File-->         6,291,641 /var/log/audit/audit.log.3 [Sent]
    ANS1228E Sending of object '/var/log/audit/audit.log' failed.
    ANS4037E Object '/var/log/audit/audit.log' changed during processing.
    Object skipped.
    Normal File-->         6,291,561 /var/log/audit/audit.log.4 [Sent]
    Normal File-->        47,820,447 /var/log/icinga2/icinga2.log  Changed
    Retry # 1  Normal File-->        47,820,447 /var/log/icinga2/icinga2.log [Sent]
    ANS1802E Incremental backup of '/var' finished with 1 failure(s)
    ```
After the fourth retry, the `audit.log` file was skipped due to constant
changes. In this case we know the answer to why it changes, it is
because the access of all files is logged on this particular machine.

So everytime dsmc tries to read `audit.log`, the local auditing system
will log, into that very file, that "dsmc tried to read `audit.log`, and
we allowed it". So when dsmc had read the file and sent it to the
server, it checks the last-changed-date and size, noticing those have
changed in that time.
    ```
    Total number of objects inspected:       58,902
    Total number of objects backed up:           69
    Total number of objects updated:             11
    Total number of objects failed:               1
    Total objects deduplicated:                  74
    Total number of retries:                     30
    ```
After all per-file stats, we get a total summary for the current run,
with `objects failed: 1` in there. This will end up on the nightly
report as:
    ```shell
    UORUIJSMAMENW   FILE_2000         futu   4     4     4     4     4    HOST1
    ```
So in order to get successful runs and clean reports that point out
other more "real" errors if they occur, you should add specific
`EXCLUDE` rules to your `dsm.sys/dsm.opt` files for files.

Read more on [Includes and Excludes](/backup/howto/includeexclude.md)

In the above example, the offending file is also getting rotated by
the operating system, so we are getting good backups of the
already-rotated audit files, which can be a hint to add a small script
to `PRESCHEDCOMMAND` in the `dsm.opt/sys` file to force rotation just
before the scheduled backup is running, which means you get all data
up-to that point in files which will then not be moving while the
backup runs.
