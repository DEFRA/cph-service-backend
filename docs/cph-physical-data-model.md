# CPH physical data model

Status: Proposal for review under CPH-116.

This design covers Draft and allocated CPH records, subject to scope confirmation. It starts frm the existing cph-records structure and the LDM dated 29 September 2026; its currency remains to be confirmed.

Examples use synthetic data. Proposed fields and relationships are not implemented or approved unless explicitly stated.

## Existing implementation baseline

The cph-records collection currently stores:

- _id: MongoDB ObjectId.
- lifecycleStatus: "Draft".
- source: rawSubmissionId, applicationReference, formId, formVersion, submittedAt and receivedAt.
- livestockInformation: types and expectedArrivalDate, when supplied.
- createdAt, createdBy, modifiedAt and modifiedB.

rawSubmissionId links to the original document in raw-form-submissions, Submission, receipt and audit timestamps are stored as BSON dates. Expected arrival date is a yyyy-mm-dd string.

Draft insertion uses an upsert matched on source.rawSubmissionId with $setOnInsert, leaving an existing matching record unchanged.

This baseline reflects the code inspected for CPH-116.
Additional structures below are proposals for review.

## Draft document example - existing structure

Synthetic example of the current stored structure, using mongoDB Extended JSON to show ObjectId and BSON date types.

```json
{
    "_id": { "$oid": "000000000000000000000001" },
    "lifecycleStatus": "Draft",
    "source": {
        "rawSubmissionId": { "$oid": "000000000000000000000002" },
        "applicationReference": "EXAMPLE-001",
        "formId": "example-create-form",
        "formVersion": 2,
        "submittedAt": { "$date": "2026-10s-27T09:00:00:000Z" },
        "receivedAt": { "$date": "2026-10-27T09:00:01:000Z" }
    },
    "livestockInformation": {
        "types": ["Cattle"],
        "expectedArrivalDate": "2026-11-10"
    },
    "createdAt": { "$date": "2026-10-27T09:00:02:000Z" },
    "createdBy": {
        "identifier": "cph-service-backend",
        "name": "CPH Service Backend"
    },
    "modifiedAt": { "$date": "2026-10-27T09:00:00:000Z" },
    "modifiedBy": {
        "identifier": "cph-service-backend",
        "name": "CPH Service Backend"
    }
}
```
Example metadata and livestock values are illustrative, not a verified Forms payload or an approvaed list of livestock values.

## Proposed location structure

Proposal for review: embed a locations array within each CPH record. Each location may contain a geometry object holding easting and northing.

This follows the LDM's one-or-more locations relationship and optional geometry relationship. Embedding is proposed so that a CPH and its locations can be retreived together.

Illustrative fragment, not yet implmented:

{
    "locations": [
        "locationName": "Example holding",
        "primaryLocationIndicator": true,
        "geometry": {
            "easting": 400000,
            "northing": 300000
        }
    ]
}

### Location fields and enrichment

- locations is an array of embedded location documents.
- locationName is an optional string.
- primaryLocationIndicator is an optional boolean.
- geometry is an optional embedded object. When present, it contains numeric eastings and northing values.
- County and parish are required in the LDM but are omitted from this Draft example pending derivation. Their absence must not be confused with an empty string or successful lookup.

### Open location decisions

- Confirm the coordinate reference system and its stored representation.
- Confirm whether county and parish values are names, codes or both.
- Confirm whether embedded locations need stable identifiers for updates.
- Confirm when location completeness is required during processing.
- Review embedding against the expected queries and update patterns.

## Proposed party and role structure

Proposal for review: embed a parties array within each CPH record.
Each party has a partyType and a roles array.

The example combines the LDM's Party and CPH Party in Role concepts into one embedded structure. A party can hold several roles without duplicating its details within the CPH record.

Illustrative fragment, not yet implemented. Role labels follow the LDM; stored values remain subject to agreement.

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

This example represents a person only. Organisation details, contacts, addresses and party identifiers will be considered next.

Whether parties should be shared across CPH records through references remains an open decision.

### Person fields and LDM alignment

The supplied XSD defines Person as an extension of Party, which extends Identified Item. The proposed embedded structure flattens this inheritance.

| XSD Person field | Proposed property | Storage type | XSD occurrence |
| --- | --- | --- | --- |
| First Name | firstName | String | 1 |
| Last Name | lastName | String | 1 |
| Middle Name | middleName | String | 0..1 |
| Title | title | String | 0..1 |
| Alias Name | aliasName | String | 0..1 |
| Birth Date | birthDate | String (YYYY-MM-DD) | 0..1 |
| Death Date | deathDate | String (YYYY-MM-DD) | 0..1 |

