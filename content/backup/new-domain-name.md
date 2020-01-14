# Change of host- and domain name for Support and Backup service 2020-01-19

In line with our work to replace the former parent company name from our services, at the time of renewal of the certificates that protect the Backup traffic, we will be renaming the endpoint to our own domain to match the Storage and Compute services.

*“tsm1.cloud.ipnett.se”* will change to **tsm1.backup.sto2.safedc.net** on the 19 of january 2020. You may update the domain name at any time. It's already active.

Since the DNS name is tied to the certificate used for TLS, the clients will need to update the root certificate in the IBM TSM keystore. We will be updating the client installers and provide simple scripts to help perform the edits for Win/Mac/Linux, but the changes will have to be done on every client.

This solely affects customers who do backups against TSM1 (tsm1.cloud.ipnett.se), customers whose clients point to any other of our TSM servers already have the correct root certificate and server endpoint domain names and need not do anything.

## Technical details

The dsm.sys (unix-like OSes) or dsm.opt (Win) file needs to get TCPSERVERADDRESS updated from tsm1.cloud.ipnett.se to <b>tsm1.backup.sto2.safedc.net</b> and the root-ca for safedc.net needs to get into the IBM TSM keystore (dsmcert.kdb).</p><p>The old cert(s) in the keystore can stay, it will not do any harm if they remain. This will not affect the OS certificate stores, or any other application using certificates. </p>

### More information

<ul>
  <li><a href="https://docs.safespring.com/service/domain-changes/">Docs: Safespring domain name changes</a></li>
  <li><a href="https://github.com/safespring/cloud-BaaS/tree/master/pki">Helper scripts for migration and CA root certificate</a></li>
  <li><a href="https://github.com/safespring/cloud-BaaS/blob/master/pki/SafeDC-Net-Root-CA.pem">Certificate to add to keystore </a></li>
  <li><b>Linux:</b>
    <ul>
      <li><a href="https://github.com/safespring/cloud-BaaS/blob/master/pki/Update-SafeDC-Net-CA.sh">Update SafeDC-Net-CA</a></li>
      <li><a href="https://github.com/safespring/cloud-BaaS/blob/master/pki/Change-TSM-Hostname.sh">Change TSM-Hostname</a></li>
    </ul>
  </li>
  <li><b>Windows Powershell replace helper:</b>
    <ul>
      <li><a href="https://github.com/safespring/cloud-BaaS/blob/master/pki/Change-TSM-Hostname.cmd">Change TSM Hostname</a></li>
      <li><a href="https://github.com/safespring/cloud-BaaS/blob/master/pki/SafeDC-Net-Root-CA-win64.bat ">SafeDC Net Root CA win64</a></li>
    </ul>
  </li>
  <li><b>macOS:</b>
    <ul>
      <li><a href="https://github.com/safespring/cloud-BaaS/blob/master/pki/MacOSX-Update-SafeDC-Net-CA.sh">Update SafeDC-Net-CA</a></li>
      <li><a href="https://github.com/safespring/cloud-BaaS/blob/master/pki/MacOS-Change-TSM-Hostname.sh">Change TSM-Hostname</a></li>
    </ul>
  </li>
</ul>


