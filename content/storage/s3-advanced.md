
## Access Control Lists in S3

This chapter describes how you can set up specific Access Control Lists (from now on called ACLs)
to control access to specific buckets or objects from other S3 users in the platform.

Reasons for doing this could be:

1. Give public access to a specific bucket or object
2. Give another S3 user read or read/write access to a specific bucket, objects or subfolder of a bucket.

### Naming Convention in this document

* Bucket Owner is a S3 account holder which has an object storage bucket intended for sharing to another S3 account holder in the same platform. 
* Bucket User which is a S3 account holder who wants to gain access to the Bucket Owner's bucket
* Buckets Owner's Project - the Bucket Owner's Project ID
* Bucket User's Project - the Bucket User's Project ID

In the examples below words written with capital letters, such as BUCKETOWNERPROJECT, are variables that should be replaced with values matching your use-case.

### Setting up S3 clients

The examples in this document use both s3cmd and aws-cli. See the respective configuration guides for installation and setup:

- [s3cmd configuration guide](howto/configs/s3cmd.md)
- [aws-cli configuration guide](howto/configs/aws-cli.md)

!!! note
    **aws** CLI sometimes can be cryptic with error messsages. If querying a property with **aws** CLI and that specific query returns the following:
    ```shell
    argument of type 'NoneType' is not iterable
    ```
    this just means that said property is not set.

To get the credentials needed for either tool, login to your Safespring account, click "API Access" and then "View Credentials". The important variables are:

