# Checking your S3 usage statistics

In order to get a current view of the storage consumed in this service,
the S3 endpoint has a "usage" REST call in the API.

If you want to call it from your S3 framework, the call is documented
here:

https://docs.ceph.com/en/octopus/radosgw/s3/serviceops/#get-usage-stats

but there is an alternative where you can inform [aws-cli](/storage/aws-cli)
about the API call and get a new functions usable from the CLI tool.

The installation of these extras is documented here:

https://github.com/ceph/ceph/tree/master/examples/boto3

and assumes an already installed and configured [aws-cli](/storage/aws-cli).

After adding the [json-file](https://raw.githubusercontent.com/ceph/ceph/master/examples/boto3/service-2.sdk-extras.json) that describes the extension, you can
call aws like this: (with correct endpoint and profile-name for your configuration)

```
aws --endpoint-url https://s3.sto2.safedc.net --profile ceph-sto2 s3api get-usage-stats
{
    "Summary": {
        "TotalBytes": 164595434499,
        "TotalBytesRounded": 164614451200,
        "TotalEntries": 10333
    }
}
```

