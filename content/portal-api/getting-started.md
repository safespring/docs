# Safespring self-service portal and service API documentation

The [Safespring self-service portal](https://portal.safespring.com) groups
resources into environments. The published portal workflow currently covers
creating and accessing Safespring Kubernetes Engine (SKE) clusters.

## Use the portal with SKE

Before you start, you need the activation emails for your Safespring portal and
site-specific identity accounts. To access a cluster after provisioning it,
you also need `kubectl` and `kubelogin`.

Follow [Create and access your first SKE cluster](../kubernetes/portal-overview.md)
to activate the accounts, sign in, create an environment, provision a cluster,
download its `kubeconfig`, and verify access.

## Find service API and automation documentation

This documentation site does not currently publish a general API reference for
the self-service portal. Use the service-specific documentation instead:

* [Compute API access](../compute/api.md) covers the OpenStack CLI, API access,
  and Terraform.
* [Backup REST API](../backup/automation/rest-api.md) covers Backup API
  authentication and requests.
* [Storage client configurations](../storage/getting-started.md#client-configuration-examples)
  cover S3-compatible tools and libraries.
* [SKE portal workflow](../kubernetes/portal-overview.md) covers cluster
  provisioning and credentials.

For portal or API access that is not covered above, [contact
support](../service/support.md).