1. **Project ID**
2. **S3 URL** (but without the https://)
3. **EC2 Access Key**
4. **EC2 Secret Key** (click the eye-icon to reveal it)

For the ACL and policy examples below, you will need credentials for both the bucket owner and the bucket user. With s3cmd, this means creating two separate configuration files. In the examples below we have named them **owner-s3.cfg** and **user-s3.cfg**.

### Setting up policies
Bucket policies are expressed as JSON-files with a specific format:

```
{
 "Version": "2012-10-17",
 "Id": "POLICY_NAME",
 "Statement": [
   {
     "Sid": "STATEMENT_NAME",
     "Effect": "EFFECT",
     "Principal": {
       "AWS": "arn:aws:iam::PROJECT_ID:root"
     },
     "Action": [
       "ACTION_1",
       "ACTION_2"
     ],
     "Resource": [
       "arn:aws:s3:::KEY_SPECIFICATION"
     ]
   }
 ]
}


```

| Key               | Value                                                                                     |
| -----------------     | ---------------------------------------------------------------------------------     |
| Version               | "2012-10-17", **cannot be changed**                                                   |
| Id                    | arbitrary policy name                                                                 |
| Statement             | a list of statements                                                                  |
| Statement.Sid         | arbitrary statement name                                                              |
| Statement.Effect      | Allowed values: "Allow" or "Deny"                                                     |
| Statement.Principal   | On or more accounts specified in Amazon arn format:                                   |
|                       | "AWS": ["arn:aws:iam::FIRST_PROJECT_ID:root","arn:aws:iam::SECOND_PROJECT_ID:root"]   |
| Statement.Action      | One or more actions that the policy should apply to. For a complete list of actions   |
|                       | see [here](https://docs.ceph.com/en/pacific/radosgw/bucketpolicy/#bucket-policies)    |
| Statement.Resource    | Specifies to which resources the policy should be applied. Could be one of:           |
|                       | "arn:aws:s3:::\*" - the bucket and its all objects                                    |
|                       | "arn:aws:s3:::mybucket/\*" - all objects of mybucket                                  |
|                       | "arn:aws:s3:::mybucket/myfolder/\*" - all objects which are subkeys to                |
|                       | myfolder in mybucket.                                                                 |

### Applying and inspecting policies
Let's say that you have created a policy file called policy.json. To let the owner apply this policy the following command is used:

```shell tab="s3cmd"
s3cmd -c owner-s3.cfg setpolicy policy.json s3://sharedbucket
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3api put-bucket-policy --bucket sharedbucket --policy file://policy.json
```

To view the current policies on the bucket issue the following:

```shell tab="s3cmd"
s3cmd -c owner-s3.cfg info s3://sharedbucket
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3api get-bucket-policy --bucket sharedbucket
```

To delete a policy from a bucket, use the following:

```shell tab="s3cmd"
s3cmd -c owner-s3.cfg delpolicy s3://sharedbucket
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3api delete-bucket-policy --bucket sharedbucket
```

Now you are good to go to start writing your policies!


### Sample policies 

#### Grant another user read and write access to a bucket

Create a file **rw-policy.json** with the following contents. You need to replace the BUCKET_OWNER_PROJECT_ID and BUCKET_USER_PROJECT_ID with the values you fetched from the portal above.

```
{
  "Version": "2012-10-17",
  "Id": "read-write",
  "Statement": [
    {
      "Sid": "project-read-write",
      "Effect": "Allow",
      "Principal": {
        "AWS": [
          "arn:aws:iam::BUCKET_OWNER_PROJECT_ID:root",
          "arn:aws:iam::BUCKET_USER_PROJECT_ID:root"
        ]
      },
      "Action": [
        "s3:ListBucket",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::*"
      ]
    }
  ]
}
```
To apply the policy, let the owner issue the following:

```shell tab="s3cmd"
s3cmd -c owner-s3.cfg setpolicy rw-policy.json s3://sharedbucket
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3api put-bucket-policy --bucket sharedbucket --policy file://rw-policy.json
```

The owner now has to send its Project ID, and the name of the bucket to the user.

To list the contents of the bucket, the bucket user should issue:

```shell tab="s3cmd"
s3cmd -c user-s3.cfg ls s3://BUCKET_OWNER_PROJECT_ID:sharedbucket
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3api list-objects --bucket BUCKET_OWNER_PROJECT_ID:sharedbucket
```

The user now should see a listing of the contents of the bucket.

#### Grant any user read access to a bucket

Create a file called **all-read-policy.json**:

```
{
  "Version": "2012-10-17",
  "Id": "policy-read-any",
  "Statement": [
    {
      "Sid": "read-any",
      "Effect": "Allow",
      "Principal": {
        "AWS": [
		   "*"
		]
      },
      "Action": [
        "s3:ListBucket",
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::*"
      ]
    }
  ]
}
```
The bucket owner now applies the policy:

```shell tab="s3cmd"
s3cmd -c owner-s3.cfg setpolicy all-read-policy.json s3://sharedbucket
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3api put-bucket-policy --bucket sharedbucket --policy file://all-read-policy.json
```

Users from other projects (which has the owners Project ID) now can access the contents of the bucket, for instance the file **testfile**.

```shell tab="s3cmd"
s3cmd -c user-s3.cfg get s3://BUCKET_OWNER_PROJECT_ID:sharedbucket/testfile
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3api get-object --bucket BUCKET_OWNER_PROJECT_ID:sharedbucket --key testfile testfile
```

#### Grant one user full access and another read access
Policies can also be combined like this. The example below will give FIRST_USER full access to the Owners bucket, and SECOND_USER read access::

```
{
    "Version": "2012-10-17",
    "Id": "complex-policy",
    "Statement": [
        {
            "Sid": "project-write",
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "arn:aws:iam::BUCKET_OWNER_PROJECT_ID:root",
                    "arn:aws:iam::FIRST_BUCKET_USER_PROJECT_ID:root"
                ]
            },
            "Action": [
                "s3:ListBucket",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::mysharedbucket/mysharedfolder/*"
            ]
        },
        {
            "Sid": "project-read",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::SECOND_BUCKET_USER_PROJECT_ID:root"
            },
            "Action": [
                "s3:ListBucket",
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::mysharedbucket/mysharedfolder/*"
            ]
        }
    ]
}
```

The owner applies the policy like above with "setpolicy" or "put-bucket-policy".

The first user now can upload a file to the bucket:

```shell tab="s3cmd"
s3cmd -c first-user-project-s3cfg put productlist.db s3://BUCKET_OWNER_PROJECT_ID:mysharedbucket/mysharedfolder/
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3api put-object --bucket BUCKET_OWNER_PROJECT_ID:mysharedbucket --key mysharedfolder/productlist.db --body productlist.db
```

The the second user can download the same file, but will not be able to upload anything:

```shell tab="s3cmd"
s3cmd -c second-user-project-s3cfg get s3://BUCKET_OWNER_PROJECT_ID:mysharedbucket/mysharedfolder/productlist.db
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3api get-object --bucket BUCKET_OWNER_PROJECT_ID:mysharedbucket --key mysharedfolder/productlist.db productlist.db
```
## Accessing a publicly available file over HTTPS

It is possible to configure an object to be publicly available, and reachable over HTTPS.
Below are the most common commands to alter the ACLs on an object or a bucket.

You may choose to remove --recursive if is required only for the bucket or folder and not for objects within.

```shell tab="s3cmd"
s3cmd setacl --acl-private --recursive s3://mybucket-name
s3cmd setacl --acl-private --recursive s3://mybucket-name/folder-name
s3cmd setacl --acl-private --recursive s3://mybucket-name/folder-name/object-name
s3cmd setacl --acl-public --recursive s3://mybucket-name
s3cmd setacl --acl-public --recursive s3://mybucket-name/folder-name
s3cmd setacl --acl-public --recursive s3://mybucket-name/folder-name/object-name
```

```shell tab="aws-cli"
# Set private ACL on a bucket
aws --endpoint=$S3_URL s3api put-bucket-acl --bucket mybucket-name --acl private

# Set public-read ACL on a bucket
aws --endpoint=$S3_URL s3api put-bucket-acl --bucket mybucket-name --acl public-read

# Set private ACL on an object
aws --endpoint=$S3_URL s3api put-object-acl --bucket mybucket-name --key object-name --acl private

# Set public-read ACL on an object
aws --endpoint=$S3_URL s3api put-object-acl --bucket mybucket-name --key object-name --acl public-read
```

The first three commands is to restrict public access, and the three last is to enable it. There are two variables you need to access a publicly available object
over HTTPS:

1. The S3_URL, which can be found in the "View Credentials" dialogue (see picture above) or in the welcome mail you got when you got onboarded. Most common values for this is s3.sto1.safedc.net or s3.osl2.safedc.net.
2. The PROJECT_ID, which can be found in the "View Credentials" dialogue.

Once you got these variables you, and have set the bucket or objects to public with one of the commands above the URL for reaching the object will be:

```
https://<S3_URL>/<PROJECT_ID>:bucket/object-name
```
So, if the S3_URL is s3.sto1.safedc.net and the PROJECT_ID is ABC123 the https URL will be:

```
https://s3.sto1.safedc.net/ABC123:bucket/object-name
```


## Using presigned URLs
It is possible to generate URLs to object which are presigned with a time limit how long the link is valid. This way it is possible to grant temporary access to single objects without the need to use policies. 

When you generated your s3.cfg file above there where two lines that maybe did not make any sense then:

```
public_url_use_https = True
signurl_use_https = True

```
These variables are important now when we want to create those pre-signed URLs to an object. They force the
signing mechanism to use HTTPS instead of HTTP which you need on Safespring's platform since HTTP is not allowed.

Let's say that the owner has a configuration file called owner-s3.cfg where those variables are set and wants
to create a pre-signed url for the object **s3://bucket/testfile** which is valid for 24 hours (or 86400 seconds). 

The command to issue is the following:

```shell tab="s3cmd"
s3cmd -c owner-s3.cfg signurl s3://bucket/testfile +86400
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3 presign s3://bucket/testfile --expires-in 86400
```

The command will return an URL that you can send to anyone and will be valid for 24 hours from now.
With s3cmd, you can also skip +86400 to make the URL permanent.

## Block Public Access

Block Public Access provides bucket-level settings to prevent public access to your data. When enabled, it overrides any ACLs or bucket policies that would otherwise grant public access.

To enable Block Public Access on a bucket:

```
aws --endpoint=$S3_URL s3api put-public-access-block \
  --bucket mybucket \
  --public-access-block-configuration \
  '{"BlockPublicAcls":true,"IgnorePublicAcls":true,"BlockPublicPolicy":true,"RestrictPublicBuckets":true}'
```

To check the current Block Public Access settings:

```
aws --endpoint=$S3_URL s3api get-public-access-block --bucket mybucket
```

To remove Block Public Access settings:

```
aws --endpoint=$S3_URL s3api delete-public-access-block --bucket mybucket
```

## CORS configuration

Cross-Origin Resource Sharing (CORS) allows web applications running in a browser to make requests to your S3 bucket from a different domain. This is necessary if you want to access objects directly from client-side JavaScript.

To set a CORS configuration using s3cmd, create an XML file called **cors.xml**:

```json
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>https://example.com</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
  </CORSRule>
</CORSConfiguration>
```

Apply the CORS configuration:

```shell tab="s3cmd"
s3cmd setcors cors.xml s3://mybucket
```


!!! note
    When using aws-cli, the CORS configuration must be in JSON format instead of XML:
    ```json
    {
      "CORSRules": [
        {
          "AllowedOrigins": ["https://example.com"],
          "AllowedMethods": ["GET", "PUT"],
          "AllowedHeaders": ["*"]
        }
      ]
    }
    ```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3api put-bucket-cors --bucket mybucket --cors-configuration file://cors.json
```

To view the current CORS configuration:

```shell tab="s3cmd"
s3cmd info s3://mybucket
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3api get-bucket-cors --bucket mybucket
```

To delete the CORS configuration:

```shell tab="s3cmd"
s3cmd delcors s3://mybucket
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3api delete-bucket-cors --bucket mybucket
```

## Bucket and object tagging

Tags are key-value pairs that can be attached to buckets and objects. They are useful for categorizing and organizing resources, for instance by environment, department or purpose.

### Bucket tagging

To set tags on a bucket:

```shell tab="s3cmd"
s3cmd settagging s3://mybucket "env=production&department=finance"
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3api put-bucket-tagging --bucket mybucket \
  --tagging '{"TagSet":[{"Key":"env","Value":"production"},{"Key":"department","Value":"finance"}]}'
```

To view the tags:

```shell tab="s3cmd"
s3cmd gettagging s3://mybucket
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3api get-bucket-tagging --bucket mybucket
```

To remove all tags:

```shell tab="s3cmd"
s3cmd deltagging s3://mybucket
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3api delete-bucket-tagging --bucket mybucket
```

### Object tagging

Tags can also be set on individual objects:

```shell tab="s3cmd"
s3cmd settagging s3://mybucket/myfile.txt "classification=internal&retention=90days"
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3api put-object-tagging --bucket mybucket --key myfile.txt \
  --tagging '{"TagSet":[{"Key":"classification","Value":"internal"},{"Key":"retention","Value":"90days"}]}'
```

To view object tags:

```shell tab="s3cmd"
s3cmd gettagging s3://mybucket/myfile.txt
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3api get-object-tagging --bucket mybucket --key myfile.txt
```

To delete object tags:

```shell tab="s3cmd"
s3cmd deltagging s3://mybucket/myfile.txt
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3api delete-object-tagging --bucket mybucket --key myfile.txt
```

## Lifecycle management

Lifecycle rules allow you to automatically delete objects after a specified number of days. This is useful for managing temporary data, logs, or other objects that should not be kept indefinitely.

To set a lifecycle policy, create an XML file called **lifecycle.xml**:

```xml
<LifecycleConfiguration>
  <Rule>
    <ID>DeleteOldLogs</ID>
    <Prefix>logs/</Prefix>
    <Status>Enabled</Status>
    <Expiration>
      <Days>90</Days>
    </Expiration>
  </Rule>
</LifecycleConfiguration>
```

Apply the lifecycle policy:

```shell tab="s3cmd"
s3cmd setlifecycle lifecycle.xml s3://mybucket
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3api put-bucket-lifecycle-configuration --bucket mybucket \
  --lifecycle-configuration '{"Rules":[{"ID":"DeleteOldLogs","Prefix":"logs/","Status":"Enabled","Expiration":{"Days":90}}]}'
```

To view the current lifecycle configuration:

```shell tab="s3cmd"
s3cmd getlifecycle s3://mybucket
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3api get-bucket-lifecycle-configuration --bucket mybucket
```

To remove the lifecycle policy:

```shell tab="s3cmd"
s3cmd dellifecycle s3://mybucket
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3api delete-bucket-lifecycle --bucket mybucket
```

!!! note
    Lifecycle transition rules (moving objects between storage classes) are not supported on Safespring. Only expiration rules are available.

## S3 Select

S3 Select allows you to run SQL queries directly on objects stored in S3 without downloading the entire object. This is useful for extracting specific data from large CSV, JSON, or Parquet files.

For example, given a CSV file **data.csv** with the columns `name`, `department` and `salary`:

```
aws --endpoint=$S3_URL s3api select-object-content \
  --bucket mybucket \
  --key data.csv \
  --expression "SELECT name, salary FROM s3object s WHERE s.department = 'engineering'" \
  --expression-type SQL \
  --input-serialization '{"CSV":{"FileHeaderInfo":"USE"}}' \
  --output-serialization '{"CSV":{}}' \
  output.csv
```

In Safesprings S3 solution S3 Select only supports the CSV format. **JSON** or **Parquet** are not supported.

## Batch delete

Multiple objects can be deleted in a single API call using the batch delete operation. This is more efficient than deleting objects one by one.

```
aws --endpoint=$S3_URL s3api delete-objects \
  --bucket mybucket \
  --delete '{"Objects":[{"Key":"file1.txt"},{"Key":"file2.txt"},{"Key":"folder/file3.txt"}]}'
```

With s3cmd, recursive delete can be used to remove all objects under a prefix:

```shell tab="s3cmd"
s3cmd del --recursive s3://mybucket/folder/
```

```shell tab="aws-cli"
aws --endpoint=$S3_URL s3 rm --recursive s3://mybucket/folder/
```
