# General S3 information

S3 is an object store, much like an FTP server, except it scales to
much larger sizes and uses `https://` for both integrity, safety and
accessibility.

## Minimum required info for S3 access

Many clients will assume you are talking to AWS S3, in which case they might
want you to add region and country and other information. This information isn't
used by our endpoint, so you should be able to get many clients going with only
`access_key`, `secret_key`.  The access- and secret keys are not personal, so
you should store them securely and share them within a project. 

!!! note
    In a future update, we will offer personal S3 credentials that are
    valid within a project.

The `https` URLs to the service:

!!! info "New URLs"
    + New norwegian site - https://s3-archive.osl1.safedc.net
    + Norwegian site  - https://s3.osl1.safedc.net
    + Swedish site - https://s3.sto2.safedc.net


``` tab="Sweden (Old URL)"
Old Swedish URL - https://s3-archive.api.cloud.ipnett.se
```

``` tab="Norway (Old URL)"
Old Norwegian URL - https://s3-archive.api.cloud.ipnett.no
```

The URL change is due to the rename from IPNett to Safespring of our
company.  The old URLs will continue to work for a long time, but new
client configurations should point to the new name.

The `new safedc.net` S3 URLs contain wildcard subdomain certificates so that
clients, libraries or frameworks who insist on accessing the domain with `https://BUCKETNAME.URL/dir/object`
for an object named `https://URL/BUCKETNAME/dir/object` will work as expected.
This feature is not yet fully tested but we'll update this documentation when
it is.

## Buckets, directories, files and objects

Your account will allow you to log in to the service, but in order to
store anything in it, you must first make a bucket.  In the AWS
service, the bucket name you choose will become a dns `CNAME` entry
(makes sense in order to be able to load-balance among millions of
customers) which makes the bucket names limited to what is acceptable
as a `DNS` entry.

For most GUI and text-based clients, the bucket will be
indistinguishable from a directory. Inside that bucket you may create
directories and/or files. Creating more than one bucket is possible,
but do mind that it can fail if the name isn't unique, or the name of
it would not work as a `DNS` entry. The directories and files inside can
have names with more variation of course.
