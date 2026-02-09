# Sites and Data Locality

Safespring does not use OpenStack availability zones. Instead, each Safespring site is a fully separate installation with its own Horizon dashboard, API endpoints, and credentials.

## Why separate sites instead of availability zones

In a traditional OpenStack deployment, availability zones let users select which datacenter to place instances in from a dropdown menu. Safespring has deliberately chosen not to use this model. The reason is data locality — by keeping each site as a completely separate environment, you always know exactly which physical location your data resides in. There is no risk of accidentally placing data in a different datacenter by selecting the wrong option from a dropdown.

This is especially important for customers with regulatory requirements around data residency and sovereignty.

## Available sites

Each site has its own dashboard and API endpoint:

| Site | Location | Dashboard |
| --- | --- | --- |
| STO1 | Stockholm, Sweden | https://dashboard.sto1.safespring.com |
| STO2 | Stockholm, Sweden | https://dashboard.sto2.safespring.com |
| OSL2 | Oslo, Norway | https://dashboard.osl2.safespring.com |

Your account credentials and projects are specific to each site. Resources in one site (instances, volumes, images, networks) are not visible or accessible from another site.

## High availability across sites

Since each site is independent, achieving high availability across sites is the responsibility of the customer. Common approaches include:

- Running application replicas in multiple sites and using external DNS or load balancing to distribute traffic between them
- Setting up data replication between instances in different sites at the application level
- Using the Safespring S3 storage service in another site to replicate data off-site. See the [Storage documentation](../storage/getting-started.md) for details on using S3
- Keeping backups in a different site than the primary deployment

Within a single site, you can use [server groups](server-groups.md) with anti-affinity policies to spread instances across different compute nodes for hardware-level resilience.

## API configuration per site

When using the OpenStack CLI or Terraform, your configuration (rc file or environment variables) must point to the correct site's API endpoint. You need separate configurations for each site you use. See the [API Access documentation](api.md) for details on setting up the CLI client.
