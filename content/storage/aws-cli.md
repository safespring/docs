# Using aws-cli with Safespring S3

## Installing aws-cli

Most package managers will have a package for aws-cli, but if not
the Amazon guide at:

  https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html

should help you get it installed.

## Setting up credentials

aws-cli will accept credentials in many ways, including environment
variables, but you can also use the short interactive configurator:

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

## Using aws-cli

Now that the credentials are saved, one can list buckets,

  aws --endpoint https://s3.sto2.safedc.net s3api list-buckets

Do note the subcommand "s3api" there. 
You can upload one or more files with

  aws --endpoint https://s3.sto2.safedc.net s3 cp DATETIME.txt s3://jj_demo

and list contents in a bucket:

```
  $ aws --endpoint https://s3.sto2.safedc.net s3 ls jj_demo                   
  2021-05-27 15:34:49         30 DATETIME.txt
```

So most of the setup commands use s3api subcommand, and operations
later on use the s3 subcommand.
