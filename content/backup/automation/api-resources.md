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

## Action
```json
{
  "href": string,
  "name": string,
  "id": integer,
  "createdDate": date
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

## ActivityType
```json
{
  "name": string,
  "id": integer,
  "createdDate": date,
  "archivedDate": date
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

## AddressType
```json
{
  "id": integer,
  "name": string,
  "createdDate": date
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

## BillingCycle
```json
{
  "id": integer,
  "name": string,
  "createdDate": date,
  "months": integer
}
```

## BillingData
```json
{
  "href": string,  // Optional
  "invoiceDateStr": string,
  "summary": [BillingDataSummary...],  // Optional
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

## BillingDataSummary
```json
{
  "currency": Currency,
  "total": float
}
```

## BusinessUnit
A business unit.
```json
{
  "href": string,
  "parentBusinessUnit": BusinessUnit,  // Optional
  "timeZone": TimeZone,  // Optional
  "users": UserList | BusinessUnitURL,  // Optional
  "addresses": AddressList | BusinessUnitURL,  // Optional
  "businessUnits": BusinessUnitList | BusinessUnitURL,  // Optional
  "ancestors": BusinessUnitURL,  // Optional
  "note": string,  // Optional
  "contract": Contract,  // Optional
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
  "offset": integer,  // Optional
  "first": string,  // Optional
  "items": [BusinessUnit...]
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
  "$type": string  // Optional
  "href": string,
  "total": integer,
  "offset": integer,  // Optional
  "first": string,  // Optional
  "items": [BusinessUnit...]
}
```

## ClientOptionSet
```json
{
  "href": string,  // Optional
  "name": string,
  "description": string,  // Optional
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
  "note": string,  // Optional
  "externalReference": string,  // Optional
  "node": Node,
  "limitHighStorage": integer,
  "allowNoActivity": boolean,
  "tags": [BusinessUnitTag...],
  "jobs": [Job...],
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

## Contract
```json
{
  "href": string,  // Optional
  "billingStartDate": date,
  "agreedLegalTerms": string,
  "erpReference": string,
  "discount": float,
  "byCalendar": boolean,
  "prepayConsumption": boolean,
  "useCpuMultiplier": boolean,
  "billingCycle": BillingCycle,  // Optional
  "paymentTerms": PaymentTerms,  // Optional
  "currency": Currency,
  "subscriptions": [ContractSubscription...],
  "referrals": [Referral...],
  "id": integer,
  "createdDate": date
}
```

## ContractSubscription
```json
{
  "billingStartDate": date,  // Optional
  "name": string,
  "currency": Currency,
  "contractCount": integer,
  "components": [SubscriptionComponent...],  // Optional
  "id": integer,
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

## DataSourceState
```json
{
  "id": integer,
  "name": string
}
```

## DataSourceType
We only have one such resource in use:
```json
{
  "id": 1,
  "name": "SP Backup node"
}
```

## DedupStat
```json
{
  "spCreatedDate": date,
  "storagePoolName": string,
  "storagePool": StoragePool,
  "nodeName": string,
  "filespaceName": string,
  "filespace": Filespace,
  "physicalMegaBytes": float,
  "protectedMegaBytes": float,
  "type": string,
  "id": integer,
  "createdDate": date,
  "archivedDate": date
}
```

## Domain
```json
{
  "href": string,  // Optional
  "server": BackupServer,  // Optional
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

## DurationUnit
```json
{
  "name": string,
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

## EventReason
```json
{
  "name": string,
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
  "dedupStats": [DedupStat...],
  "activities": [Activity...],
  "events": [Event...],
  "node": Node,
  "retentionSets": [RetentionSet...],
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

## FilespaceOccupancyType
```json
{
  "id": integer,
  "name": string,
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

## InvoiceMethodType
```json
{
  "name": string,
  "id": integer,
  "createdDate": date
}
```

## Job
```json
{
  "href": string,
  "businessUnitId": integer,
  "consumerId": integer,
  "dataSourceId": integer,
  "serverId": integer,
  "tags": [Tag...],
  "type": JobType,  // Optional
  "status": JobStatus,  // Optional
  "severity": JobSeverity,
  "supportStatus": SupportStatus,  // Optional
  "dataSourceType": DataSourceType,  // Optional
  "dataSourceState": DataSourceState,  // Optional
  "scheduled": boolean,
  "scheduledStart": date,  // Optional
  "actualStart": date,  // Optional
  "completed": date,
  "examinedFiles": integer,
  "affectedFiles": integer,
  "failedFiles": integer,
  "result": integer,
  "transferredMegaBytes": float,
  "transferredGigaBytes": float,
  "serverType": ServerType,  // Optional
  "jobName": JobName,  // Optional
  "name": string,
  "duration": timedelta,
  "transferredMegaBytesPerSecond": float,
  "id": integer,
  "createdDate": date
}
```

The values
that `JobSeverity` can assume are defined [here](https://portal-api.backup.sto2.safedc.net/v1/help/ResourceModel?modelName=JobSeverity).

## JobList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [Job...]
}
```
## JobName
```json
{
  "name": string,
  "id": integer,
  "createdDate": date,
  "archivedDate": date
}
```

## JobStatus
```json
{
  "id": integer,
  "name": string
}
```

## JobType
```json
{
  "id": integer,
  "name": string
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

## Node
A backup node.
```json
{
  "href": string,
  "cpuCount": integer,
  "activatedDate": date,  // Optional
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
  "tsmNodeId": string,  // Optional
  "tsmPassword": string,
  "contact": string,
  "platform": NodePlatform,
  "tsmClientVersion": NodeTsmClientVersion,
  "osLevel": NodeOSLevel,
  "tcpName": string,
  "tcpAddress": string,
  "macAddress": string,  // Optional
  "sessionSecurity": SessionSecurity,
  "hypervisor": string,  // Optional
  "containsVmFilespaces": boolean,
  "lastAccessTime": string,  // Optional
  "registeredTime": string,  // Optional
  "decommissioned": boolean,
  "replicationState": boolean,
  "replicationMode": integer,
  "replicationServerPrimary": string,  // Optional
  "replicationServerSecondary": string,  // Optional
  "replicationServerSecondary2": string,  // Optional
  "activityLogFilters": [ActivityLogFilter...],
  "remoteActivities": [...],  // SAP-HANA specific, should always be empty
  "name": string,
  "dataSourceState": DataSourceState,
  "dataSourceType": DataSourceType,
  "consumer": Consumer,
  "id": integer,
  "createdDate": date
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

## NodeOSLevel
```json
{
  "name": string,
  "id": integer,
  "createdDate": date
}
```

## NodeOperatingSystem
```json
{
  "href": string,  // Optional
  "name": string,
  "shortName": string,
  "supportedNodeTypes": [NodeType...],  // Optional
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

## NodeReport
```json
{
  "name": string,  // Consumption unit name
  "statusReportId": integer,
  "pending": boolean,
  "dataSourceType": DataSourceType,
  "nodeReportTypeId": integer,
  "dataSource": string,  // Node name
  "dataSourceState": DataSourceState,
  "deviceName": string,
  "tsmName": string,  // Node name
  "status": ErrorStatus,
  "tsmServerName": string,
  "proxyNodeReports": [NodeReport...],
  "errorsDeactivated": boolean,
  "errorsDeactivatedNoActivity": boolean,
  "megaBytes": float,
  "backupMegaBytes": float,
  "archiveMegaBytes": float,
  "megaBytesDelta": float,
  "megaBytesDeltaPercentage": float,
  "backupMegaBytesDeltaPercentage": float,
  "archiveMegaBytesDeltaPercentage": float,
  "backupMegaBytesDelta": float,
  "archiveMegaBytesDelta": float,
  "megaBytesForCurrentBusinessUnit": float,
  "backupMegaBytesForCurrentBusinessUnit": float,
  "archiveMegaBytesForCurrentBusinessUnit": float,
  "comments": [Comment...],
  "transferredMegaBytes": float,
  "transferredBackupMegaBytes": float,
  "transferredRestoreMegaBytes": float,
  "percentOfTotalStorageOfBusinessUnit": float,
  "consumerId": integer,
  "nodeId": integer,
  "businessUnitId": integer,
  "businessUnitName": string,
  "reportDate": date,
  "warnings": [NodeReportWarning...],  // Optional
  "id": integer,
  "createdDate": date,
  "href": string
}
```
All `ErrorStatus` values are defined [here](https://portal-api.backup.sto2.safedc.net/v1/help/ResourceModel?modelName=ErrorStatus).

## NodeReportList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [NodeReport...]
}
```
## NodeReportWarning
```json
{
  "type": NodeWarningType,
  "status": ErrorStatus,
  "days": integer,
  "limit": float,
  "nodeReportId": integer,
  "id": integer,
  "createdDate": date
}
```
All `ErrorStatus` values are defined [here](https://portal-api.backup.sto2.safedc.net/v1/help/ResourceModel?modelName=ErrorStatus).

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

## NodeSyncState
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

## NodeType
```json
{
  "href": string,  // Optional
  "id": integer,
  "name": string,
  "shortName": string,  // Optional
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

## NodeWarningType
```json
{
  "name": string,  // Optional
  "usesLimit": boolean,
  "id": integer,
  "createdDate": date
}
```

## NodeWarningTypeList
```json
{
  "href": string,
  "total": integer,
  "offset": integer,
  "first": string,
  "items": [NodeWarningType...]
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

## PeriodUnit
```json
{
  "name": string,
  "id": integer,
  "createdDate": date,
  "archivedDate": date
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

## Product
```json
{
  "name": string,
  "inherited": boolean,
  "inheritable": boolean,
  "method": InvoiceMethod,
  "replicationType": integer,
  "inheritedProductCode": ProductCode,  // Optional
  "id": integer,
  "createdDate": date
}
```

Find replication types [here](https://portal-api.backup.sto2.safedc.net/v1/help/ResourceModel?modelName=ReplicationType).

## ProductCode
```json
{
  "name": string,
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

## RetentionSetState
```json
{
  "name": string,
  "id": integer
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

## ServerType
There should only be one such resource:
```json
{
  "id": 1,
  "name": "IBM Storage Protect"
}
```

## SessionSecurity
```json
{
  "id": integer,
  "name": string
}
```

## SimpleBusinessUnit
```json
{
  "id": integer,
  "parentId": integer,  // Optional
  "name": string,
  "groupName": string,
  "reportRemotely": boolean,
  "businessUnits": [SimpleBusinessUnit...],
  "tags": [BusinessUnitTag...],
  "invoiceDay": integer
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

## SupportStatus
```json
{
  "id": integer,
  "name": string
}
```

## TimeZone
```json
{
  "$type": string,  // Optional
  "href": string,  // Optional
  "actions": [APIEndpoint...],  // Optional
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
