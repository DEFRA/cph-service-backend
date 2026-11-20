# CPH physical data model

Status: Proposal for review under CPH-116.

This design covers Draft, Manual Review and allocated (Active) CPH records, subject to scope confirmation. It starts from the existing `cph-records` structure and the LDM dated 29 September 2026. The currency of that LDM remains to be confirmed.

Examples use synthetic data. Proposed fields and relationships remain subject to review and agreement.

## Purpose and scope

This document proposes a MongoDB physical data model to help developers implement the CPH Logical Data Model.

It covers:

- Example Draft, Manual Review and allocated CPH data.
- How applicant, party, contact, address and customer identifier details from the submitted form are represented across those states.
- Field names and storage types.
- Fields available after mapping, enrichment or allocation.
- Proposed embedding and reference arrangements.
- Identifiers, source traceability and audit information.
- Differences from the LDM and unresolved modelling questions.

The design needs to align with CPH-115, which records the mapping from DEFRA Forms answers to the CPH model.

Implementation of additional mappings, allocation logic and validation rules requires separate agreement. Business process (for example who may hold a CPH, or when an application is allocated or rejected) and detailed validation rules are outside this physical design.

Two kinds of content are kept apart throughout. **Inspected backend baseline** means what the service stores at commit `f2ef793`. **Proposed** means a design for review that the backend does not implement.

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

The XSD `CPH Status Type` lists `Draft`, `Active`, `Inactive`, `Under Review`, `Rejected` and `Archive`. The implementation does not set `Inactive`, `Rejected` or `Archive`. Open points:

- The solution architecture state transition diagram uses `Under Review`. Whether `"Manual Review"` maps to it is not decided.
- The solution architecture state transition diagram uses `Not Required` for `Archive`. The scope of `Archive` is not decided.

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

The inspected backend does not populate parties. No mapping, validation or allocation step creates a `parties` array, party roles, contacts or addresses, and `cph-records` documents contain none of them. The party structures later in this document are proposals only.

The current implementation stores `livestockInformation.expectedArrivalDate` as submitted, in an object with `year`, `month` and `day`fields. The proposed allocated CPH example shows it as a `YYYY-MM-DD` string.

Metadata validation failures are recorded in `validationErrors` but do not change `lifecycleStatus`. A record can therefore be `"Active"` with a non-empty `validationErrors` array, and `source.formId`, `source.formVersion` and `source.applicationReference` can hold `"Unknown"`.

Record insertion uses an upsert matched on `source.rawSubmissionId` with `$setOnInsert`. An existing matching record is retained when the insertion is retried. The inspected code defines no unique index on `source.rawSubmissionId`. Allocation runs before the upsert. If a message is redelivered, allocation could therefore consume a further `cph-sequences` number that is then discarded. This is a possibility inferred from the code order and has not been verified by running a redelivery.

This baseline reflects the code at commit `f2ef793`. It should be checked against the implementation when this proposal is reviewed.

## Document examples - inspected backend baseline

The three examples in this section are the **inspected backend baseline** and not the proposed design. None contains `parties`, `locations` or customer identifiers. Proposed Draft, Manual Review and Active examples are under Proposed Draft and Manual Review structures and Proposed allocated CPH structure.

Synthetic examples of the stored structure at commit `f2ef793`, using MongoDB Extended JSON to show ObjectId and BSON date types. `expectedArrivalDate` is shown as the `{ year, month, day }` object that the implementation stores.

### Baseline Draft (renter, not allocated)

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

### Baseline Active (permanent CPH allocated)

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

### Baseline Manual Review (body validation failure)

