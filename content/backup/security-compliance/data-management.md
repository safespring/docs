# Data Management

This document outlines the data management requirements and practices for Safespring Backup services.

## 2.1 Data Retention and Deletion

### Backup data retention time

How long backup data is retained depends on the following:

1. The files' retention time that is specified by the backup node policy domain (30DAYS, 60DAYS, 90DAYS, etc.) during the 
   time they were backed up.
2. When the expiration process runs. This is done approximately every 24 hours. Therefore, 
   theoretically, it could take an additional 24 hours before a file that should expire is actually expired.
3. The server's storage reuse delay before removing unreferenced data extents. 
   Data extents are chunks of the files stored on the backup server's storage pool(s). Multiple files may reference 
   the same data extent.
   Once all files that have referenced a particular data extent have expired, there will be a 5-day delay before the
   extent is removed and the space is ready for reuse. If a customer need their own dedicated storage pool on the 
   server, this delay may differ.
4. Whether a file version is active or inactive. When a version of a file has been seen on the client machine 
   during a backup session it is marked as _active_ and is retained until a newer version is seen during a future 
   backup session. If a new version is seen, the old version is marked as _inactive_ and is allowed to eventually 
   expire according to its retention time (and points 2 & 3). What is _seen_ during a backup session is determined by
   the [DOMAIN option and INCLUDE/EXCLUDE rules](../howto/include-exclude.md).
5. Whether the backup node is decommissioned. Files belonging to a decommissioned node are set to expire according to
   their retention policies regardless if they are active or inactive. Note that deleting a node in the Backup Portal
   is the same as decommissioning it. The node is not deleted instantly, but in accordance to its files' retention
   policies.

#### An example

A file that no longer exists on the client machine (is inactive) had a retention time of 30 days. 33 days have passed.
This means the data extents for the file have been dereferenced and the file is no longer available to the client.
Assuming no other file references these data extents (as part of the deduplication process), they will be removed 
after approximately 2 days, finalizing the erasure of the file and its content from the backup server.

### Decommissioning backup storage

When a server or one of its storage spaces is decommissioned, clearing of volume or S3 bucket data is left to the 
Safespring Compute and Storage infrastructures after the relevant volumes or buckets have been removed.

## 2.2 Backup and Recovery

The backup server DB2 databases are themselves backed up daily. Assuming the backup data (separate from the DB2 
databases) is undamaged, these database backups can aid us in recovering entire backup servers.

Complementary services such as the Backup Portal and IssAssist are backed up just like customer machines.
The recovery procedures are also the same.