These are candidate physical representations for review. The aliasName proposal uses a MongoDB string rather than carrying over the xs:Name constraint. Date-only values are proposed as strings without a time component.

The current example includes firstName and lastName only. Inclusion of the other Person fields depends on agreed CPH requirements and CPH-115 mapping.

XSD occurrence describes the logical model export; it does not establish Draft-stage completeness or the minimum information required for allocation. Those requirements remain to be confirmed.

Party contact relationships and inherited identifiers and audit information are considered separately. The roles array combines the LDM's separate party-role assignments; whether assignments need their own identifiers, dates or other properties remains an open decision.

### Role representation and LDM alignment

The supplied XSD defines Party in Role with one party and one partyRole. CPH Party In Role extends it and adds one required CPHPartyRole.

CPHPartyRole uses the following values:

- CPH Holder
- Keeper
- Land Owner
- Primary Contact Person
- Secondary Contact Person

The proposed roles array stores CPH-specific role values against each embedded party, allowing several roles without repeating the party details.

This simplifies the exported structure. Open question for Tagem: Is CPHPartyRole intended to specialise the inherited partyRole, or do these represent distinct values? If they have distinct meanings, the physical model needs to preserve both.

The inspected role-assignment definitions declare no assignment identifiers, dates or audit fields. Whether these are needed remains a requirements question.

### Organisation fields and LDM alignment

The supplied XSD defines Organisation as an extension of Party, which extends Identified Item. Like Person, the proposed embedded structure flattens this inheritance and sets partyType to "Organisation".

| XSD Organisation field | Proposed property | Storage type | XSD occurrence |
| --- | --- | --- | --- |
| Charity Number | charityNumber | String | 1 |
| Establishment Type | establishmentType | String | 0..1 |
| Organisation Dissolution Date | dissolutionDate | String (YYYY-MM-DD) | 0..1 |
| Organisation Incorporation Date | incorporationDate | String (YYYY-MM-DD) | 0..1 |
| Organisation Legal Name | legalName | String | 1 |
| Organisation Legal Status | legalStatus | String | 1 |
| Organisation Name | organisationName | String | 1 |
| Organisation URL | url | String | 0..1 |
| organisationType | organisationType | Object (embedded) | 1 |

This example shows the proposed embedded organisationType object, with organisationType.name stored as a string.

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

**XSD facts vs. proposed storage decisions:**

- The XSD specifies Organisation Name and Organisation URL, and Organisation Type Name, as xs:Name type (XML name constraints). The proposed MongoDB storage uses String instead, as xs:Name constraints are not automatically carried over to MongoDB strings and validation would require explicit application logic.
- Dissolution Date and Incorporation Date are declared in the XSD as xs:date. The proposed MongoDB representation uses strings in YYYY-MM-DD format to maintain consistency with Person date fields and to avoid time-zone complications.
- Establishment Type is documented in the XSD as optional; examples given are "Market, Showground or Zoo", but no enumeration is defined, making the valid values open-ended pending reference data confirmation.
- The Charity Number is marked as required (minOccurs="1") in the XSD, though not all organisations are charities; this may need refinement depending on CPH use cases.

**OrganisationType element:** The XSD declares organisationType as an element whose type is the Organisation Type complex type. That complex type contains a single "Organisation Type Name" field (xs:Name). The proposed embedded MongoDB representation as an object with a name property is a design proposal; the XSD does not establish a database reference arrangement.

Open questions for requirements confirmation (Tagem):

XSD occurrence declares these fields as required (minOccurs="1"), but this does not establish whether they are mandatory at Draft or allocated stage:

- **Charity Number** – The XSD requires this field on Organisation. Should the CPH model require it only for registered charities, and at what stage should it be required?

- **Organisation Legal Name vs. Organisation Name** – The XSD defines both as required (minOccurs="1"). What is the semantic distinction between these two fields?

Other open questions:

- Which Organisation fields are needed for Draft and allocated CPH records, and which can be omitted during initial submission?
- Should Establishment Type be restricted to a controlled enumeration, or remain open-ended?
- Will Organisation Type values be provided by an external reference data system or hardcoded in the application?

## XSD source checks

The supplied export defines Actor with one Identifier and one Name (lines 13 and 18). The existing embedded actor structure represents these as identifier and name.

Identifier is referenced as a custom type. Copilot's static inspection reports no corresponding type defintion; this remains an export question for confirmation. No XSD validator has been run.

The export informs this design but does not determine MongoDB storage types or Draft-stage validation requirements.
