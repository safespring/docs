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

# Object locking in Veeam
The latest versions of Veeam Backup has support for this feature and can be
enabled when creating an Object Storage Repository in Veeam:

 
![Veeam Immutable Setting](/images/immutable-setting.png)

To use this feature two prerequisites must be met:
Before this can be done Safespring must create a bucket with the Object locking
feature enabled. Contact support@safespring.com to request such a bucket.

