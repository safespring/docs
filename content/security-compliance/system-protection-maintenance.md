# System Protection and Maintenance

## Vulnerability Management

A central [dependency tracing system](https://dependencytrack.org/) system is provided.

Services can integrate with the system and upload automatic SBOMs. The `ansible/roles/sbomclient` role can be used to upload an SBOM and install a regular task to upload SBOMs. The role uses `cdxgen` with `osquery` plugins to scan the full operating system.

The dependency tracing system automatically scans all sboms for vulnerabilities. It currently mirrors the NIST NVD feed.

Automatic alerting can be configured by service teams. Currently a manual approach is used where vulnerability scans are investigated daily.
