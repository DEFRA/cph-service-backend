# CPH physical data model

Status: Proposal for review under CPH-116.

This design covers Draft and allocated CPH records, subject to scope confirmation. It starts from the existing `cph-records` structure and the LDM dated 29 September 2026. The currency of that LDM remains to be confirmed.

Examples use synthetic data. Proposed fields and relationships remain subject to review and agreement.

## Purpose and scope

This document proposes a MongoDB physical data model to help developers implement the CPH Logical Data Model.

It covers:

- Example Draft and allocated CPH data.
- Field names and storage types.
- Fields available after mapping, enrichment or allocation.
- Proposed embedding and reference arrangements.
- Identifiers, source traceability and audit information.
- Differences from the LDM and unresolved modelling questions.

The design needs to align with CPH-115, which records the mapping from DEFRA Forms answers to the CPH model.

Implementation of additional mappings, allocation logic and validation rules requires separate agreement.

## Existing implementation baseline

The service stores the original DEFRA Forms submission in `raw-form-submissions`. It then writes one derived document to `cph-records` for that submission. Implementation facts below were checked against backend commit `f2ef793` (`src/services/cph/cphRecords.js`, `process-cph.js`, `cph-mapping.js`, `validateRawSubmission.js` and `src/services/rawFormSubmissions.js`).

`raw-form-submissions` stores `referenceNumber` (String, unique index), `formId` (String), `receivedAt` (BSON Date) and `body` (String). `body` is the original Forms JSON payload as a string, not an embedded document. The derived record links to it through `source.rawSubmissionId`, which holds the raw document's ObjectId `_id`.

### Lifecycle statuses and allocation timing

The implementation sets `lifecycleStatus` to one of three values:

| Value | Set when |
| --- | --- |
| `"Draft"` | The record is created and no later step changes it. This includes a submission that does not meet the permanent allocation conditions below. |
| `"Active"` | Permanent allocation succeeds. |
| `"Manual Review"` | Body validation fails, the body cannot be parsed, or processing throws, for example because the parish lookup fails. |

Successful permanent allocation happens before the first `cph-records` write. The service builds the record in memory, starts it as `"Draft"`, runs mapping and validation, and then runs allocation. If allocation succeeds, the in-memory record already holds `cphNumber`, `lifecycleStatus: "Active"` and `startDate` when it is written. The implementation does not store a Draft and later update it, and it does not create a second document at allocation. `"Manual Review"` is an implementation value that is not in the XSD `CPH Status Type`.

A submission is allocated a permanent CPH when either condition holds:

- `livestockInformation.landOwned` is `true`.
- `landOwned` is `false`, `tenancyAgreementMoreThanOneYear` is `true` and `landownerHasCphNumber` is `false`.

A renter whose tenancy is not more than one year, or whose landowner has a CPH number, is not allocated. That record remains `"Draft"` with an empty `cphNumber`. Nothing in the inspected code allocates it later.

Allocation uses the first entry of `livestockInformation.locationEastingsAndNorthings` to look up the parish and builds `cphNumber` in the form `CC/PPP/NNNN` from a sequence in `cph-sequences` (range 1 to 4999 for `permanent`). The county and parish values are used to build the number and are not stored.

### Stored fields

The `cph-records` collection stores the following fields in the implementation inspected for CPH-116.

