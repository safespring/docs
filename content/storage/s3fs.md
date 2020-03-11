# How to setup s3fs for use with Safesprings S3

## Ubuntu 16.04

### 1. First install s3fs

```
$ sudo apt-get install s3fs
```

### 2. Set up credentials
To set up credentials put your AWS key and secret in the file `~/.passwd-s3fs`:

`<your_aws_key_id>:<your_aws_secret_key>`

This file must have the permissions `0600`. It is also possible to put the contents in `/etc/passwd-s3fs`. The rights for this file must be set to `0640`.

### 3. Mount the S3-storag
To mount the S3-storage (and to set up cache in order to increase performance:

```
$ sudo mkdir /tmp/cache
```
```
$ sudo mkdir /s3mnt
```
```
$ sudo chmod 777 /tmp/cache /s3mnt
```
```
$ sudo chmod 600 ~/.passwd-s3fs
```
```
$ sudo s3fs <bucket_name> -o use_cache=/tmp/cache -o sigv2 -o use_path_request_style -o url=https://s3-archive.api.cloud.ipnett.se -o allow_other -o multireq_max=5  /s3mnt
```
