First of all, get the latest released TSM bundle (comes in `.DMG` format), since recent macOS requires a recent TSM to work, this folder holds 7.1.6.x.:

!!! note "Latest V7 patch release"
    [Mac TSM client 7.1.8.6](https://www3.software.ibm.com/storage/tivoli-storage-management/patches/client/v7r1/Mac/v718/7.1.8.6-TIV-TSMBAC-Mac.dmg)

!!! note "Latest V8 release"
    [Mac TSM client 8.1.8.0](https://www3.software.ibm.com/storage/tivoli-storage-management/maintenance/client/v8r1/Mac/v818/8.1.8.0-TIV-TSMBAC-Mac.dmg)

Install it as usual on Mac by attaching the DMG as a disk and then click on the installer icon.

Then grab this script [certificate installation script for macOS](https://raw.githubusercontent.com/IPnett/cloud-BaaS/master/pki/IPnett-Cloud-Root-CA-macosx.sh) and the certificate in PEM format here [BaaS service CA root certificate](https://raw.githubusercontent.com/IPnett/cloud-BaaS/master/pki/IPnett-Cloud-Root-CA.pem).

```shell tab="Shell"
#!/bin/sh

PASSWORD=$(mktemp -d /tmp/temp-one-time-idXXXXXXXXXXXXX)
rmdir $PASSWORD

KDB="/Library/Application Support/tivoli/tsm/client/ba/bin/dsmcert.kdb"
GSK8CAPICMD=/Library/ibm/gsk8/bin/gsk8capicmd

rm -f "/Library/Application Support/tivoli/tsm/client/ba/bin/dsmcert.*"

$GSK8CAPICMD -keydb -create -db "$KDB" -pw "$PASSWORD" -stash

$GSK8CAPICMD -cert -add -db "$KDB" -format ascii -stashed \
	-label "IPnett BaaS Root CA" \
	-file ./IPnett-Cloud-Root-CA.pem

$GSK8CAPICMD -cert -list -db "$KDB" -stashed
```

```pem tab="PEM"
-----BEGIN CERTIFICATE-----
MIIECDCCAvCgAwIBAgIBADANBgkqhkiG9w0BAQsFADBgMQswCQYDVQQGEwJOTzES
MBAGA1UECgwJSVBuZXR0IEFTMR4wHAYDVQQLDBVJUG5ldHQgQ2xvdWQgU2Vydmlj
ZXMxHTAbBgNVBAMMFElQbmV0dCBDbG91ZCBSb290IENBMB4XDTE1MDExNTEzMjkz
M1oXDTM1MDExMDEzMjkzM1owYDELMAkGA1UEBhMCTk8xEjAQBgNVBAoMCUlQbmV0
dCBBUzEeMBwGA1UECwwVSVBuZXR0IENsb3VkIFNlcnZpY2VzMR0wGwYDVQQDDBRJ
UG5ldHQgQ2xvdWQgUm9vdCBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAK8y5ni/lQvmMmIGMFCiTJhtKY7ErL7NpM7GyXziizZ0SfPOCsK2OcGN6+5i
tRNbZee1e6wqK71GAokrjMzCZTzdS0n0qWREM4EUBbn9b5cCCUlr5E+SRrjU0oWq
IcnMClsax26FJIXfro3m7gL6EJr5HENwwVZQg9FlCH4Xm/UHuspghTg2/2J3NYkj
5q5ybQaDwEI2L4hCoQUsWY6WzfLMYtOtcJ8bB5imeH/Eck2nxNfRfrfJYNZJQlx8
ac1/iRgBwsC7I4/XJinVi97Zfr16yp2Xl3WDHItYhqM62sPaBTzMKZsQlR3XW2nY
NomGExqALaCF5vkW/soT5hh56CUCAwEAAaOBzDCByTAPBgNVHRMBAf8EBTADAQH/
MB0GA1UdDgQWBBTJmXRAhVP2425QZtqulPQcL61pyDCBiQYDVR0jBIGBMH+AFMmZ
dECFU/bjblBm2q6U9BwvrWnIoWSkYjBgMQswCQYDVQQGEwJOTzESMBAGA1UECgwJ
SVBuZXR0IEFTMR4wHAYDVQQLDBVJUG5ldHQgQ2xvdWQgU2VydmljZXMxHTAbBgNV
BAMMFElQbmV0dCBDbG91ZCBSb290IENBggEAMAsGA1UdDwQEAwIBhjANBgkqhkiG
9w0BAQsFAAOCAQEAB8X8HjpGGUgdnyoS1j34EqeWu9RQxuM/JGMlE3JKgnBaAsd7
9+L0abJBZ8X48rTOn1IwtxXuE53xcDk+2BTL91Qn/eoZxUJJWzK0Ai/QxzaWMCrT
8N5Z8McEdCI2p5MS40HMrL4PODuWmt3lrxwVDUJRHCrj3M9+7U2Offgru8WKYjja
2EtJpW5t80M5BDEjzOkFeOCX+ySsHlZqFV92VdkkjATz7ti3mSbnaGJLfoF7YtHQ
CWZGUzqLHYzNl1urLGK7aUO9qoNAKhn5HtShBfNVeDG7MbJIlg4gFqs4cIylpwY+
Wb8FtMkMugL6jprYjO/dqTfaNN4EQA7x4ZafvQ==
-----END CERTIFICATE-----
```

Put the PEM file next to the script and run the script. It will clean out any previous certificates in the IBM TSM certificate database. If you haven't been running TSM over TLS it will only contain IBM default entries which are of no use. It will not affect any other system or application certificate bundles. It will also not use any of them.

After this, the example configuration files can be collected from the BaaS Portal. TSM for macOS will read preference files from `/Library/Application Support/tivoli/tsm/client/ba/bin/dsm.*` but apart from that works like any other Unix system in terms of how to write Include/Exclude paths and so on. Any generic unix TSM guide will probably work if you replace `/opt/` with `/Library/Application Support/` for where to find TSM files.

The command line backup client "dsmc" ends up in `/usr/local/bin/dsm c` and the gui in your Applications folder as two programs, both "Tivoli Storage Manager" and "TSM tools for administrators" where the first only works if you already are logged in as an admin, otherwise it isn't allowed to read config files and hence won't reach the TSM server, and the second will first run sudo, and then start TSM as an admin.
