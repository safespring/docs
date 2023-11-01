REST API Resources
===================

This document provides an overview of the REST API resources in Cloutility and their structures. A more complete documentation of Cloutility's REST API resources can be found [here](https://portal-api.backup.sto2.safedc.net/v1/help).

## APIEndpoint
```json
{
  "name": string,
  "method": string,
  "href": string
}
```

## TimeZone
```json
{
  "$type": string,  // optional
  "href": string,  // optional
  "actions": [APIEndpoint...],  // optional
  "name": string,
  "windowsId": string,
  "offset": integer,
  "id": integer,
  "createdDate": date
}
```

## TimeZoneList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [TimeZone...]
}
```

## AddressType
```json
{
  "id": integer,
  "name": string,
  "createdDate": date
}
```

## Country
```json
{
  "name": string,
  "code": string,
  "id": integer,
  "createdDate": date
}
```

## Address
```json
{
  "href": string,
  "name": string,
  "street": string,
  "zipCode": string,
  "city": string,
  "contactPerson": string,
  "phone": string,
  "emails": [string...],
  "type": AddressType,
  "country": Country,
  "id": integer,
  "createdDate": date
}
```

## AddressList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [Address...]
}
```

## Privilege
```json
{
  "name": string,
  "operation": string,
  "resource": string,
  "id": integer,
  "createdDate": date
}
```

## Role
```json
{
  "inheritable": boolean,
  "name": string,
  "description": string,
  "privileges": [Privilege...],
  "id": integer,
  "createdDate": date
}
```

## Language
```json
{
  "name": string,
  "iso639Code": string,
  "id": integer,
  "createdDate": date
}
```

## Action
```json
{
  "href": string,
  "name": string,
  "id": integer,
  "createdDate": date
}
```

## IdentityProvider
```json
{
  "guid": string,
  "name": string,
  "inherited": boolean,
  "public": boolean,
  "entityId": integer,
  "identityLocation": string,
  "singleSignOnUrl": string,
  "signInUrl": string,
  "certificate": bytes,
  "certificateName": string,
  "certificateInfo": string,
  "publicKey": string,
  "signatureKeys": string,
  "enableUserEmail": boolean,
  "ignoreTotp": boolean,
  "latestSamlAssertion": string,
  "businessUnit": BusinessUnit,
  "id": integer,
  "createdDate": date,
  "archivedDate": date
}
```

## UserIdentity
```json
{
  "identifier": string,
  "user": User,
  "identityProvider": IdentityProvider,
  "id": integer,
  "createdDate": date,
  "archivedDate": date
}
```

## User
```json
{
  "href": string,
  "actions": [Action...],
  "name": string,
  "phone": string,
  "email": string,
  "failedLoginAttempts": integer,
  "usesTotp": boolean,
  "locked": boolean,
  "dateFormatInitialized": string,
  "timeFormatInitialized": string,
  "dateTimeFormat": string,
  "dateAtTimeFormat": string,
  "csvDelimiter": string,
  "decimalMark": string,
  "role": Role,
  "lastLoginDate": date,
  "lastPasswordChange": string,
  "businessUnit": BusinessUnit,
  "businessUnitId": integer,
  "language": Language,
  "receiveCommentNotifications": boolean,
  "receiveDeleteRequestNotifications": boolean,
  "useOwnReportErrorConfig": boolean,
  "groupStatusReportByBusinessUnits": boolean,
  "itemsPerPage": integer,
  "excludeJobTags": boolean,
  "userIdentities": [UserIdentity...],
  "displayName": string,
  "id": integer,
  "createdDate": date
}
```

