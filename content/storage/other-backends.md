# Interfacing S3 with other programs

More and more programs are integrating S3 as a backend for shared and
remote storage.  We will try to add hints on how to set them up, as we
encounter programs that need some extra care to work smoothly. Most do
seem to settle for `access_key`, `secret_key` and remote endpoint URL.

## Terraform

In order to use S3 as a backend to store state files, you need to add
a section in your `.tf` file looking something like this:

``` shell
terraform {
  backend "s3" {
    bucket     = "bucketname"
    key        = "bucketname/terraform.tfstate"
    region     = "us-east-1"
    endpoint   = "s3.osl2.safedc.net"
    access_key = "AccKeyGoesHere"
    secret_key = "VeryLongSecretKeyHere"
    skip_credentials_validation =true
    skip_get_ec2_platforms = true
    skip_region_validation = true
    skip_requesting_account_id = true
    skip_metadata_api_check = true
  }
}
```

You should have already made the bucket beforehand, and it needs to be
added both on the "bucket name" option and once again as a path
component on the "key" section which really isn't a key as much as
"under what filename would you like to store your state?".

The region doesn't matter to our endpoint, but "terraform init" will
not let it pass without you specifying one.