| Property | Storage type | Purpose |
| --- | --- | --- |
| `_id` | ObjectId | MongoDB document identifier |
| `cphNumber` | String | Empty string until permanent allocation, then `CC/PPP/NNNN` |
| `lifecycleStatus` | String | `"Draft"`, `"Active"` or `"Manual Review"` |
| `startDate` | String | ISO 8601 timestamp (`toISOString()`). Present only after permanent allocation |
| `source` | Embedded object | Submission provenance and source link |
| `source.rawSubmissionId` | ObjectId | Identifier of the original document in `raw-form-submissions` |
| `source.applicationReference` | String | Forms `meta.referenceNumber`, or `"Unknown"` |
| `source.formId` | String | Forms `meta.formId`, or `"Unknown"` |
| `source.formVersion` | Number | Forms `meta.versionMetadata.versionNumber`, or the string `"Unknown"` |
| `source.submittedAt` | BSON Date | Forms `meta.timestamp`, or the creation time if it is missing or invalid |
| `source.receivedAt` | BSON Date | Receipt timestamp copied from the raw submission |
| `livestockInformation` | Embedded object | Mapped answers. Absent when the body is unparseable or fails body validation |
| `livestockInformation.types` | Array of strings | Mapped livestock types |
| `livestockInformation.expectedArrivalDate` | Embedded object | `{ year, month, day }`, each a number, copied as submitted. It is not a `YYYY-MM-DD` string |
| `livestockInformation.landOwned` | Boolean | Answer to whether the applicant owns the land |
| `livestockInformation.tenancyAgreementMoreThanOneYear` | Boolean | Tenancy answer. Required by validation only when `landOwned` is `false` |
| `livestockInformation.landownerHasCphNumber` | Boolean | Landowner CPH answer. Required by validation only when `landOwned` is `false` |
| `livestockInformation.locationEastingsAndNorthings` | Array of embedded objects | `[{ easting: Number, northing: Number }]`, OSGB36 values as submitted |
| `validationErrors` | Array of embedded objects | `{ timestamp: String (ISO 8601), failure: String, context }`. Empty when no errors are recorded |
| `createdAt` | BSON Date | Record creation timestamp |
| `createdBy` | Embedded object | `{ identifier, name }` for the backend service actor |
| `modifiedAt` | BSON Date | Set to the creation time |
| `modifiedBy` | Embedded object | `{ identifier, name }` for the backend service actor |

`modifiedAt` and `modifiedBy` equal `createdAt` and `createdBy` because the implementation writes the record once and has no later update path.

The expected arrival date keys are `year`, `month` and `day`. Validation requires each to be an integer, with `year` of at least 2020, and checks that the combination is a real date. The original submitted value is stored, so conversion to the XSD's `xs:date` representation has not been implemented.

Metadata validation failures are recorded in `validationErrors` but do not change `lifecycleStatus`. A record can therefore be `"Active"` with a non-empty `validationErrors` array, and `source.formId`, `source.formVersion` and `source.applicationReference` can hold `"Unknown"`.

Record insertion uses an upsert matched on `source.rawSubmissionId` with `$setOnInsert`. An existing matching record is retained when the insertion is retried. The inspected code defines no unique index on `source.rawSubmissionId`. Allocation runs before the upsert. If a message is redelivered, allocation could therefore consume a further `cph-sequences` number that is then discarded. This is a possibility inferred from the code order and has not been verified by running a redelivery.

This baseline reflects the code at commit `f2ef793`. It should be checked against the implementation when this proposal is reviewed.

## Document examples - existing structure

Synthetic examples of the stored structure at commit `f2ef793`, using MongoDB Extended JSON to show ObjectId and BSON date types. `expectedArrivalDate` is shown as the `{ year, month, day }` object that the implementation stores.

### Draft (renter, not allocated)

A renter whose landowner already has a CPH number does not meet the permanent allocation conditions, so the record stays `"Draft"`.

```json
{
    "_id": { "$oid": "000000000000000000000001" },
    "cphNumber": "",
    "lifecycleStatus": "Draft",
    "source": {
        "rawSubmissionId": { "$oid": "000000000000000000000002" },
        "receivedAt": { "$date": "2026-10-27T09:00:01.000Z" },
        "applicationReference": "EXAMPLE-001",
        "formId": "example-create-form",
        "formVersion": 2,
        "submittedAt": { "$date": "2026-10-27T09:00:00.000Z" }
    },
    "createdAt": { "$date": "2026-10-27T09:00:02.000Z" },
    "createdBy": {
        "identifier": "cph-service-backend",
        "name": "CPH Service Backend"
    },
    "modifiedAt": { "$date": "2026-10-27T09:00:02.000Z" },
    "modifiedBy": {
        "identifier": "cph-service-backend",
        "name": "CPH Service Backend"
    },
    "validationErrors": [],
    "livestockInformation": {
        "types": ["Cattle"],
        "expectedArrivalDate": { "year": 2026, "month": 11, "day": 10 },
        "landOwned": false,
        "locationEastingsAndNorthings": [
            { "easting": 400000, "northing": 300000 }
        ],
        "tenancyAgreementMoreThanOneYear": true,
        "landownerHasCphNumber": true
    }
}
```

### Active (permanent CPH allocated)

Allocation has already succeeded when this document is first written. There is no earlier Draft version of it.