## UserList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [User...]
}
```

## DataSourceState
```json
{
  "id": integer,
  "name": string
}
```

## DataSourceType
```json
{
  "id": integer,
  "name": string
}
```

## BusinessUnitTag
```json
{
  "id": integer,
  "businessUnitId": integer,
  "text": string,
  "inheritable": boolean,
  "businessUnitCount": integer,
  "consumerCount": integer
}
```

## BusinessUnitURL
```json
{
  "$type": string  // optional
  "href": string,
  "total": integer,
  "offset": integer,  // optional
  "first": string,  // optional
  "items": [BusinessUnit...]
}
```

## SimpleBusinessUnit
```json
{
  "id": integer,
  "parentId": integer,  // optional
  "name": string,
  "groupName": string,
  "reportRemotely": boolean,
  "businessUnits": [SimpleBusinessUnit...],
  "tags": [BusinessUnitTag...],
  "invoiceDay": integer
}
```

## BusinessUnit
A business unit.
```json
{
  "href": string,
  "parentBusinessUnit": BusinessUnit,  // optional
  "timeZone": TimeZone,  // optional
  "users": UserList | BusinessUnitURL,  // optional
  "addresses": AddressList | BusinessUnitURL,  // optional
  "businessUnits": BusinessUnitList | BusinessUnitURL,  // optional
  "ancestors": BusinessUnitURL,  // optional
  "note": string,  // optional
  "contract": Contract,  // optional
  "domainFilter": [string...],
  "clientOptionSetFilter": [string...],
  "name": string,
  "supportResponsible": boolean,
  "registrationNumber": string,
  "invoiceDay": integer,
  "billingStorageTypeId": integer,
  "billingStorageType": integer,
  "useScheduleBindings": boolean,
  "consumers": [Consumer...],
  "storageLimit": integer,
  "transferLimit": integer,
  "nodeLimit": integer,
  "passwordExpirationDays": integer,
  "requiredApproversOfDeleteRequest": integer,
  "finalDeleteRequestApprover": boolean,
  "usersCanApproveOwnRequests": boolean,
  "reportRemotely": boolean,
  "tags": [BusinessUnitTag...],
  "id": integer,
  "createdDate": date
}
```

## BusinessUnitList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,  // optional
  "first": string,  // optional
  "items": [BusinessUnit...]
}
```

## BackupServer
```json
{
  "href": string,
  "id": integer,
  "name": string
}
```

## ClientOptionSet
```json
{
  "href": string,  // optional
  "name": string,
  "description": string,  // optional
  "id": integer,
  "createdDate": date
}
```

## ClientOptionSetList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [ClientOptionSet...]
}
```

## Domain
```json
{
  "href": string,  // optional
  "server": BackupServer,  // optional
  "name": string,
  "description": string,
  "backupRetention": integer,
  "archiveRetention": integer,
  "missingInTsm": boolean,
  "id": integer,
  "createdDate": date
}
```

## DomainList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [Domain...]
}
```

## NodeType
```json
{
  "href": string,  // optional
  "id": integer,
  "name": string,
  "shortName": string,  // optional
  "createdDate": date
}
```

## NodeTypeList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [NodeType...]
}
```

## NodeOperatingSystem
```json
{
  "href": string,  // optional
  "name": string,
  "shortName": string,
  "supportedNodeTypes": [NodeType...],  // optional
  "id": integer,
  "createdDate": date
}
```

## NodeOperatingSystemList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [NodeOperatingSystem...]
}
```

## NodePlatform
```json
{
  "name": string,
  "id": integer,
  "createdDate": date
}
```

## NodeTsmClientVersion
```json
{
  "name": string,
  "id": integer,
  "createdDate": date
}
```

## NodeOSLevel
```json
{
  "name": string,
  "id": integer,
  "createdDate": date
}
```

## NodeSyncState
```json
{
  "name": string,
  "id": integer,
  "createdDate": date
}
```

## SessionSecurity
```json
{
  "id": integer,
  "name": string
}
```

## DataSourceType
```json
{
  "id": integer,
  "name": string
}
```

## DataSourceState
```json
{
  "id": integer,
  "name": string
}
```

## PeriodUnit
```json
{
  "name": string,
  "id": integer,
  "createdDate": date,
  "archivedDate": date
}
```

## DurationUnit
```json
{
  "name": string,
  "id": integer,
  "createdDate": date,
  "archivedDate": date
}
```

