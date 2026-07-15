# Set up Safespring Backup

Safespring Backup protects files on a machine by using the IBM Storage Protect
Backup-Archive Client. This guide is for administrators setting up a new backup
source.

Before you start, you need:

* Credentials for the [Safespring Backup Portal](https://portal.backup.sto2.safedc.net/).
  If you do not have them, see [how to request portal credentials](faq.md#credentials-to-safespring-backup-portal).
* Administrator access to the machine you want to back up.
* A supported Windows, Linux, or macOS system.

## Understand the two portal terms

A **consumption unit** is the portal record for a data source. In the current
Safespring Backup service, each consumption unit has one **backup node**. The
node is the identity and credentials used by the Backup-Archive Client on one
machine.

## 1. Create and activate a backup node

Follow [Create a consumption unit and backup node](howto/consumption-units.md).
That guide explains the retention domain, client option set, node name, and
activation fields. When activation succeeds, the portal displays the setup
information and password required by the client.

## 2. Install and configure the client

Continue with the guide for the machine's operating system:

* [Microsoft Windows](install/windows.md) — installation, configuration, first
  connection, and scheduled backups.
* [Linux](install/linux.md) — installation, configuration, first connection,
  and scheduled backups.
* [Apple macOS](install/apple-macos.md) — installation and configuration. The
  current macOS guide does not cover scheduling; [contact
  support](../service/support.md) if you need help configuring it.

Use the setup information and password from the activated backup node when the
operating-system guide asks for client credentials.

## 3. Run and verify your first backup

After the client connects successfully, follow [Back up files](howto/back-up-files.md)
to select data and start a manual backup. Confirm that the client reports a
successful completion before relying on the backup.

Next, review the [recovery basics](recovery/basics.md) and plan a test restore.
A backup that has never been restored is merely an optimistic storage habit.
