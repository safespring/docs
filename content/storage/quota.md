## Background information

To ensure optimal performance and manageability Safespring applies certain quotas 
to our storage services. The main driving factor is that buckets with lots of objects 
in them get unmanageable since some operations such as "list all objects in the bucket"
takes a very long time if the number of objects in the bucket grow without control.

Good application design when using S3 Storage services is to build the ability to 
spread objects over several buckets. This could either be done keeping count how
many objects that are stored into the buckets, or by using a hash algorithm
that spreads the objects evenly over the different buckets.

Safespring Storage has two tiers:

1. Standard. The default tier, optimized for applications that need higher performance.
2. Archive. Designed for archiving, with larger objects that are written once and read occasionally.

Both tiers use the same credentials, which you get through Safespring Compute. You select the tier by connecting to its endpoint. See Connection details for the endpoints.

## Quota defaults

Depending on what type of S3 service is provided, there will be default quotas
set that applies to all users, and all new buckets created.

| Default quota       | Standard  | Archive   |
| ------------------- | --------- | --------- |
| Buckets per project | 10        | 2         |
| Bucket objects      | 1 million | 1 million |
| Bucket size         | 1 TB      | 32 TB     |
| Optimal object size | 1 MB      | 32 MB     |

With the standard tier, a project can by default store up to 10 TB of data
in 10 million objects across 10 buckets, if the objects are of optimal size.
With the archive tier, a project can by default store up to 64 TB of data
in 2 million objects across 2 buckets, if the objects are all 32 MB.

To maintain performance, Safespring does not increase the bucket objects
quota. If you need more storage, Safespring can increase the number of
buckets instead.