## Schedule
```json
{
  "name": string,
  "description": string,
  "domain": Domain,
  "action": Action,
  "objects": string,
  "options": string,
  "asNodeNames": [string...],
  "startTime": date,
  "periodUnit": PeriodUnit,
  "duration": integer,
  "durationUnit": DurationUnit,
  "priority": integer,
  "dayOfWeek": string,
  "monday": boolean,
  "tuesday": boolean,
  "wednesday": boolean,
  "thursday": boolean,
  "friday": boolean,
  "saturday": boolean,
  "sunday": boolean,
  "id": integer,
  "createdDate": date,
  "archivedDate": date
}
```

## NodeSchedule
```json
{
  "schedule": Schedule,
  "node": Node,
  "lastSuccessful": date,
  "errorCount": integer,
  "errorHandled": boolean,
  "id": integer,
  "createdDate": date,
  "archivedDate": date
}
```

## EventStatus
```json
{
  "name": string,
  "id": integer,
  "createdDate": date,
  "archivedDate": date
}
```

## EventReason
```json
{
  "name": string,
  "id": integer,
  "createdDate": date,
  "archivedDate": date
}
```

## ActivityType
```json
{
  "name": string,
  "id": integer,
  "createdDate": date,
  "archivedDate": date
}
```

## ActivityLog
```json
{
  "severity": string,
  "message": string,
  "messageNumber": integer,
  "node": Node,
  "schedule": Schedule,
  "activity": Activity,
  "filtered": boolean,
  "id": integer,
  "createdDate": date,
  "archivedDate": date
}
```

## Activity
```json
{
  "inProgress": boolean,
  "type": ActivityType,
  "address": string,
  "examindedFiles": integer,
  "affectedFiles": integer,
  "failedFiles": integer,
  "bytes": integer,
  "idle": integer,
  "mediaWait": integer,
  "processes": integer,
  "successful": boolean,
  "communicateWait": integer,
  "startTime": date,
  "endTime": date,
  "details": string,
  "node": Node,
  "dataMover": Node,
  "filespace": Filespace,
  "subEntity": string,
  "asNode": string,
  "schedule": Schedule,
  "event": Event,
  "activityLogs": [ActivityLog...],
  "id": integer,
  "createdDate": date,
  "archivedDate": date
}
```

## Event
```json
{
  "status": EventStatus,
  "result": integer,
  "reason": EventReason,
  "scheduledStart": date,
  "actualStart": date,
  "completed": date,
  "updatedToJob": boolean,
  "node": Node,
  "dataMover": Node,
  "domain": Domain,
  "schedule": Schedule,
  "activities": [Activity...],
  "importedFromNodeUpdate": boolean,
  "id": integer, 
  "createdDate": date,
  "archivedDate": date
}
```

## RetentionRule
```json
{
  "name": string,
  "nodePaths": string,
  "filespacePaths": string,
  "retentionDays": integer,
  "isActive": boolean,
  "startTime": date,
  "description": string,
  "scheduleStyle": string,
  "frequency": string,
  "dayOfWeek": string,
  "month": string,
  "dayOfMonth": string,
  "weekOfMonth": string,
  "nextStart": date,
  "previousStart": date,
  "id": integer,
  "createdDate": date,
  "archivedDate": date
}
```

## RetentionSetState
```json
{
  "name": string,
  "id": integer
}
```

## RetentionSet
```json
{
  "description": string,
  "expiryDate": date,
  "fileCount": integer,
  "spId": integer,
  "retentionPeriod": string,
  "rule": RetentionRule,
  "sizeMegaBytes": integer,
  "state": RetentionSetState,
  "pointInTime": date,
  "lastUpdatedBy": string,
  "lastUpdated": date,
  "nodes": [Node...],
  "filespaces": [Filespace...],
  "id": integer,
  "createdDate": date,
  "archivedDate": date
}
```

## NodeGroup
```json
{
  "name": string,
  "id": integer,
  "createdDate": date,
  "archivedDate": date
}
```