This example shows a body validation failure. In that case, and when the body cannot be parsed, mapping does not run, so the record has no `livestockInformation` and is not allocated. A record also becomes `"Manual Review"` when processing throws after mapping succeeded, for example a parish lookup failure. That record keeps its mapped `livestockInformation` and has a `validationErrors` entry for the failure. In every case the baseline record has no parties.

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
                "Primary Contact Person",
                "Land Owner"
            ]
        }
    ]
}
```

This fragment represents a person. Organisation fields are considered below. Contacts, addresses and inherited party identifiers require further design (see Party identifiers and customer linkage).

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

### Party identifiers and customer linkage

In the supplied XSD, `Party` extends `Identified Item` (lines 465 and 470), and `Person` and `Organisation` extend `Party` (lines 547 and 416). Every party therefore inherits the following from `Identified Item` (lines 348 to 386):

| XSD element | XSD type | Occurrence | Line |
| --- | --- | --- | --- |
| `Identifier` | `Identifier` | 1 | 368 |
| `Alternate Identifier` | `Identifier` | 0..unbounded | 353 |

`County Parish Holding` extends the same `Identified Item` (lines 91 and 96), so a CPH also has one `Identifier` and any number of `Alternate Identifier` values.

The documentation for `Identifier` (line 370) says it "consists of an Identify Type and Identifier Value" and that it is typically a system identifier but may hold business identifiers. The documentation for `Alternate Identifier` (line 355) says an entity can have more than one identifier in addition to the main one. It gives CRN, NI Number and Passport Number as examples of identifiers of a Person.

The XSD references `Identifier` as a type (lines 13, 353 and 368) but the inspected export contains no definition for it. The structure is therefore described in prose only. Its member names, types, occurrences and permitted identifier types are not established by the XSD.

Following Tagem's feedback, the proposed allocated CPH must identify its CPH Holder and retain the applicable customer identifiers that link that holder to RPA or SAM. The XSD supports this through the `CPHParty` element (line 126), the `CPH Holder` role (line 267) and the inherited `Alternate Identifier`. The backend as inspected at commit `f2ef793` does not store parties or customer identifiers, so it does not retain this linkage. This is an implementation gap against the proposed model.

The following is proposed and not agreed:

- `identifier` is an embedded object with string properties `type` and `value`.
- `alternateIdentifiers` is an array of objects with the same string properties.
- The choice of main `identifier` is a proposal. The example uses a placeholder value, and the XSD does not say whether it is a system or a business identifier.
- Not every holder is expected to have every customer identifier. Which apply to a given holder is a mapping question.

Mappings requiring confirmation:

| Identifier | What the XSD establishes | Confirmation needed |
| --- | --- | --- |
| CRN | Named in prose as an example Alternate Identifier of a Person (line 355). No element, type or enumeration. | Whether CRN applies to Organisation holders. The form captures CRN (`cMRAGl`) only after a yes/no question (`WHYPeQ`), see the form field mapping. |
| SBI | Not defined or mentioned. | Whether it is an Alternate Identifier, and whether it belongs to the holder, the Organisation or the CPH. The form captures it as `PTNfVG`. |
| SAM customer number | Not defined or mentioned. | Whether it is a separate identifier or the same value as CRN, and the identifier type label to use. |

The example allocated record below shows a synthetic CRN for Alex as an illustration of the proposed shape. SBI and SAM customer number are not assigned to Alex or to any Organisation, because there is no supporting evidence for doing so.

Contact details are also inherited through `Party`: `partyEmailAddress`, `partyPostalAddress` and `partyPhoneNumber`, each 0..unbounded (lines 472 to 474). The note in the `Person` documentation (line 544) that contact details are outside the Person entity refers to the Person type itself. `contacts` and `addresses` on an embedded party remain proposals.

Decision needed: `Identified Item` requires `Created By`, `Created Date`, `Modified By` and `Modified Date` (lines 358 to 378, each 1), and these apply to every party. The examples carry audit fields only on the CPH record. Confirm whether embedded parties need their own audit fields or whether the record-level fields are sufficient.

## Proposed Draft and Manual Review structures

This section is a proposal. The inspected backend does not populate the proposed party, contact, address or customer identifier fields. Some source, audit and livestock fields are already implemented (see the baseline). Tagem clarified that a Draft should hold all submitted-form information needed to create the CPH, including applicant and person details, applicable business details, party roles, contacts, addresses and customer identifiers. That information stays represented in the Active and Manual Review records, and Tagem accepts the party structure above as a starting point that can evolve.

### Applicant, CPH Holder and service audit actor

These are three different things and the model keeps them apart.

| Concept | Proposed representation | Notes |
| --- | --- | --- |
| Applicant | The person who completed the form. Proposed: a `parties` entry, identified by a record-local `partyKey` string and named by a top-level `applicantPartyKey` | `CPHPartyRole` has no applicant value, so `roles` cannot mark the applicant. The general `Party Role` documentation (line 509) lists Applicant in its taxonomy, but the `CPH Party Role` enumeration does not. Alternative for review: add an applicant value to the CPH role values. The form asks for the applicant's own name, contact details and identifiers |
| CPH Holder | The party whose `roles` contain `"CPH Holder"` | May be the applicant, a business, or another party. The model must not assume it is the applicant. Which submitted party is the holder is a mapping decision under CPH-115, and the role is only recorded once that mapping is agreed |
| Service audit actor | `createdBy` and `modifiedBy` (`{ identifier, name }`) | The examples use the backend service actor, as the baseline does. These audit fields do not identify the applicant or the CPH Holder, and are not `parties` entries |

Open: whether `partyKey` and `applicantPartyKey` are wanted, or the applicant should be represented another way.

### Shared party structure across lifecycle states

Draft, Manual Review and Active records use one embedded `parties` structure. The fields are the same in every state. Only completeness differs.

| Part of the structure | Proposed properties | Draft | Manual Review | Active |
| --- | --- | --- | --- | --- |
| Party identity | `partyKey`, `partyType`, Person fields, Organisation fields (see the field tables above) | Present for the parties mapped from the form | Present for whatever was parsed and mapped | Present, with the minimum needed for allocation still to be confirmed |
| Roles | `roles` array of strings | Present once the role mapping is agreed | As Draft | Present, including the `"CPH Holder"` party |
| Contacts | `contacts` | Present for mapped phone and email answers | As available | Present |
| Addresses | `addresses` | Present for mapped address answers | As available | Present |
| Customer identifiers | `identifier`, `alternateIdentifiers` | Present for mapped SBI and CRN answers | As available | Present for the holder, per the Party identifiers section |
| Applicant link | `partyKey` on each party and `applicantPartyKey` on the record | Present | Present if the applicant could be identified | Present |

The Active column is shown in the complete allocated example under Proposed allocated CPH structure. The Draft and Manual Review examples below use the same property names.

Contacts and addresses extend the starting structure with the XSD's `Party Postal Address` and the `Email Address` and `Phone Number` types (lines 472 to 474). Properties below are proposals:

| Proposed property | Storage type | XSD basis | Status |
| --- | --- | --- | --- |
| `contacts[].contactType` | String (`"Email"` or `"Telephone"` in the examples) | Separate `partyEmailAddress` and `partyPhoneNumber` elements | Open. Whether to keep one `contacts` array or split by type |
| `contacts[].value` | String | `Email Address URL`, `Telephone Number` | Open |
| `addresses[].addressType` | String | `Party Address Type` (required, `xs:string`, e.g. Home, Business, Correspondence) | Proposed. Values open |
| `addresses[].addressLine1`, `addressLine2`, `town`, `county`, `postcode` | String | `Postal Address` has `Street` (required), `Town / City`, `County`, `Postcode` and others. It has no address line elements | Property names follow the address shape in `scripts/sqs-messages/permanent-landowner.js`. Mapping `addressLine1`/`addressLine2` to `Street` is not confirmed. `Country` is required in the XSD and is not captured by the form answers inspected |
| Valid From and Valid To dates | Not represented | Required (1) on `Email Address` and `Phone Number` (lines 320 and 614). Not present on `Party Postal Address` | Open. Not proposed until the requirement is confirmed |
| Principal indicators | Not represented | Optional on `Email Address` and `Phone Number` | Open. Which phone or email is principal is not stated by the form |

### Form field trace for party information

The tables trace answer keys in [create-cph-form-field-mapping.md](./create-cph-form-field-mapping.md) (DEV definition, form version 2) to proposed physical fields. Rows say "Open" where the mapping is not confirmed. That inventory is not an approved mapping, and nothing here is implemented. Livestock, species and ear tag answers are outside this trace and follow the CPH-115 mapping.

| Form answer (key, page) | Proposed physical field | Status |
| --- | --- | --- |
| Applicant name: `TKsWbP`, `iyutEh`, `ByUqQW`, `GDYfTS` (`/whats-the-name-of-the-applicant`) and `QvSFQU`, `fGBFPv`, `BzFtpG`, `HEHgbQ` (`/whats-your-name`) | Applicant party `title`, `firstName`, `middleName`, `lastName` | Field alignment follows the Person table. The form does not state whether Title is a salutation or job title. Which page applies to which applicant type is not stated in the field inventory (the sample message script uses `/whats-your-name` for a hobbyist) |
| `FsSpLA` hobbyist keeper or business | Possibly `partyType` of the holder | Open |
| `JGLmzy` aged 18 or older | None proposed | Open |
| Business name `lWzdhw` | Organisation party `organisationName` | Open: Organisation Name versus Legal Name is undecided |
| Legal status `yHQAol`, `MfzkDz` | `legalStatus` | Open: value mapping |
| Charity number `ifygYY` (number field) | `charityNumber` (string) | Open: the form field is a number and the XSD requires a string, so leading zeros and conversion are undecided |
| Company number `nNNsgO` | None | Open: the XSD Organisation has no company number field |
| Business type `hCxIFa`, purpose `AoofuF`, `luoxoh`, collection centre, market, showground or zoo `VkbHQu` | `organisationType.name`, `establishmentType` | Open: which answer feeds which field is not confirmed |
| Phone numbers `aEFhyW`, `tmSOkR` | `contacts[]` with `contactType` `"Telephone"` | Which party owns the phone numbers is open. The question is asked of the applicant |
| Email `uZcVcc` | `contacts[]` with `contactType` `"Email"` | As above |
| Business address `SJmeaZ`, home address `hpmkrN`, same-address flag `LlcVhf` | `addresses[]` with `addressType` | Open: address type values, and which party owns each address |
| Livestock address `PXRMtw`, `BToHwu`, `RdCZhq` | A location address | Open. The XSD has `CPHLocationPostalAddress` (line 237). See Open location decisions |
| Easting and northing `UOmNur` | `locations[].geometry` | As in the location section |
| Land owned `rOgnUv`, tenancy `qLmGSL`, landowner CPH `uuQMUp` | `livestockInformation` fields in the baseline. XSD location has Tenant Indicator and Tenancy Agreement One Year Indicator | Whether these also set the `"Land Owner"` role is open |
| Second contact `iszBCF`, `yQiBlu`, `vCcTAU`, `MtBoTP`, `QZNQVn`, `JdIhbf`, `RHkcga`, `JiLYDB`, `YnSTrb` | A party with role `"Secondary Contact Person"` | Open. The role exists in the XSD. The mapping is not confirmed |
| Species keeper details, for example `XBhudw`, `izZaaM`, `HjoTVk`, `daTXkI`, `FzYNoF` (cattle) | A party with role `"Keeper"`, or the applicant when the same-as answer is yes | Open. The form gives one "First and last name" field, so splitting into `firstName` and `lastName` is not safe and is not assumed |
| SBI `PTNfVG` | `alternateIdentifiers[]` | Open: the type label, and whether it belongs to the applicant, the Organisation or the CPH |
| CRN `WHYPeQ`, `cMRAGl` | `alternateIdentifiers[]` with type `"CRN"` | Open: which party it belongs to. `cMRAGl` exists only when `WHYPeQ` is yes |
| RPA registration `zcjEtV` | None proposed | Open |
| Memorable date, event and town `TTQnaU`, `JEmnQb`, `DUrooj` | None proposed | Open: these look like account security answers. Whether any is needed is not confirmed |

There is no SAM customer number question in the inspected form, so the model does not assign one from the form. The SAM mapping remains open (see Party identifiers and customer linkage).

### Proposed Draft example

A renter whose landowner has a CPH number, matching the baseline Draft. Here the applicant (Sam Applicant) and the CPH Holder (the Organisation) are different parties. The example illustrates the shape only. That the business is the holder, and that the CRN and SBI belong to these parties, are not confirmed (see the trace above). `cphNumber` is empty, there is no `startDate`, and county and parish are absent because allocation has not looked them up. All values are synthetic.

```json
{
    "_id": { "$oid": "000000000000000000000011" },
    "cphNumber": "",
    "lifecycleStatus": "Draft",
    "source": {
        "rawSubmissionId": { "$oid": "000000000000000000000012" },
        "applicationReference": "EXAMPLE-004",
        "formId": "example-create-form",
        "formVersion": 2,
        "submittedAt": { "$date": "2026-10-27T09:30:00.000Z" },
        "receivedAt": { "$date": "2026-10-27T09:30:01.000Z" }
    },
    "livestockInformation": {
        "types": ["Cattle"],
        "expectedArrivalDate": "2026-11-10",
        "landOwned": false,
        "tenancyAgreementMoreThanOneYear": true,
        "landownerHasCphNumber": true
    },
    "locations": [
        {
            "geometry": {
                "easting": 400000,
                "northing": 300000
            }
        }
    ],
    "applicantPartyKey": "party-1",
    "parties": [
        {
            "partyKey": "party-1",
            "partyType": "Person",
            "firstName": "Sam",
            "lastName": "Applicant",
            "roles": [],
            "alternateIdentifiers": [
                { "type": "CRN", "value": "1100000002" }
            ],
            "contacts": [
                { "contactType": "Email", "value": "sam.applicant@example.invalid" },
                { "contactType": "Telephone", "value": "01000 000001" }
            ],
            "addresses": [
                {
                    "addressType": "Home",
                    "addressLine1": "2 Example Lane",
                    "town": "Exampleton",
                    "postcode": "AB1 2CD"
                }
            ]
        },
        {
            "partyKey": "party-2",
            "partyType": "Organisation",
            "organisationName": "Example Farms",
            "legalStatus": "Limited company",
            "roles": ["CPH Holder"],
            "alternateIdentifiers": [
                { "type": "SBI", "value": "100000001" }
            ],
            "addresses": [
                {
                    "addressType": "Business",
                    "addressLine1": "3 Example Road",
                    "town": "Exampleton",
                    "postcode": "AB1 2CE"
                }
            ]
        }
    ],
    "validationErrors": [],
    "createdAt": { "$date": "2026-10-27T09:30:02.000Z" },
    "createdBy": { "identifier": "example-service", "name": "Example backend service" },
    "modifiedAt": { "$date": "2026-10-27T09:30:02.000Z" },
    "modifiedBy": { "identifier": "example-service", "name": "Example backend service" }
}
```

Notes on this example:

- `roles` is an empty array for the applicant, who holds no CPH role in this example. An applicant who is also the holder would have `["CPH Holder"]` on the same party that `applicantPartyKey` names.
- The `identifier` property is omitted because the main identifier remains open (see Party identifiers and customer linkage).
- `legalStatus` and `organisationName` values are synthetic. The Organisation required fields in the XSD (`charityNumber`, `legalName`, `organisationType`) are not shown. Draft-stage completeness is open.
- `livestockInformation` uses the proposed `YYYY-MM-DD` string for `expectedArrivalDate` and `locations` carries the coordinates, as in the allocated example. The baseline stores neither shape.
- The retained Draft stays linked to the raw submission through `source.rawSubmissionId`.

### Manual Review when mapping or parsing is incomplete

In the baseline, a Manual Review record has no parties. It has no `livestockInformation` when body validation or parsing prevented mapping, and keeps it when processing failed after successful mapping. The proposal is:

- Keep the original submission linked through `source.rawSubmissionId`. The raw `body` remains the complete record of what was submitted.
- Populate the shared structure only with values that were parsed and mapped. Leave out party properties that could not be mapped. Do not infer or generate values such as `firstName`, `lastName` or roles.
- A submitted answer with no agreed mapping, or that could not be parsed (for example the single "First and last name" keeper field), is not copied into a party. It remains available in the linked raw submission. No party entry is created only to hold such an answer.
- Record the reason in `validationErrors` as in the baseline.
- If parsing fails entirely, the record keeps only source, audit and error information, as in the baseline.

Illustrative proposal. Only the applicant was mapped, so only that party is stored. Other answers, such as the keeper's single-field name, stay in the raw submission. Values are synthetic.

```json
{
    "_id": { "$oid": "000000000000000000000013" },
    "cphNumber": "",
    "lifecycleStatus": "Manual Review",
    "source": {
        "rawSubmissionId": { "$oid": "000000000000000000000014" },
        "applicationReference": "EXAMPLE-005",
        "formId": "example-create-form",
        "formVersion": 2,
        "submittedAt": { "$date": "2026-10-27T11:30:00.000Z" },
        "receivedAt": { "$date": "2026-10-27T11:30:01.000Z" }
    },
    "applicantPartyKey": "party-1",
    "parties": [
        {
            "partyKey": "party-1",
            "partyType": "Person",
            "firstName": "Sam",
            "lastName": "Applicant",
            "roles": [],
            "contacts": [
                { "contactType": "Email", "value": "sam.applicant@example.invalid" }
            ]
        }
    ],
    "validationErrors": [
        {
            "timestamp": "2026-10-27T11:30:02.000Z",
            "failure": "\"data.main.vumpmr\" is required",
            "context": {}
        }
    ],
    "createdAt": { "$date": "2026-10-27T11:30:02.000Z" },
    "createdBy": { "identifier": "example-service", "name": "Example backend service" },
    "modifiedAt": { "$date": "2026-10-27T11:30:02.000Z" },
    "modifiedBy": { "identifier": "example-service", "name": "Example backend service" }
}
```

### Active

The complete proposed Active example is under Proposed allocated CPH structure. It uses the same `parties` property names. It shows a Person who holds several roles and is both the applicant and the CPH Holder in that scenario.

Open decisions for these structures:

- Confirm `partyKey` and `applicantPartyKey`, or replace them.
- Confirm the draft test fixture in `src/test/fixtures/draft-cph.example.json`, which uses nested `name` and `contact` objects, is superseded by the flat party properties and `contacts` and `addresses` arrays proposed here, or the other way round.
- Confirm the minimum party information for Draft, Manual Review and allocation.
- Confirm the party ownership of each contact, address and identifier in the trace above.

## Proposed allocated CPH structure

The XSD defines `Permanent CPH` as an extension of `County Parish Holding` with no additional fields. The base type allows `CPH Number` to be absent and requires `CPH Type` (`xs:string`, 1), `Start Date` (`xs:dateTime`, 1) and `CPHLifeCycleState` (1).

The implemented Active document is shown in the examples above. It stores `cphNumber` as a string, `lifecycleStatus` as `"Active"` and `startDate` as an ISO 8601 string. It does not store a CPH type, county, parish or a `locations` array.

The example below is a proposal. It illustrates how an allocated record might look if the structures proposed in this document were adopted. All values are synthetic.

Assumptions for review:

- `cphType` is a proposed property. The XSD requires a CPH Type, but the implementation does not store one. `"Permanent"` is an illustrative value.
- `locations` is proposed and not implemented. The implementation stores `livestockInformation.locationEastingsAndNorthings`. County and parish are illustrative strings and are not stored by the implementation. Coordinates have not been matched to them.
- `"Active"` is the status set on successful permanent allocation. `startDate` is shown as a BSON Date corresponding to the XSD's `xs:dateTime`. The implementation stores an ISO 8601 string.
- `expectedArrivalDate` is shown as a `YYYY-MM-DD` string corresponding to the XSD's `xs:date`. The implementation stores a `{ year, month, day }` object.
- This synthetic example is a scenario in which the applicant is also the CPH Holder: `applicantPartyKey` references Alex's `partyKey`, and Alex has the `"CPH Holder"` role. That is an assumption of this scenario and not a general rule. The Draft example above shows an applicant who is not the holder.
- `parties` uses the proposed Person and Organisation fields and the proposed `roles` array of strings. The parties array shows one Person with multiple roles. Each role is represented as a string.
- The party identified by the `"CPH Holder"` role is the holder to which the CPH is allocated. `identifier` and `alternateIdentifiers` on it are proposed property names. The choice of main identifier is a proposal. The CRN is synthetic. SBI and SAM customer number are not shown (see Party identifiers and customer linkage).
- `partyRole` and `CPHPartyRole` remain an open question (see Role representation and LDM alignment). The `roles` array does not settle it.
- `contacts` and `addresses` within a party are assumptions. Their property names, types and whether they are embedded are not agreed. Contact and address design is outstanding (see Remaining design work).
- Audit fields follow the existing `createdAt`, `createdBy`, `modifiedAt` and `modifiedBy` types. After allocation, `modifiedAt` and `modifiedBy` equal the `created*` values, as the implementation has no later update path.
- `startDate` is shown as a proposed BSON Date, corresponding to the XSD's `xs:dateTime`. The implementation stores an ISO 8601 string. The business meaning and source of the value require agreement. Confirm whether `startDate` represents the allocation timestamp or the date holding becomes effective.

```json
{
    "_id": { "$oid": "000000000000000000000001" },
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
    "livestockInformation": {
        "types": ["Cattle"],
        "expectedArrivalDate": "2026-11-10",
        "landOwned": true
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
    "applicantPartyKey": "party-1",
    "parties": [
        {
            "partyKey": "party-1",
            "partyType": "Person",
            "firstName": "Alex",
            "lastName": "Example",
            "birthDate": "1980-01-01",
            "identifier": { "type": "Party ID", "value": "EXAMPLE-PARTY-0001" },
            "alternateIdentifiers": [
                { "type": "CRN", "value": "1100000001" }
            ],
            "roles": ["CPH Holder", "Primary Contact Person", "Land Owner"],
            "contacts": [
                { "contactType": "Email", "value": "alex.example@example.invalid" },
                { "contactType": "Telephone", "value": "01000 000000" }
            ],
            "addresses": [
                {
                    "addressLine1": "1 Example Lane",
                    "town": "Exampleton",
                    "postcode": "AB1 2CD"
                }
            ]
        }
    ],
    "validationErrors": [],
    "createdAt": { "$date": "2026-10-27T09:00:02.000Z" },
    "createdBy": { "identifier": "example-service", "name": "Example backend service" },
    "modifiedAt": { "$date": "2026-10-27T09:00:02.000Z" },
    "modifiedBy": { "identifier": "example-service", "name": "Example backend service" }
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
| Parties, roles, contacts, addresses and customer identifiers | Not stored | Proposed in Draft, Manual Review and Active records through agreed mapping (see Proposed Draft and Manual Review structures) |
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
- Confirm the definition of the LDM `Identifier` type, which is missing from the inspected export.
- Confirm the mapping and identifier type labels for CRN, SBI and SAM customer number, and which apply to each kind of CPH Holder.
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
