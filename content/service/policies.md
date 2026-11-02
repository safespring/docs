# Safespring Policies and SLA

<a id="storage-and-compute-service-level-agreement-sla"></a>

## Service level agreement (SLA)

The [Safespring Service Level Agreement](https://www.safespring.com/compliance/service_level_agreement/)
sets the following service level objectives (SLOs), measured separately for each
covered service over a calendar month:

| Covered service | Monthly uptime target |
|:----------------|:----------------------|
| Compute (IaaS), Network, Block Storage | 99.99% |
| Kubernetes control plane | 99.95% |
| Object Storage (S3) | 99.95% |
| Backup | 99.9% |

The Kubernetes target covers the control plane. Worker nodes fall under the
Compute SLO. See the full SLA for measurement rules, exclusions, and financial
credit terms.

## Support

For critical issues that affect service availability, [contact support](support.md)
and describe the operational impact. For non-critical and minor issues, please
allow up to 24 hours for replies.

## Safespring customer support policy for security testing

Customers are welcome to perform security testing against their infrastructure
hosted by Safespring. The following limitations apply:

The following activities are prohibited:

* Denial of Service, Distributed denial of service (DDoS) or simulations of DoS
  or DDoS attacks.
* Flooding attacks (HTTP flood attacks, API requests, login requests, etc.).
* SYN flooding, ICMP flooding, UDP flooding.

Before doing security testing, we kindly ask you to inform us at
support@safespring.com