## ActivityLogFilter
```json
{
  "filter": string,
  "messageNumber": string,
  "id": integer,
  "createdDate": date,
  "archivedDate": date
}
```

## Node
A backup node.
```json
{
  "href": string,
  "cpuCount": integer,
  "activatedDate": date,  // optional
  "locked": boolean,
  "operatingSystem": NodeOperatingSystem,
  "type": NodeType,
  "syncState": NodeSyncState,
  "domain": Domain,
  "clientOptionSet": ClientOptionSet,
  "schedules": [Schedule...],
  "nodeSchedules": [NodeSchedule...],
  "filespaces": [Filespace...],
  "events": [Event...],
  "unscheduledActivities": [Activity...],
  "ticket": string,
  "retentionSets": [RetentionSet...],
  "activityLogs": [ActivityLog...],
  "proxyAgents": [Node...],
  "proxyTargets": [Node...],
  "nodeGroups": [NodeGroup...],
  "tsmName": string,
  "tsmNodeId": string,  // optional
  "tsmPassword": string,
  "contact": string,
  "platform": NodePlatform,
  "tsmClientVersion": NodeTsmClientVersion,
  "osLevel": NodeOSLevel,
  "tcpName": string,
  "tcpAddress": string,
  "macAddress": string,  // optional
  "sessionSecurity": SessionSecurity,
  "hypervisor": string,  // optional
  "containsVmFilespaces": boolean,
  "lastAccessTime": string,  // optional
  "registeredTime": string,  // optional
  "decommissioned": boolean,
  "replicationState": boolean,
  "replicationMode": integer,
  "replicationServerPrimary": string,  // optional
  "replicationServerSecondary": string,  // optional
  "replicationServerSecondary2": string,  // optional
  "activityLogFilters": [ActivityLogFilter...],
  "remoteActivities": [...],
  "name": string,
  "dataSourceState": DataSourceState,
  "dataSourceType": DataSourceType,
  "consumer": Consumer,
  "id": integer,
  "createdDate": date
}
```

## NodeList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [Node...]
}
```

## StoragePool
```json
{
  "name": string,
  "type": string,
  "totalStorageMegaBytes": float,
  "freeStorageMegaBytes": float,
  "maxProcesses": integer,
  "id": integer,
  "createdDate": date
}
```

## FilespaceOccupancyType
```json
{
  "id": integer,
  "name": string,
  "createdDate": date
}
```

## FilespaceOccupancy
```json
{
  "storagePool": StoragePool,
  "files": integer,
  "logicalMegaBytes": float,
  "logicalMegaBytesCorrected": float,
  "dedupStatNeeded": boolean,
  "dedupStatUpToDate": boolean,
  "physicalMegaBytes": float,
  "reportingMegaBytes": float,
  "storageMegaBytes": float,
  "type": FilespaceOccupancyType,
  "id": integer,
  "createdDate": date
}
```

## Filespace
```json
{
  "href": string,
  "tsmFilespaceId": string,
  "type": string,
  "capacityMegaBytes": float,
  "frontEndCapacityMegaBytes": integer,
  "percentageUtilized": float,
  "lastBackupStart": date,
  "lastBackupEnd": date,
  "occupancies": [FilespaceOccupancy...],
  "dedupStats": [...],
  "activities": [...],
  "events": [...],
  "node": Node,
  "retentionSets": [...],
  "name": string,
  "dataSourceState": DataSourceState,
  "id": integer,
  "createdDate": date
}
```

## FilespaceList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [Filespace...]
}
```

## Consumer
```json
{
  "dataSourceType": DataSourceType,
  "dataSourceIsPotentialParent": boolean,
  "dataSourceState": DataSourceState,
  "latestRestorePoint": date,
  "name": string,
  "billingStartDate": date,
  "businessUnit": BusinessUnit,
  "comments": [Comment...],
  "note": string,  // optional
  "externalReference": string,  // optional
  "node": Node,
  "limitHighStorage": integer,
  "allowNoActivity": boolean,
  "tags": [BusinessUnitTag...],
  "jobs": [...],
  "id": integer,
  "createdDate": date,
  "billingEndDate": boolean,
  "scheduledDeletionDate": boolean
}
```

