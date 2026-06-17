# Legacy Backup Service

This section documents Safespring's legacy backup service based on IBM Spectrum Protect / TSM.
It is intended for users and administrators who still operate existing legacy backup clients and need installation, restore, troubleshooting, or performance guidance.

!!! info "Using the current backup service?"
    If you are looking for the current Safespring Backup service, start with the [Quick-Start Guide](../quickstart-guide.md).

## Start Here

If you are new to the legacy service, use these pages first:

* [Introduction](introduction.md) for service background and concepts
* [Getting Started](getting-started.md) for first backup and restore steps after installation
* [Installation Overview](install/overview.md) to pick the correct client guide for your platform
* [FAQ](faq.md) for common issues and operational constraints

## Installation

Choose the guide that matches your operating system or workload:

* [Windows](install/windows.md)
* [Red Hat Linux](install/rhel.md)
* [Debian/Ubuntu](install/debian-ubuntu.md)
* [macOS](install/apple-macos.md)
* [freeBSD and other Unix-like systems](install/freebsd-other.md)
* [Microsoft SQL Server](install/tdp-for-mssql.md)

## Common Tasks

These pages cover the most common operational tasks in the legacy environment:

* [Encrypted backups](howto/encrypted.md)
* [Include and exclude rules](howto/includeexclude.md)
* [Handling changing files](howto/changing-files.md)
* [Restore to an alternate location](howto/restore-alternate.md)
* [Windows restore](howto/windows-restore.md)
* [Bare metal recovery with TBMR](howto/bare-metal-tbmr.md)

## Operations and Troubleshooting

Use these pages when you need to troubleshoot behavior or tune the service:

* [FAQ](faq.md)
* [Performance](performance.md)
* [Performance tuning](howto/performance-tuning.md)
* [Status](status.md)

## Notes

This documentation is kept to support legacy deployments. Navigation, terminology, and workflows may differ from the current Safespring Backup service.
