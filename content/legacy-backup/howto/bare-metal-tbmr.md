# Bare Machine Recovery

## Introduction

Cristie's Tivoli Bare Machine Recovery (TBMR) allows administrators to restore a physical or virtual machine backed up with TSM into a different hardware profile than the original machine.

TBMR has three parts, as does this guide to TBMR:

 * [Part 1](#TBMR_prep) - The restore preparations
 * [Part 2](#TBMR_inst) - The client part, that runs on each backup client machine
 * [Part 3](#TBMR_rest) - The restore procedure, to restore a server

The client part of TBMR profiles the backup client machine's hardware profile into a file which gets backed up by the TSM backup client. TBMR can only be used with servers that have been setup in this way _before_ a crash.

The restore part requires a bootable ISO image on CD/DVD-ROM or USB or similar. For Linux this software is freely available, but for Windows it must be created by each BaaS customer itself due to Microsoft's licensing restrictions regarding right to redistribute. See the Restore Preparation step below for details on how to create the image.

<a name="TBMR_prep"></a>

## TBMR Preparation Guide

### Part one - Restore preparations

Safespring recommends all users to prepare and maintain bootable media of the recovery tool _before_ the required use of the tool.

To restore a machine, the following preparatory steps need to be taken:
 1. Retrieve the bootable ISO image
 2. Prepare bootable media (CD/DVD or USB) with this bootable image
 3. Recommended: Add to operational procedural documentation how restores are made
 4. Recommended: Schedule tests of restore procedures

#### Preparation for restore on Linux

 1. **Retrieve the bootable ISO image.**

    The bootable ISOs of TBMR are available at Safespring's [distribution site](https://archive.service.safedc.net/tbmr/Linux/).
    Note that there is one version for 32-bit architectures and another for 64-bit.

 2. **Prepare bootable media (DVD or USB) with this bootable image.**

    Using your favorite method, prepare for example a DVD or USB drive with the ISO image retrieved in step 1.

 3. **Add to operational procedural documentation how restores are made.**

    *Recommended step. More details/guidance to be included here in the future.*

 4. **Schedule tests of restore procedures.**

    *Recommended step. More details/guidance to be included here in the future.*

#### Preparation for restore on Windows

 1. **Retrieve the bootable ISO image**

    In the case of Windows, the bootable ISOs of TBMR are _not_ available at Safespring's [distribution site](https://archive.service.safedc.net/tbmr/Windows/). The bootable images are based on WinPE 2 for 32-bit Windows and WinPE 4 for 64-bit Windows. This is due to Microsoft Licensing restrictions.

    The solution is that each customer site creates its own 32-bit and 64-bit TBMR WinPE images.
    Cristie has a tool called **CRISP** that assists with this.

    The requirements for this are:

     * One 32-bit build-host.
     * One 64-bit build-host.
     * Two utilities from Microsoft's [download site](http://www.microsoft.com/download/en/default.aspx):
        * For 32-bit images: Windows Automated Installation Kit (WAIK) (Cristie suggests the file `6001.18000.080118-1840-kb3aikl_en.iso`
        * For 64-bit images: Microsoft Windows Assessment and Deployment Kit (WADK) (Cristie suggests to search for "Microsoft Windows Assessment and Deployment Kit (WADK) version 8" in the search bar to find a release dated 31 July 2012)
        * The CRISP tool comes with the TBMR Suite, which is found at Safespring's [distribution site](https://archive.service.safedc.net/tbmr/Windows/) (`SetupTBMRSuiteXXX.exe`).

    For detailed instructions on the use of CRISP, please see the [CRISP guide](https://archive.service.safedc.net/tbmr/Windows/CRISP-7-UserGuide.pdf).

2. **Prepare bootable media (CD or USB) with this bootable image**

    Using your favorite method, prepare for example a CD or USB drive with the ISO image retrieved in step 1.

3. **Add to operational procedural documentation how restores are made**

    Recommended step. More details/guidance to be included here in the future.

4. **Schedule tests of restore procedures**

    Recommended step. More details/guidance to be included here in the future.

<a name="TBMR_inst"></a>

### Part 2 - Client Installation

#### Safespring's BaaS packaging for Windows and Linux

Safespring's BaaS packaging of TSM and TBMR installs the TBMR client on a backup client machine.
As of `2015-07` this is supported on [Windows platforms](../../backup/recovery/windows-recovery.md) and this is the now recommended installation method.

#### Manual Installation on e.g Redhat Linux

Prerequisites are a working Safespring Backup TSM installation on the machine in question.

1. **Install**

    RPMs are found at Safespring's [distribution site](https://archive.service.safedc.net/tbmr/Linux/)

    ```shell
    # 64-bit client example:
    wget https://archive.service.safedc.net/tbmr/Linux/tbmr-7.1-2.x86_64.rpm
    rpm -Uvh tbmr-7.1-2.x86_64.rpm
    ```

2. **Extract Serial**
    ```shell
    cd /TBMRCFG
    echo > /TBMRCFG/`licmgr --sig`.sig
    ```

    _N.B. TBMR will be automatically licensed during Q3._ Until then, please contact Safespring for a temporary license.

3. **Generate system profile**

    Run tbmrcfg (see also the tbmrcfg man page):

        tbmrcfg -- help

    Either run tbmrcfg without parameters to save system configuration (default)

        tbmrcfg

    ...or save system configuration information for system using grub installed on `/dev/sda`:
    ```bash
    tbmrcfg -b grub -d /dev/sda
    ```
    Verify the file `/TBMRCFG/disrec.ini`
    ```bash
    ls -l /TBMRCFG/disrec.ini
    less /TBMRCFG/disrec.ini
    ```
    Run an incremental backup using IBM TSM backup-archive client

        dsmc i

    Schedule a run of `tbmrcfg` to ensure that the system can recover to the latest
    version. Always run `tbmrcfg` and incremental backup after system changes.

<a name="TBMR_rest"></a>

### Part 3 - Restoring using TBMR

To perform a restore of a machine with TBMR, the following steps must be taken:

 1. **Locate** a replacement machine for the broken machine
 2. **Boot** the replacement machine with the bootable image, having Internet network access
 3. **Generate** a new password for the node via API or portal
 4. **Enter** the node name (12 characters A-Z) and password into the booted tool.
 5. **Optionally add** any additional missing drivers for the new machine
 6. **Optionally partition** the devices for the new machine
 7. **Restore** the old machine into a new system

#### More information

For further details at this point, please see:

 * [TBMR For Linux Usage Guide](https://archive.service.safedc.net/tbmr/Linux/UserGuide.pdf)
 * [TBMR For Windows Usage Guide](https://archive.service.safedc.net/tbmr/Windows/TBMR-722-UserGuide.pdf)

#### Restore of a Linux machine

1. Make a bootable USB or DVD with `tbmr-7.1.2.linux.x86_64.iso`
2. Boot into the recovery environment using the ISO. X11 based Linux recovery environment is recommended. Automatic recovery wizard is recommended.
3. Provide the following TSM server information:
     - Server address
     - Port
     - Node name
     - Password (You will probably have to rekey the node beforehand, since the client rotates passwords)
4. Configure network
5. Read configuration data from backup
     - Get configuration
     - Click next to start the recovery process
     - Confirm partition settings
6. Reboot into recovered OS
