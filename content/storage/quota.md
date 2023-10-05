## Background information

To ensure optimal performance and manageability Safespring applies certain quotas 
to our storage services. The main driving factor is that buckets with lots of objects 
in them get unmanageable since some operations such as "list all objects in the bucket"
takes a very long time if the number of objects in the bucket grow without control.

Good application design when using S3 Storage services is to build the ability to 
spread objects over several buckets. This could either be done keeping count how
many objects that are stored into the buckets, or by using a hash algorithm
that spreads the objects evenly over the different buckets.

Safespring has two types of S3 storage service:

1. S3 Storage. Our default S3 service to which you get the credentials through our portal to our Compute services. This service is optimized for applications that need higher performance.
2. S3 Archive. A S3 service designed for archiving purposes, for bigger objects that will be written once and read occasionally.


## Quota defaults

Depending on what type of S3 service is provided, there will be default quotas
set that applies to all users, and all new buckets created.

| Default quota       | S3 Storage    | S3 Archive   |
| ------------------- | --------- | --------- |
| Buckets per project | 10        | 2         |
| Bucket objects      | 1 million | 1 million |
| Bucket size         | 1 TB      | 32 TB     |
| Optimal object size | 1 MB      | 32 MB     |

This implies that a project can store 10 million objects of up to
10TB data across 10 buckets by default, if using the optimal object size.
Similarly, for the archive service, the default will allow to store up to 64TB
in 2 million objects split over 2 buckets, if the objects are all 32MB in size.

To ensure the customer experience Safespring will not increase Bucket objects quota. On the other hand there is no problem to increase the number of buckets to increase the total amount of storage available.

By inspecting the table above you see that a S3 Storage account will be able to store 10 TB of data as long as the objects are spread evenly over the 10 provided buckets and not hitting the number of objects per bucket first. If you need more storage Safespring can increase the number of buckets provided.

For S3 Archive the total amount of storage provided is 2 times 32 TB, which gives 64 TB, as long as the number of objects do not go over 1 million. As before there are no problems to increase the amount of buckets to increase the total amount of storage available.
