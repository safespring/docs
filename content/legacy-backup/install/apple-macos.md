First of all, get the latest released TSM bundle (comes in `.DMG` format), since recent macOS requires a recent TSM to work, this folder holds 7.1.6.x.:

!!! note "Latest V7 patch release"
    [Mac TSM client 7.1.8.6](https://www3.software.ibm.com/storage/tivoli-storage-management/patches/client/v7r1/Mac/v718/7.1.8.6-TIV-TSMBAC-Mac.dmg)

!!! note "Latest V8 release"
    [Mac TSM client 8.1.12.0](https://www3.software.ibm.com/storage/tivoli-storage-management/maintenance/client/v8r1/Mac/v8112/8.1.12.0-TIV-TSMBAC-Mac.dmg)

Install it as usual on Mac by attaching the DMG as a disk and then click on the installer icon.

Then grab this script [certificate installation script for macOS](https://raw.githubusercontent.com/safespring/cloud-BaaS/master/pki/MacOSX-Update-SafeDC-Net-CA.sh) and the certificate in PEM format here [BaaS service CA root certificate](https://raw.githubusercontent.com/safespring/cloud-BaaS/master/pki/SafeDC-Net-Root-CA.pem).

```shell tab="Shell"
#!/bin/sh

PASSWORD=$(mktemp -d /tmp/temp-one-time-idXXXXXXXXXXXXX)
rmdir $PASSWORD

KDB="/Library/Application Support/tivoli/tsm/client/ba/bin/dsmcert.kdb"
GSK8CAPICMD=/Library/ibm/gsk8/bin/gsk8capicmd

rm -f "/Library/Application Support/tivoli/tsm/client/ba/bin/dsmcert.*"

if [ -f SafeDC-Net-Root-CA.pem ]; then
   $GSK8CAPICMD -keydb -create -db "$KDB" -pw "$PASSWORD" -stash

   $GSK8CAPICMD -cert -add -db "$KDB" -format ascii -stashed \
                 -label "SafeDC Net Root CA" \
                 -file SafeDC-Net-Root-CA.pem

    $GSK8CAPICMD -cert -list -db "$KDB" -stashed
else
    echo "SafeDC cert file SafeDC-Net-Root-CA.pem missing,"
    echo "please place it in current dir and re-run script"
    exit 1
fi
```

```pem tab="PEM"
-----BEGIN CERTIFICATE-----
MIIEBTCCAu2gAwIBAgIBADANBgkqhkiG9w0BAQsFADBfMQswCQYDVQQGEwJTRTET
MBEGA1UECgwKU2FmZWRjLm5ldDEeMBwGA1UECwwVRGF0YWNlbnRlciBPcGVyYXRp
b25zMRswGQYDVQQDDBJTYWZlZGMubmV0IFJvb3QgQ0EwHhcNMTgwMjIwMjE1NjQ2
WhcNMzgwMjE1MjE1NjQ2WjBfMQswCQYDVQQGEwJTRTETMBEGA1UECgwKU2FmZWRj
Lm5ldDEeMBwGA1UECwwVRGF0YWNlbnRlciBPcGVyYXRpb25zMRswGQYDVQQDDBJT
YWZlZGMubmV0IFJvb3QgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB
AQDdLQn+gKG8FA825nBgQNwsdMTG6nnm0qVvwGHYawmtcUzDHHOveQGV3p94pN1C
HBsHsDa/WUEjF2nN2nr7NhX42F8d6HX3EwlK0OEhVF0OyBsfDLyr5mMaLeHJe2aj
qgLVthkRLJEzAV2LcQtzWsaRCAaNklPXB57E4y/SE0zM1PbQcGH32NsAstbXPchZ
KDNWsagfcXsKZk96El7UWY0Q9HGtqjQuGAYnGyFAnPul7c5uWzv5pyN/S+aRHQN8
mhrHCd7fxdwTtjwEZAEqm+SKtXLG6t+4aqaUC4ubYg7MVuScUQ6r58E0U90ckkba
TtciHJiGM2rfYiKVUh29nPTdAgMBAAGjgcswgcgwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUDDhvUQKo/6s3swD2A1zJmi2N2oQwgYgGA1UdIwSBgDB+gBQMOG9R
Aqj/qzezAPYDXMmaLY3ahKFjpGEwXzELMAkGA1UEBhMCU0UxEzARBgNVBAoMClNh
ZmVkYy5uZXQxHjAcBgNVBAsMFURhdGFjZW50ZXIgT3BlcmF0aW9uczEbMBkGA1UE
AwwSU2FmZWRjLm5ldCBSb290IENBggEAMAsGA1UdDwQEAwIBhjANBgkqhkiG9w0B
AQsFAAOCAQEAUhnRfJHRBTOcnEbWg6M6YyhdzzUYZcYO7SgCG8VbxmhbZpjcfQWJ
eHVGcgR/RuYKI5N7PEU8bRQwo4GtNBxVU4rEpCNRx5lNEjjF9eqCpe22XidEAeTw
mbg2vYt+pQwbcI6ylRex6pPB4uZJEh9NfpreOKDSe6GYnYr/URmQQo6ql1rCL+to
wj+3pbvsxGBicoQzrIBiFH3/9BBb/IxIuPv60hwF4SH0MEX3GQYfuhZIAbac0Rgs
UIkB6BcgUqSpQVbXIgwu7Olhn6jjAZPB2GmtbndJiqasqYwwwexYJ7yW4Kfpq3eq
KYLtlCxXjKK44dISRdi6hXQdBEZF/6QWAQ==
-----END CERTIFICATE-----
```

Put the PEM file next to the script and run the script. It will clean out any previous certificates in the IBM TSM certificate database. If you haven't been running TSM over TLS it will only contain IBM default entries which are of no use. It will not affect any other system or application certificate bundles. It will also not use any of them.

After this, the example configuration files can be collected from the BaaS Portal. TSM for macOS will read preference files from `/Library/Application Support/tivoli/tsm/client/ba/bin/dsm.*` but apart from that works like any other Unix system in terms of how to write Include/Exclude paths and so on. Any generic unix TSM guide will probably work if you replace `/opt/` with `/Library/Application Support/` for where to find TSM files.

The command line backup client "dsmc" ends up in `/usr/local/bin/dsm c` and the gui in your Applications folder as two programs, both "Tivoli Storage Manager" and "TSM tools for administrators" where the first only works if you already are logged in as an admin, otherwise it isn't allowed to read config files and hence won't reach the TSM server, and the second will first run sudo, and then start TSM as an admin.