```json
{
    "_id": { "$oid": "000000000000000000000003" },
    "cphNumber": "00/000/0001",
    "lifecycleStatus": "Active",
    "source": {
        "rawSubmissionId": { "$oid": "000000000000000000000004" },
        "receivedAt": { "$date": "2026-10-27T10:00:01.000Z" },
        "applicationReference": "EXAMPLE-002",
        "formId": "example-create-form",
        "formVersion": 2,
        "submittedAt": { "$date": "2026-10-27T10:00:00.000Z" }
    },
    "createdAt": { "$date": "2026-10-27T10:00:02.000Z" },
    "createdBy": {
        "identifier": "cph-service-backend",
        "name": "CPH Service Backend"
    },
    "modifiedAt": { "$date": "2026-10-27T10:00:02.000Z" },
    "modifiedBy": {
        "identifier": "cph-service-backend",
        "name": "CPH Service Backend"
    },
    "validationErrors": [],
    "livestockInformation": {
        "types": ["Cattle"],
        "expectedArrivalDate": { "year": 2026, "month": 11, "day": 10 },
        "landOwned": true,
        "locationEastingsAndNorthings": [
            { "easting": 400000, "northing": 300000 }
        ]
    },
    "startDate": "2026-10-27T10:00:02.000Z"
}
```

For an owner, `tenancyAgreementMoreThanOneYear` and `landownerHasCphNumber` are not required by validation. Whether they are absent or stored as `null` in that case has not been verified against a stored document.

### Manual Review (body validation failure)

When body validation fails, the record has no `livestockInformation` and is not allocated.

```json
{
    "_id": { "$oid": "000000000000000000000005" },
    "cphNumber": "",
    "lifecycleStatus": "Manual Review",
    "source": {
        "rawSubmissionId": { "$oid": "000000000000000000000006" },
        "receivedAt": { "$date": "2026-10-27T11:00:01.000Z" },
        "applicationReference": "EXAMPLE-003",
        "formId": "example-create-form",
        "formVersion": 2,
        "submittedAt": { "$date": "2026-10-27T11:00:00.000Z" }
    },
    "createdAt": { "$date": "2026-10-27T11:00:02.000Z" },
    "createdBy": {
        "identifier": "cph-service-backend",
        "name": "CPH Service Backend"
    },
    "modifiedAt": { "$date": "2026-10-27T11:00:02.000Z" },
    "modifiedBy": {
        "identifier": "cph-service-backend",
        "name": "CPH Service Backend"
    },
    "validationErrors": [
        {
            "timestamp": "2026-10-27T11:00:02.000Z",
            "failure": "\"data.main.vumpmr\" is required",
            "context": {}
        }
    ]
}
```

The `context` value is the Joi error context and varies by failure. Metadata and livestock values are illustrative. The livestock values remain subject to the agreed mapping and reference data.

## Proposed location structure

Proposal for review: embed a `locations` array within each CPH record. Each location may contain a `geometry` object holding easting and northing. This is not implemented. The implementation currently stores coordinates in `livestockInformation.locationEastingsAndNorthings` (see the baseline above).

This follows the LDM's one-or-more locations relationship and optional geometry relationship. Embedding is proposed so that a CPH and its locations can be retrieved together.

Illustrative proposed fragment:

```json
{
    "locations": [
        {
            "locationName": "Example holding",
            "primaryLocationIndicator": true,
            "geometry": {
                "easting": 400000,
                "northing": 300000
            }
        }
    ]
}
```

### Location fields and enrichment

| Proposed property | Proposed storage type | Notes |
| --- | --- | --- |
| `locations` | Array of embedded objects | Represents the holding's locations |
| `locations[].locationName` | String | Optional location name |
| `locations[].primaryLocationIndicator` | Boolean | Optional primary location indicator |
| `locations[].geometry` | Embedded object | Optional coordinate information |
| `locations[].geometry.easting` | Number | Numeric easting |
| `locations[].geometry.northing` | Number | Numeric northing |
| `locations[].county` | String | Illustrative representation pending agreement on names, codes or both |
| `locations[].parish` | String | Illustrative representation pending agreement on names, codes or both |

County and parish are required in the LDM. They are omitted from the fragment above pending derivation. The implementation looks them up during allocation but does not store them.

An absent county or parish indicates that the value has yet to be established. The service needs to distinguish this from a completed lookup that returned no match.

The proposed storage representation differs from the XSD's string representation of coordinates. Conversion and coordinate validation need to be documented alongside the agreed mapping.

### Open location decisions

