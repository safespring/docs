First of all, get the latest released TSM bundle (comes in .DMG format), since recent macOS requires a recent TSM to work, this folder holds 7.1.6.x.: 

Latest V7 patch release:

[Mac TSM client 7.1.8.6](https://www3.software.ibm.com/storage/tivoli-storage-management/patches/client/v7r1/Mac/v718/7.1.8.6-TIV-TSMBAC-Mac.dmg)

Latest V8 release:

[Mac TSM client 8.1.8.0](https://www3.software.ibm.com/storage/tivoli-storage-management/maintenance/client/v8r1/Mac/v818/8.1.8.0-TIV-TSMBAC-Mac.dmg)

Install it as usual on Mac by attaching the DMG as a disk and then click on the installer icon.

Then grab this script:
[certificate installation script for macOS](https://raw.githubusercontent.com/IPnett/cloud-BaaS/master/pki/IPnett-Cloud-Root-CA-macosx.sh) and the certificate in PEM format here [BaaS service CA root certificate](https://raw.githubusercontent.com/IPnett/cloud-BaaS/master/pki/IPnett-Cloud-Root-CA.pem).

Put the PEM file next to the script and run the script. It will clean out any previous certificates in the IBM TSM certificate database. If you haven't been running TSM over TLS it will only contain IBM default entries which are of no use. It will not affect any other system or application certificate bundles. It will also not use any of them.

After this, the example configuration files can be collected from the BaaS Portal. TSM for macOS will read preference files from /Library/Application Support/tivoli/tsm/client/ba/bin/dsm.* but apart from that works like any other Unix system in terms of how to write Include/Exclude paths and so on. Any generic unix TSM guide will probably work if you replace /opt/ with /Library/Application Support/ for where to find TSM files.

The command line backup client "dsmc" ends up in /usr/local/bin/dsmc and the gui in your Applications folder as two programs, both "Tivoli Storage Manager" and "TSM tools for administrators" where the first only works if you already are logged in as an admin, otherwise it isn't allowed to read config files and hence won't reach the TSM server, and the second will first run sudo, and then start TSM as an admin.

