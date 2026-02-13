# Using aws-cli with Safespring S3

## Installing aws-cli

Most package managers will have a package for aws-cli, but if not
the Amazon guide at:

  https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html

should help you get it installed.

## Setting up credentials

aws-cli will accept credentials in many ways. You can find your credentials by logging into the Safespring portal, clicking "API Access" and then "View Credentials". The values you need are:

1. **EC2 Access Key** - used as AWS Access Key ID
2. **EC2 Secret Key** - used as AWS Secret Access Key (click the eye-icon to reveal it)

### Using environment variables

```
export AWS_ACCESS_KEY_ID=<EC2 Access Key>
export AWS_SECRET_ACCESS_KEY=<EC2 Secret Key>
```
Also set the following variable to be able to easier copy and past the examples in the documentation:

```
export S3_URL=<S3 URL with https:// prefix>
```
The S3_URL should have the https:// prefix for the **aws** CLI commands in the documentation to work. 

### Using the interactive configurator

```
$ aws configure
  AWS Access Key ID [None]: <your access key>
  AWS Secret Access Key [None]: <your secret key>
  Default region name [None]:
  Default output format [None]: json
```

Our systems  will accept us-east-1  for region, mostly  because some
clients default to  it. It doesn't really matter for  aws-cli so you
can leave it blank. As for choosing json output, that is just a nice
way  of  presenting  data  and  not  strictly  required  for  normal
operations of aws-cli.

You still will have to set the S3_URL variable, mentioned above, in order for the examples the documentation pages to work. 

## Using aws-cli

Now that the credentials are saved, one can list buckets. Every aws-cli command must include the `--endpoint-url` flag to point at the Safespring S3 endpoint instead of AWS. Replace `S3_URL` with the endpoint from the "View Credentials" dialogue (e.g. `s3.sto1.safedc.net` or `s3.osl2.safedc.net`).

!!! note
    The `--endpoint-url` flag must be placed before the subcommand (e.g. `s3api` or `s3`), not after it.

```
aws --endpoint-url $S3_URL s3api list-buckets
```

Do note the subcommand "s3api" there.
You can upload one or more files with

```
aws --endpoint-url $S3_URL s3 cp DATETIME.txt s3://jj_demo
```

and list contents in a bucket:

```
$ aws --endpoint-url $S3_URL s3 ls jj_demo
2021-05-27 15:34:49         30 DATETIME.txt
```

Most of the setup commands use s3api subcommand, and operations later
on use the s3 subcommand. If the --help flag is not showing the s3 and
s3api subcommands, give it junk input like this:

```
  $ aws s3 sdflkasfklsdf
  $ aws s3api flgjsflgjdfg
```

to get listings of the actual availabe subcommands for aws s3 and aws
s3api.

Complete aws-cli docs are at:

https://docs.aws.amazon.com/cli/latest/index.html

S3 specifics:

https://docs.aws.amazon.com/cli/latest/reference/s3/index.html

and S3API:

https://docs.aws.amazon.com/cli/latest/reference/s3api/index.html
