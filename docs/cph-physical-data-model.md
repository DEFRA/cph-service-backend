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

Whether parties should be shared across CPH records thought references remains an open decision.

## XSD source checks

The supplied export defines Actor with one Identifier and one Name (lines 13 and 18). The existing embedded actor structure represents these as identifier and name.

Identifier is referenced as a custom type. Copilot's static inspection reports no corresponding type defintion; this remains an export question for confirmation. No XSD validator has been run.

The export informs this design but does not determine MongoDB storage types or Draft-stage validation requirements.