# S3 API Compatibility Matrix

This page documents the S3 API compatibility between Safespring S3 Storage and Amazon S3. Safespring S3 is built on Ceph RADOS Gateway (RGW), which implements a large subset of the Amazon S3 API.

## Not Supported

The following AWS S3 features are **not available** in Safespring S3:

| Feature | Notes |
|---|---|
| Static Website Hosting | Returns `405 MethodNotAllowed` |
| Bucket Access Logging | Returns `405 MethodNotAllowed` |
| Bucket Ownership Controls | Returns `InvalidArgument` |
| Server-Side Encryption (SSE-S3, SSE-KMS) | Not supported. These are AWS-specific key management integrations. SSE with Ceph's built-in key management and SSE-C (customer-provided keys) are supported. Safespring also provides encryption at rest using dm-crypt at the disk level |
| Event Notifications (SNS/SQS/Lambda) | Returns `InvalidArgument` |
| CloudFront / CDN integration | AWS-specific service |
| S3 Transfer Acceleration | AWS-specific service |
| S3 Storage Classes (Glacier, IA, etc.) | Only STANDARD class available. For long-term archival storage, contact Safespring support to apply for a separate S3 Archive account. See [Quotas](quota.md) for details on the differences between S3 Storage and S3 Archive. Tools like [Rclone](https://rclone.org) can be used to sync data from S3 Storage to S3 Archive |
| S3 Inventory | API responds but functionality is limited |
| S3 Analytics | API responds but functionality is limited |
| S3 Metrics (CloudWatch) | AWS-specific service |
| S3 Intelligent-Tiering | AWS-specific service |
| S3 Batch Operations | AWS-specific service |
| S3 Access Points | AWS-specific service |
| S3 Object Lambda | AWS-specific service |
| AWS PrivateLink for S3 | AWS-specific service |
| S3 on Outposts | AWS-specific service |
| Cross-Region Replication | No multiple regions per site |
| Requester Pays | API responds but Requester Pays billing is not applicable since Safespring has separate billing logic |
| MFA Delete | API field exists but MFA is not available since it is an Amazon specific feature. |

## Supported (or partially supported) features

### Bucket Operations

| Operation | AWS S3 | Safespring S3 | Notes |
|---|---|---|---|
| CreateBucket (PUT Bucket) | Yes | Yes | |
| DeleteBucket (DELETE Bucket) | Yes | Yes | |
| ListBuckets (GET Service) | Yes | Yes | |
| HeadBucket | Yes | Yes | |
| GetBucketLocation | Yes | Yes | |
| ListObjects (GET Bucket, v1) | Yes | Yes | |
| ListObjectsV2 | Yes | Yes | |
| ListObjectVersions | Yes | Yes | |

### Object Operations

| Operation | AWS S3 | Safespring S3 | Notes |
|---|---|---|---|
| PutObject | Yes | Yes | |
| GetObject | Yes | Yes | |
| HeadObject | Yes | Yes | |
| DeleteObject | Yes | Yes | |
| DeleteObjects (batch) | Yes | Yes | |
| CopyObject | Yes | Yes | |
| Byte-range GET (Range header) | Yes | Yes | |
| Custom metadata (x-amz-meta-*) | Yes | Yes | |
| Presigned URLs | Yes | Yes | Supports both v2 and v4 signatures |

### Multipart Upload

| Operation | AWS S3 | Safespring S3 | Notes |
|---|---|---|---|
| CreateMultipartUpload | Yes | Yes | |
| UploadPart | Yes | Yes | |
| CompleteMultipartUpload | Yes | Yes | |
| AbortMultipartUpload | Yes | Yes | |
| ListMultipartUploads | Yes | Yes | |
| ListParts | Yes | Yes | |

### Access Control

| Operation | AWS S3 | Safespring S3 | Notes |
|---|---|---|---|
| Bucket ACLs (GET/PUT) | Yes | Yes | |
| Object ACLs (GET/PUT) | Yes | Yes | |
| Bucket Policies (GET/PUT/DELETE) | Yes | Yes | JSON-based IAM-style policies |
| Block Public Access | Yes | Yes | |

### Versioning

| Operation | AWS S3 | Safespring S3 | Notes |
|---|---|---|---|
| PutBucketVersioning (Enable/Suspend) | Yes | Yes | |
| GetBucketVersioning | Yes | Yes | |
| ListObjectVersions | Yes | Yes | |
| Delete markers | Yes | Yes | |
| Version-specific GET/DELETE | Yes | Yes | |

### Object Lock and Retention

See [Object Locking](object-locking.md) for detailed usage examples.

| Operation | AWS S3 | Safespring S3 | Notes |
|---|---|---|---|
| Create bucket with Object Lock | Yes | Yes | Must be enabled at bucket creation |
| GetObjectLockConfiguration | Yes | Yes | |
| PutObjectLockConfiguration | Yes | Yes | Default retention rules |
| PutObject with lock retention | Yes | Yes | COMPLIANCE and GOVERNANCE modes |
| GetObjectRetention | Yes | Yes | |
| PutObjectLegalHold | Yes | Yes | |
| GetObjectLegalHold | Yes | Yes | |

### Lifecycle Management

See [Lifecycle management](s3-advanced.md#lifecycle-management) for configuration examples.

| Operation | AWS S3 | Safespring S3 | Notes |
|---|---|---|---|
| PutBucketLifecycleConfiguration | Yes | Yes | |
| GetBucketLifecycleConfiguration | Yes | Yes | |
| DeleteBucketLifecycle | Yes | Yes | |
| Expiration rules | Yes | Yes | |
| Transition rules (storage classes) | Yes | No | Only STANDARD storage class available, no transition targets |

### CORS

See [CORS configuration](s3-advanced.md#cors-configuration) for configuration examples.

| Operation | AWS S3 | Safespring S3 | Notes |
|---|---|---|---|
| PutBucketCors | Yes | Yes | |
| GetBucketCors | Yes | Yes | |
| DeleteBucketCors | Yes | Yes | |

### Tagging

See [Bucket and object tagging](s3-advanced.md#bucket-and-object-tagging) for usage examples.

| Operation | AWS S3 | Safespring S3 | Notes |
|---|---|---|---|
| PutBucketTagging | Yes | Yes | |
| GetBucketTagging | Yes | Yes | |
| DeleteBucketTagging | Yes | Yes | |
| PutObjectTagging | Yes | Yes | |
| GetObjectTagging | Yes | Yes | |
| DeleteObjectTagging | Yes | Yes | |

### S3 Select

See [S3 Select](s3-advanced.md#s3-select) for a usage example.

| Operation | AWS S3 | Safespring S3 | Notes |
|---|---|---|---|
| SelectObjectContent | Yes | Partially | SQL queries on CSV is supported. JSON, and Parquet objects **NOT** supported |


### Authentication and Connectivity

| Feature | AWS S3 | Safespring S3 | Notes |
|---|---|---|---|
| Signature v4 | Yes | Yes | Recommended |
| Signature v2 | Yes | Yes | Legacy support |
| TLS 1.2+ | Yes | Yes | Required, HTTP not allowed |
| Path-style access | Yes | Yes | Default and the only one supported for Safespring |
| Virtual-hosted-style access | Yes | No | Use path-style with `host_bucket = S3_URL` in s3cmd |
| AWS IAM authentication | Yes | No | Safespring uses EC2-style credentials from the portal |

### Verified S3 Clients

The following clients have been tested and documented for use with Safespring S3:

| Client | Status |
|---|---|
| AWS CLI | Supported (requires `--endpoint` flag) |
| s3cmd | Supported |
| MinIO Client (mc) | Supported |
| CyberDuck | Supported |
| Duck CLI | Supported |
| s3fs | Supported |
| CloudBerry Explorer | Supported |
| Nextcloud S3 integration | Supported |
| Terraform S3 backend | Supported |