- Confirm the coordinate reference system and its stored representation. The implementation converts the submitted values from OSGB36 to WGS84 for the parish lookup (`parishLookup.js`), but stores the submitted numbers unchanged.
- Confirm whether county and parish values are names, codes or both.
- Confirm whether embedded locations need stable identifiers for updates.
- Confirm when location completeness is required during processing.
- Confirm the representation of a lookup that fails or returns multiple matches. The implementation fails the lookup if no parish is found and uses the first match if several are returned.
- Review embedding against the expected queries and update patterns.
- Confirm the location address and tenancy fields needed for CPH records.

## Proposed party and role structure

Embed a `parties` array within each CPH record. Each party has a `partyType` and a `roles` array.

The example combines the LDM's Party and CPH Party In Role concepts into one embedded structure. A party can hold several roles without duplicating its details within the CPH record.

Role labels follow the supplied LDM. Stored values remain subject to agreement.

```JSON
{
    "parties": [
        {
        "partyType": "Person",
        "firstName": "Alex",
        "lastName": "Example",
        "roles": [
                "CPH Holder",
                "Primary Contact Person"
            ]
        }
    ]
}
```

This fragment represents a person. Organisation fields are considered below. Contacts, addresses and inherited party identifiers require further design.

Whether parties should be shared across CPH records through references remains an open decision.

### Person fields and LDM alignment

The supplied XSD defines Person as an extension of Party, which extends Identified Item. The proposed embedded structure flattens this inheritance and uses `partyType` with the value `Person`.

| XSD Person field | Proposed property | Proposed storage type | XSD occurrence |
| --- | --- | --- | --- |
| First Name | `firstName` | String | 1 |
| Last Name | `lastName` | String | 1 |
| Middle Name | `middleName` | String | 0..1 |
| Title | `title` | String | 0..1 |
| Alias Name | `aliasName` | String | 0..1 |
| Birth Date | `birthDate` | String (`YYYY-MM-DD`) | 0..1 |
| Death Date | `deathDate` | String (`YYYY-MM-DD`) | 0..1 |

These are candidate physical representations for review.

The XSD declares Alias Name as `xs:Name`. MongoDB string storage requires an explicit decision about any corresponding validation.

Date-only values are proposed as strings without a time component.

The current example includes `firstName` and `lastName` only. Inclusion of the other Person fields depends on agreed CPH requirements and CPH-115 mapping.

The XSD occurrence describes the logical model export.  Draft-stage completeness and the minimum information required for allocation remains to be confirmed.

Party contact relationships and inherited identifiers and audit information require separate consideration.

### Role representation and LDM alignment

The supplied XSD defines Party in Role with one `party` and one `partyRole`. CPH Party In Role extends it and adds one required `CPHPartyRole`.

`CPHPartyRole` uses the following values:

- CPH Holder
- Keeper
- Land Owner
- Primary Contact Person
- Secondary Contact Person

The proposed `roles` array stores CPH-specific role values against each embedded party, allowing several roles without repeating the party details.

This simplifies the exported structure.

Open question for Tagem: Is `CPHPartyRole` intended to specialise the inherited `partyRole`, or do these represent distinct values? If they have distinct meanings, the physical model needs to preserve both.

The inspected role-assignment definitions declare no assignment identifiers, dates or audit fields. Whether these are needed remains a requirements question. If assignments require their own properties, the proposed array of strings will need refinement.

### Organisation fields and LDM alignment

The supplied XSD defines Organisation as an extension of Party, which extends Identified Item. Like Person, the proposed embedded structure flattens this inheritance and uses `partyType` with the value `Organisation`.

| XSD Organisation field | Proposed property | Proposed storage type | XSD occurrence |
| --- | --- | --- | --- |
| Charity Number | `charityNumber` | String | 1 |
| Establishment Type | `establishmentType` | String | 0..1 |
| Organisation Dissolution Date | `dissolutionDate` | String (`YYYY-MM-DD`) | 0..1 |
| Organisation Incorporation Date | `incorporationDate` | String (`YYYY-MM-DD`) | 0..1 |
| Organisation Legal Name | `legalName` | String | 1 |
| Organisation Legal Status | `legalStatus` | String | 1 |
| Organisation Name | `organisationName` | String | 1 |
| Organisation URL | `url` | String | 0..1 |
| organisationType | `organisationType` | Object (embedded) | 1 |
| organisation Type Name, within Organisation Type | `organisationType.name` | String | 1 within each Organisation Type |

This example shows the proposed embedded `organisationType` object, with `organisationType.name` stored as a string.

