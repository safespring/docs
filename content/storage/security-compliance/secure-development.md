
# Secure Development

This document outlines the secure development requirements and practices for Safespring Storage services.

## 5.1 Development Lifecycle Security

Software developed for the Safespring Storage service adheres to the internal "DevOps guidelines" for secure development. The service architecture and design is defined in an internal service baseline.

Otherwise Safespring relies on the upstream community for maintaining security during the development lifecycle


## 5.2 Application Security Requirements

The Safespring Storage service relies on the secured common infrastructure layer used by Safespring services and on the upstream community for defining and implementing application security requirements.

## 5.3 Secure System Architecture

The Safespring Storage service is operated on the secured common infrastructure layer used by Safespring services. The internal `storage service baseline` defines the system architecture, automation design and forms the basis of our architecture design records(ADRs).



## 5.4 Secure Coding Standards

Software developed for the Safespring Storage service adheres to the internal "DevOps guidelines" for secure development.

The service itself is based on Ceph, Ceph has it's own guidelines and practices. Some of those can be found in various places, including:

* [contributor guidelines](https://docs.ceph.com/en/latest/dev/developer_guide/).
* [security guidelines](https://docs.ceph.com/en/latest/security/)

## 5.5 Security Testing

Software developed for the Safespring Storage service adheres to the internal "DevOps guidelines" for secure development.

Safespring does not implement any additional security testing for Ceph, instead we rely on the upstream community to provide this role.

## 5.6 Outsourced Development

Safespring does not currently outsource any development work for the compute services other than relying on the upstream community for Ceph development.
