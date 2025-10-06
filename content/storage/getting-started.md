# General S3 information

S3 is an object store, much like an FTP server, except it scales to
much larger sizes and uses `https://` for both integrity, safety and
accessibility.

## Get S3 credentials

!!! note
    Every project on Safespring Compute has one S3 account connected to it but one project can have several users. This means
    that when different users press the "View Credentials" button on Safespring Compute they will get different key pairs of access and secret
    keys. Important to understand is that these different key pairs will give access to the SAME S3 account, tied to the project.

S3 credentials are mapped to projects on Safespring's Compute platform.
This means that if you want to get credentials for S3 you will have to login into
version 2 of Safespring's Compute platform and then choose "Project" up to the right and then API Access.
You will now see a button which says "View Credentials" and if you click that you will be presented with an
information screen:

1. S3 URL: this is the service point URL to which to direct your S3 Client.
2. EC2 Access Key: the S3 access key
3. EC2 Secret Key: the S3 secret key

![View Credentials](../images/view-credentials.png)



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
    + Norwegian site  - https://s3.osl2.safedc.net
    + Swedish site - https://s3.sto1.safedc.net
    + New Swedish secondary site - https://s3-archive.sto2.safedc.net

The URL change was due to the rename from IPNett to Safespring of our
company.  The old IPNett URLs have now expired and all new client
configurations should point to the new safedc names.

The `new safedc.net` S3 URLs contain wildcard subdomain certificates so that
clients, libraries or frameworks who insist on accessing the domain with `https://BUCKETNAME.URL/dir/object`
for an object named `https://URL/BUCKETNAME/dir/object` will work as expected.
This feature is not yet fully tested but we'll update this documentation when
it is.

## Client Configuration Examples

To help you get started quickly with various S3 clients, we provide sample configurations for popular tools and applications. These examples include the correct endpoint URLs and configuration settings specific to Safespring's S3 service:

- [AWS CLI](howto/configs/aws-cli.md) - Command-line interface for Amazon Web Services
- [s3cmd](howto/configs/s3cmd.md) - Command-line S3 client with sync capabilities
- [Minio Client](howto/configs/minio-client.md) - High-performance S3-compatible client
- [Cyberduck](howto/configs/cyberduck.md) - GUI client for file transfers
- [Duck CLI](howto/configs/duck-cli.md) - Command-line version of Cyberduck
- [s3fs](howto/configs/s3fs.md) - Mount S3 buckets as local filesystems
- [CloudBerry](howto/configs/cloudberry.md) - Backup and file management tool
- [Nextcloud S3](howto/configs/nextcloud-s3.md) - Configure Nextcloud to use S3 storage

Each configuration guide includes installation instructions, setup details, and usage examples tailored for Safespring's S3 endpoints.

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

## S3 bucket naming constraints

In earlier setups we were running with `rgw_relaxed_s3_bucket_names` set to
`true`. This allowed a bit more characters but could cause issues with clients
& solutions expecting the stricter standard bucket naming constraints. To avoid
such issues in the future we are now running  with the default constraints
which can be seen here
<https://docs.ceph.com/en/octopus/radosgw/s3/bucketops/#constraints>.