```json
{
    "partyType": "Organisation",
    "charityNumber": "SC123456",
    "legalName": "Example Charity Ltd",
    "organisationName": "Example Charity",
    "legalStatus": "Registered Charity",
    "organisationType": {
        "name": "Charity"
    },
    "roles": ["CPH Holder"]
}
```

The names, legal status and organisation type in this example are synthetic values. Reference data remains subject to confirmation.

The following points distinguish XSD declarations from proposed storage decisions.

- The XSD specifies Organisation Name and Organisation URL, and Organisation Type Name, as `xs:Name`. The proposed MongoDB representation uses strings. Any corresponding constraints require explicit validation.
- Dissolution Date and Incorporation Date are declared as `xs:date`. The proposed MongoDB representation uses strings in `YYYY-MM-DD` format, consistent with the proposed Person date fields.
- Establishment Type is optional. The XSD documentation gives "Market, Showground or Zoo" as examples but declares no enumeration for the field.
- The Charity Number is required in the supplied XSD. Its applicability to CPH organisations requires confirmation.

The XSD declares `organisationType` as an element whose type is the Organisation Type complex type. That complex type contains one required Organisation Type Name field. Embedding it as an object with a `name` property is a physical design proposal.

Open questions for Tagem and requirements confirmation (Tagem):

- Should Charity Number be required only for registered charities, and at what stage should it be required?
- What is the semantic distinction between Organisation Legal Name and Organisation Name?
- Which Organisation fields are needed for Draft and allocated CPH records?
- Should Establishment Type use a controlled list of values?
- How will Organisation Type values be supplied and maintained?

## Allocated permanent CPH example

The XSD defines `Permanent CPH` as an extension of `County Parish Holding` with no additional fields. The base type allows `CPH Number` to be absent and requires `CPH Type` (`xs:string`, 1), `Start Date` (`xs:dateTime`, 1) and `CPHLifeCycleState` (1).

The implemented Active document is shown in the examples above. It stores `cphNumber` as a string, `lifecycleStatus` as `"Active"` and `startDate` as an ISO 8601 string. It does not store a CPH type, county, parish or a `locations` array.

The excerpt below is a proposal. It illustrates how the allocated record might look if the structures proposed in this document were adopted. It retains the source link and shows an issued CPH number, a proposed `cphType` and a proposed `locations` array with county and parish.

The example uses the following assumptions for review:

- `cphType` is a proposed property. The XSD requires a CPH Type, but the implementation does not store one. `"Permanent"` is an illustrative value. The XSD gives permanent, landless, temporary, TLA and 8000 series as examples.
- `locations` is proposed and is not implemented. The implementation stores `livestockInformation.locationEastingsAndNorthings`.
- County and parish are proposed strings containing illustrative names. The implementation does not store them.
- `"Active"` is the status the implementation sets on successful permanent allocation. The status for other allocation outcomes remains to be confirmed.
- `startDate` is shown as a proposed BSON Date, corresponding to the XSD's `xs:dateTime`. The implementation stores an ISO 8601 string. The business meaning and source of the value require agreement.
- `expectedArrivalDate` is shown as a proposed `YYYY-MM-DD` string, corresponding to the XSD's `xs:date`. The implementation stores a `{ year, month, day }` object.
- Coordinates are illustrative and have not been matched to the example county and parish.
- `_id` and audit fields are omitted from this excerpt.
```json
{
    "cphNumber": "00/000/0001",
    "cphType": "Permanent",
    "lifecycleStatus": "Active",
    "startDate": { "$date": "2026-10-29T09:00:00.000Z" },
    "source": {
        "rawSubmissionId": { "$oid": "000000000000000000000002" },
        "applicationReference": "EXAMPLE-001",
        "formId": "example-create-form",
        "formVersion": 2,
        "submittedAt": { "$date": "2026-10-27T09:00:00.000Z" },
        "receivedAt": { "$date": "2026-10-27T09:00:01.000Z" }
    },
    "locations": [
        {
            "locationName": "Example holding",
            "primaryLocationIndicator": true,
            "county": "Example County",
            "parish": "Example Parish",
            "geometry": {
                "easting": 400000,
                "northing": 300000
            }
        }
    ],
    "livestockInformation": {
        "types": ["Cattle"],
        "expectedArrivalDate": "2026-11-10"
    }
}
```

The CPH number is a placeholder. The example illustrates the proposed structure and requires review before implementation.

