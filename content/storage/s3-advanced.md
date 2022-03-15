# Advanced S3 features

## Access Control Lists in S3
This chapter descibes how you can set up specific Access Control Lists (from now on called ACLs)
to control access to specific buckets or objects from other S3 users in the platform.

The reasons for doing could be: 

1. Give public access to a specific bucket or object
2. Give another S3 user read or read/write access to a specific bucket, objects or subfolder of a bucket.

### Naming Convention in this document
* Bucket Owner is a S3 account holder which has an object storage bucket intended for sharing to another S3 account holder in the same platform. 
* Bucket User which is a S3 account holder who wants to gain access to the Bucket Owner's bucket
* Buckets Owner's Project - the Bucket Owner's Project ID
* Bucket User's Project - the Bucket User's Project ID

In the examples below words written with capital letters, such as BUCKETOWNERPROJECT, are variables that should be replaced with values matching your use-case.

### Setting up s3cmd
We are going to use the tool "s3cmd" for all configuration. Use the instructions [here](/storage/s3cmd.md) to install it. To test these examples you are going to need to have two separate s3cmd-config
files. To get the varianbles you need to create those files login to your Safespring account, click "API Access" up to the left, and the "View Credentials". You will be presented with something like this:

![View Credentials](/images/view-credentials.png)

The important variables to write down are:

1. Project ID
2. S3 URL (but without the https://)
3. EC2 Access Key
4. EC2 Secret Key (you have to click the eye-icon to be able to copy it)

You do this both for the owners project and the users project.  
When you have those variables you will be able to create two files, one for the owner and one for the user with the following contents:

```
[default]
access_key = E2_ACCESS_KEY
secret_key = E2_SECRET_KEY
check_ssl_certificate = True
guess_mime_type = True
host_base = S3_URL
host_bucket = S3_URL
use_https = True
public_url_use_https = True
signurl_use_https = True

```
In the examples below we have named the configuration files **owner-s3.cfg** and **user-s3.cfg**.
We have not used the Project IDs for the owner and the user yet but will down below when we set up the policies.

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

```
# s3cmd -c owner-s3.cfg setpolicy policy.json s3://sharedbucket
```

To view the current policies on the bucket issue the following:

```
# s3cmd -c owner-s3.cfg info s3://sharedbucket
```
To delete a policy from a bucket, use the following:

```
# s3cmd -c owner-s3.cfg delpolicy s3://sharedbucket
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

```
# s3cmd -c owner-s3.cfg setpolicy rw-policy.json s3://sharedbucket
```

The owner now has to send it Project ID, and the name of the bucket to the user.

To list the contents of the bucket, the bucket user should issue:

```
# s3cmd -c user-s3.cfg ls s3://BUCKET_OWNER_PROJECT_ID:sharedbucket
```
The user now should se a listing of the contents of the bucket.

#### Grant any user read access to a bucket

Create a file called all-read-policy.json:

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

```
s3cmd -c owner-s3.cfg setpolicy all-read-policy.json s3://sharedbucket
```

Users from other projects (which has the owners Project ID) now can access the contents of the bucket, for instance the file **testfile**.

```
s3cmd -c user-s3.cfg get s3://BUCKET_OWNER_PROJECT_ID:sharedbucket/testfile
```

#### Grant one user full access and another read access
Policies can also be combined like this:

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

The owner applies the policy like above with "setpolicy".

The first user now can upload a file to the bucket:

```
s3cmd -c first-user-project-s3cfg put productlist.db s3://BUCKET_OWNER_PROJECT_ID:mysharedbucket/mysharedfolder/
```

The the second user can download the same file, but will not be able to upload anything:

```
s3cmd -c second-user-project-s3cfg get s3://BUCKET_OWNER_PROJECT_ID:mysharedbucket/mysharedfolder/productlist.db
```

## Using presigned URLs
It is possible to generate URLs to object which are presigned with a time limit how long the link is valid. This way it is possible to grant access to single objects without the need to use policies. 

When you generated your s3.cfg file above there where two lines that maybe did not make any sense then:

```
public_url_use_https = True
signurl_use_https = True

```
These varibales are important now when we want to create those pre-signed URLs to an object. They force the
signing mechanism to use HTTPS instead of HTTP which you need in Safespring's platform since HTTP is not allowed.

Let's say that the owner has a configuration file called owner-s3.cfg where those variables are set and wants
to create a pre-signed url for the object s3://bucket/testfile which is valid for 24 hours (or 86400 secoonds). 

The command to issue is the following:

```
# s3cmd -c owner-s3.cfg signurl s3://bucket/testfile +86400
```
The command will return an URL that you can send to anyone and will be valid for 24 hours from now.



