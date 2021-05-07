# Differences from older platform 

## s3 bucket naming constraints

In earlier setups we were running with `rgw_relaxed_s3_bucket_names` set to `true`. This allowed a bit more characters but could cause issues with clients & solutions expecting the stricter standard bucket naming constraints. To avoid such issues in the future we are now running  with the default constraints which can be seen here <https://docs.ceph.com/en/octopus/radosgw/s3/bucketops/#constraints>.
