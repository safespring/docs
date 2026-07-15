# Safespring cloud services documentation

Use this site to set up, operate, and troubleshoot Safespring cloud services.
It is written for customer administrators and users who have, or are preparing
to receive, access to one or more services.

## Choose a service

| Service | What it provides | Start here |
|:--------|:-----------------|:-----------|
| Safespring Compute | OpenStack-based virtual machines, networking, and block storage | [Create your first Compute instance](compute/getting-started.md) |
| Safespring Storage | S3-compatible object storage, including standard and archive tiers | [Access Safespring Storage](storage/getting-started.md) |
| Safespring Backup | Server and file backup using IBM Storage Protect, plus Microsoft 365 and Entra ID backup | [Set up server backup](backup/quickstart-guide.md), [Microsoft 365 backup](backup/cloud/microsoft-365.md), or [Entra ID backup](backup/cloud/microsoft-entra-id.md) |
| Safespring Kubernetes Engine (SKE) | Managed Kubernetes clusters provisioned through the Safespring portal | [Create and access your first SKE cluster](kubernetes/portal-overview.md) |

The [self-service portal](portal-api/getting-started.md) groups resources into
environments. The published end-to-end portal workflow currently covers SKE.
API and automation instructions are documented under the relevant service.

Security and compliance information is available both [across Safespring
services](security-compliance/index.md) and within each service section.

## Access and help

* To request access to a Safespring service, contact hello@safespring.com.
* If you already use Safespring and need help, see [how to contact support][sup].
* Check the [service status](https://status.safespring.com) and [known
  issues][ki] before troubleshooting an incident.

Do not send passwords, private keys, access keys, secret keys, or tokens by
email.

## Service availability by site

Safespring services run in four sites in Norway and Sweden. Site codes appear
in service URLs, credentials, and configuration:

* *osl2* is in the Oslo region.
* *sto1* and *sto2* are separate sites in the Stockholm region.
* *dco1* is in Kalix.

| Service | osl2 | sto1 | sto2 | dco1 |
|:--------|:----:|:----:|:----:|:----:|
| Safespring Compute | Yes | Yes | Yes | — |
| Safespring Storage, standard tier | Yes | Yes | Yes | — |
| Safespring Storage, archive tier | — | — | Yes | — |
| Safespring Backup | — | — | — | Yes |
| Safespring Kubernetes Engine | Yes | — | Yes | — |

## Roadmap

These are the platform changes currently planned for the next one to three
months. Plans and timing may change.

### 1 - 3 months

* MFA features in OpenStack for public cloud
* SKE load balancing improvements (retain source IP address)
* Private cloud SKE

## Recent changes in the platform

### 2026 Q1

* STO1 migrated to new hardware, refreshed core network and major upgrades to OpenStack
* Introduced SKE and self-service portal
* H100 flavors in STO1 on request


[ki]:service/known_issues.md
[sup]:service/support.md
