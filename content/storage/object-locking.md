# Object locking feature
Object locking is a new feature, that exists for certain test accounts at
Safespring storage. Object locking makes all objects uploaded to a bucket
immutable for a certain time, which makes it impossible to delete uploaded
objects before that time has passed. For instance, if a timer on one month
is configured on a bucket, all objects uploaded to that bucket will be
immutable and locked for a month before they can be deleted.

This is very useful as a protection for crypto-lockers which are getting more
and more advanced and also attacks the backup solution to prevent an easy
recovery from such an attack. By enabling Object locking the malevolent software
will not be able to the delete backups which will make it possible to recover.

## Object locking in Veeam
The latest versions of Veeam Backup has support for this feature and can be
enabled when creating an Object Storage Repository in Veeam:


![Veeam Immutable Setting](../images/immutable-setting.png)


### Creating buckets that allow object locking
In order to use object locking (with Veeam 10+ and the Immutable Feature for instance) you need to specify at creation time that the bucket is to allow locking of objects, this can be done with minios “mc” or with aws-cli command:

```shell tab="minios “mc”"
mc —with-lock mb ceph/mybucket
```

```shell tab="aws-cli"
aws --endpoint=https://s3.stoX s3api create-bucket --bucket=bucketnamehere --object-lock-enabled-for-bucket
```
