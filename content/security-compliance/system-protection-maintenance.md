# System Protection and Maintenance

## Maintenance

We perform regular maintenance to ensure the continued security, stability, and reliability of our products and services.

Maintenance activities are conducted during regularly scheduled maintenance windows, following predefined maintenance schedules.

- **Regularly Scheduled Maintenance:** Maintenance is planned and performed at regular intervals to apply updates, security patches, bug fixes, and infrastructure improvements.
- **Standing Maintenance Windows:** We maintain predefined maintenance windows to provide a predictable schedule for planned maintenance activities.
- **Customer Communication:** Planned maintenance activities and relevant service-impacting updates are communicated through our public [Status Page](https://status.safespring.com).

## Vulnerability Management

We are committed to maintaining the security and integrity of our products and services. As part of our security maintenance process, we continuously monitor, assess, and address Common Vulnerabilities and Exposures (CVEs) affecting our systems and dependencies.

Vulnerabilities are assessed and prioritized based on their severity, potential impact, exploitability, and whether they are known to be actively exploited.

Our remediation approach is as follows:

### Critical Vulnerabilities

Critical vulnerabilities, particularly those with confirmed active exploitation or significant security impact, are prioritized for immediate attention.

We will initiate remediation as soon as possible, outside the regular maintenance schedule when necessary, to minimize potential exposure and reduce security risks.

### Non-Critical Vulnerabilities

Non-critical vulnerabilities that are not known to be actively exploited and do not pose an immediate significant security risk will be addressed as part of our regular maintenance and release cycle.

Affected customers will be informed of relevant vulnerabilities and planned remediation. Fixes will generally be included in the next scheduled maintenance window, subject to appropriate testing and validation.

### Customer Communication

We are committed to keeping customers informed about relevant security vulnerabilities and remediation activities.

Where applicable, communications will include information about the affected components or versions, the severity and potential impact, available mitigations, and the expected availability of a permanent fix.

Our vulnerability management process is continuously reviewed to ensure that security risks are addressed in a timely and risk-based manner.

### Dependency Tracking

A central [dependency tracing system](https://dependencytrack.org/) is provided.

Services can integrate with the system and upload automatic SBOMs. The `ansible/roles/sbomclient` role can be used to upload an SBOM and install a regular task to upload SBOMs. The role uses `cdxgen` with `osquery` plugins to scan the full operating system.

The dependency tracing system automatically scans all SBOMs for vulnerabilities. It currently mirrors the NIST NVD feed.

Automatic alerting can be configured by service teams. Currently a manual approach is used where vulnerability scans are investigated daily.