## Draft, enrichment and allocation

The middle column describes the implementation at commit `f2ef793`. The last column is a proposal or an open question.

| Field or structure | Implemented at record creation | Proposed later availability |
| --- | --- | --- |
| Source link and submission metadata | Stored when the record is first written | Retained for traceability |
| Livestock information | Selected answers stored when body validation passes | Extended as further mappings are agreed |
| Coordinates | Stored in `livestockInformation.locationEastingsAndNorthings` | Proposed `locations[].geometry` after agreed mapping |
| County and parish | Looked up during allocation and not stored | Proposed `locations[].county` and `locations[].parish` |
| Parties and roles | Not stored | Added through agreed mapping or review |
| CPH number | Empty string. Set before the first write if permanent allocation succeeds | Format and storage remain as implemented unless changed |
| CPH type | Not stored | Proposed `cphType`. Source and timing require agreement |
| Start date | Set to an ISO 8601 string on permanent allocation | Proposed BSON Date. Meaning, source and timing require agreement |
| Lifecycle status | `"Draft"`, `"Active"` or `"Manual Review"` | Statuses for other outcomes require agreement |
| Audit information | `createdAt`, `createdBy`, `modifiedAt` and `modifiedBy` set once, with `modified*` equal to `created*` | Maintenance after the first write requires agreement |

### Allocation decisions

- Confirm that single-document behaviour is intended: permanent allocation completes before the first write, and the implementation has no later update or second document.
- Confirm how a later allocation of a record that stayed `"Draft"` should be recorded, for example by updating the document or creating a separate one linked to it.
- Confirm the lifecycle status for non-permanent outcomes and whether `"Manual Review"` should map to the XSD's `"Under Review"`.
- Confirm the meaning and source of `startDate`.
- Confirm the minimum allocation and party information required for allocation.
- Confirm the representation of CPH type values.
- Confirm the mapping from the LDM's Defra Form Application ID to the stored source material under CPH-115. The implementation stores `source.applicationReference` and `source.rawSubmissionId`.
- Confirm whether allocation should be made idempotent before the upsert so a redelivered message cannot consume a further sequence number. The risk is a possibility that has not been verified.

## Identifier, traceability and audit arrangements

The inspected implementation uses MongoDB `_id` values to identify stored documents.

`source.rawSubmissionId` links a derived CPH record to the original submission in `raw-form-submissions`. It is the ObjectId `_id` of the raw document, which also holds a unique `referenceNumber`.

The raw submission retains the Forms payload as a JSON string and its question identifiers. The derived CPH representation uses meaningful domain property names.

The existing actor representation uses an embedded object containing `identifier` and `name`. The examples use the backend service as the actor.

The supplied XSD's Identified Item concept also includes identifiers, alternate identifiers and audit information. The physical representation of these inherited properties requires further agreement for embedded locations and parties.

Open decisions:

- Confirm how MongoDB document identifiers relate to the LDM's Identifier concept.
- Confirm how alternate or business identifiers should be represented.
- Confirm whether embedded parties and locations require their own stable identifiers.
- Confirm whether creation and modification fields provide sufficient audit information.
- Confirm the storage arrangement for audit history and business text.
- Confirm how audit fields should be maintained during allocation.

## Remaining design work and review

The following work is needed to complete the proposal against the proposed CPH-116 acceptance criteria.

- Define contact and postal address structures, including any validity dates required by the LDM.
- Reconcile the remaining holding and location fields with the supplied LDM.
- Confirm the representation of tenancy fields, related holdings and cases.
- Align proposed properties with the CPH-115 field mapping.
- Confirm Draft-stage and allocation-stage completeness.
- Confirm the proposed scope and outstanding decisions with Paul.
- Review the physical model and LDM differences with Tagem.

Validation results are implemented as the `validationErrors` array described in the baseline. Body validation failures and processing failures set `"Manual Review"`, while metadata failures do not change the status. The schema of the stored `context` values and the status used for business validation failures remain to be agreed.

## XSD source checks

The supplied export defines Actor with one Identifier and one Name at lines 13 and 18 in the inspected copy. The existing embedded actor structure represents these as `identifier` and `name`.

Identifier is referenced as a custom type. Copilot's static inspection reports no corresponding type definition. This remains an export question for confirmation. No XSD validator has been run.

The export informs this design. MongoDB storage types and requirements at each processing stage require explicit design and requirements decisions.
