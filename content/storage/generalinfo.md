# General S3 information

## Minimum required info for S3 access

Many clients will assume you are talking to AWS S3, in which case they might want you to add region and country and other information. This information isn't used by our endpoint, so you should be able to get many clients going with only access_key, secret_key and the https URL to the service:

+ Swedish site - https://s3-archive.api.cloud.ipnett.se
+ Norwegian site - https://s3-archive.api.cloud.ipnett.no

## Buckets, directories, files and objects

Your account will allow you to log in to the service, but in order to store anything in it, you must first make a bucket.
In the AWS service, the bucket name you choose will become a dns CNAME entry (makes sense in order to be able to load-balance among millions of customers) which makes the bucket name limited to what is acceptable as a DNS entry.

For most GUI and textbased clients, the bucket will be indistinguishable from a directory. Inside that bucket you may create directories and/or files. Creating more than one bucket is possible, but do mind that it can fail if the name isn't unique, or the name of it would not work as a DNS entry. The directories inside can have names with more variation of course.