## ConsumerList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [Consumer...]
}
```

## BillingDataSummary
```json
{
  "currency": Currency,
  "total": float
}
```

## BillingData
```json
{
  "href": string,  // optional
  "invoiceDateStr": string,
  "summary": [BillingDataSummary...],  // optional
  "billingBusinessUnit": BusinessUnit,
  "invoiceDate": date,
  "invoices": [Invoice...],
  "id": integer,
  "createdDate": date
}
```

## BillingDataList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [BillingData...]
}
```

## BillingCycle
```json
{
  "id": integer,
  "name": string,
  "createdDate": date,
  "months": integer
}
```

## PaymentTerms
```json
{
  "name": string,
  "code": string,
  "id": integer,
  "createdDate": date
}
```

## Currency
```json
{
  "name": string,
  "code": string,
  "symbol": string,
  "displayName": string,
  "longDisplayName": string,
  "id": integer,
  "createdDate": date
}
```

## QuantityCalculationOption
```json
{
  "id": integer,
  "name": string
}
```

## InvoiceMethodType
```json
{
  "name": string,
  "id": integer,
  "createdDate": date
}
```

## InvoiceMethod
```json
{
  "name": string,
  "invoicesRemoteData": boolean,
  "isQuantifiable": boolean,
  "replicationAware": boolean,
  "isSystemOnly": boolean,
  "usesSettlementMethod": boolean,
  "type": InvoiceMethodType,
  "id": integer,
  "createdDate": date
}
```

## ProductCode
```json
{
  "name": string,
  "id": integer,
  "createdDate": date
}
```

## Product
```json
{
  "name": string,
  "inherited": boolean,
  "inheritable": boolean,
  "method": InvoiceMethod,
  "replicationType": integer,
  "inheritedProductCode": ProductCode,  // optional
  "id": integer,
  "createdDate": date
}
```

Find replication types [here](https://portal-api.backup.sto2.safedc.net/v1/help/ResourceModel?modelName=ReplicationType).

## SubscriptionComponent
```json
{
  "quantity": integer,
  "price": float,
  "isCapacity": boolean,
  "includedBundles": integer,
  "startDate": date,
  "quantityCalculationOption": QuantityCalculationOption,
  "product": Product,
  "replicationType": integer,
  "id": integer,
  "createdDate": date
}
```

## ContractSubscription
```json
{
  "billingStartDate": date,  // optional
  "name": string,
  "currency": Currency,
  "contractCount": integer,
  "components": [SubscriptionComponent...],  // optional
  "id": integer,
  "createdDate": date
}
```

## Referral
```json
{
  "contract": Contract,
  "referrer": BusinessUnit,
  "percentage": float,
  "billingStartDate": date,
  "billingEndDate": date,
  "id": integer,
  "createdDate": date,
  "archivedDate": date
}
```

## Contract
```json
{
  "href": string,  // optional
  "billingStartDate": date,
  "agreedLegalTerms": string,
  "erpReference": string,
  "discount": float,
  "byCalendar": boolean,
  "prepayConsumption": boolean,
  "useCpuMultiplier": boolean,
  "billingCycle": BillingCycle,  // optional
  "paymentTerms": PaymentTerms,  // optional
  "currency": Currency,
  "subscriptions": [ContractSubscription...],
  "referrals": [Referral...],
  "id": integer,
  "createdDate": date
}
```

## InvoiceLine
```json
{
  "subscription": Subscription,
  "product": Product,
  "startDate": date,
  "endDate": date,
  "unitPrice": float,
  "quantity": float,
  "note": string,
  "id": integer,
  "createdDate": date
}
```

## Invoice
```json
{
  "href": string,
  "payingBusinessUnit": BusinessUnit,
  "lines": [InvoiceLine...],
  "id": integer,
  "createdDate": date
}
```

## InvoiceList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [Invoice...]
}
```
