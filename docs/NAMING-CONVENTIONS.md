# Naming conventions

This guide defines the naming rules for the codebase so that files, functions, configuration, routes and persisted data read consistently. The aim is to keep the service easy to scan and predictable for future contributors.

These conventions should be used alongside the project style guide in [docs/STYLEGUIDE.md](STYLEGUIDE.md).

## 1. General principles

- Prefer clarity over cleverness.
- Prefer domain meaning over abbreviation unless the abbreviation is already standard in the project or the external system.
- Use names that explain intent and responsibility.
- Use consistent casing rules across similar constructs.
- Keep names short when they are common, but do not sacrifice meaning.

## 2. JavaScript and Node files

Use kebab case for JavaScript module files unless the file is a special-case external identifier.

Examples:

```text
src/services/rawFormSubmissions.js
src/helpers/mongo-lock.js
src/helpers/convict/validate-mongo-uri.js
```

Rules:

- Use `kebab-case` for file names
- Avoid `PascalCase` for regular module files; reserve it for classes only if introduced later.
- Keep file names action- or domain-oriented, not generic names like `utilsjs` or `helpers.js` unless they are clearly the single home for one narrow concern.

## 3. Variables, parameters and functions

Use `lowerCamelCase` for variables, function names, methods and parameters.

Examples:

```js
const collectionName = 'raw-form-submissions'

export function insertRawFormSubmission (db, body) {
  const referenceNumber = submission?.meta?.referenceNumber
  return db.collection(collectionName).updateOne(...)
}
```

Rules:

- Functions should be verb-based or verb phrase-based when they perform work, for example `insertRawFormSubmission`, `validateMongoUri`, `createServer`.
- Data values should be noun-based, for example `referenceNumber`, `formId`, `receivedAt`.
- Boolean variables should read like a statement, for example `isValid`, `hasPermission`, `canSubmit`.
- Do not use single-letter names except for very short loop counters or obvious conventional cases.
- Prefer descriptive names over abbreviations such as `cnt`, `obj`, `tmp`, `data` unless the meaning is extremely clear from context.

## 4. Constants and configuration values

Use `UPPER_SNAKE_CASE` for constants and configuration keys that represent fixed values or environment-driven settings.

Examples:

```js
const DEFAULT_TIMEOUT_MS = 5000
const MONGO_URI = process.env.MONGO_URI
```

Rules:

- Use `UPPER_SNAKE_CASE` for clearly constant values, especially config or environment settings.
- Use this convention for fixed values that are not expected to change at runtime.
- Keep names explicit; avoid vague single-word constants such as `PORT` unless the meaning is obvious.

## 5. Route, plugin and service names

Use names that describe the domain area or behaviour of the module, not the implementation detail.

Examples:

```text
src/routes/health.js
src/routes/api/cphs.js
src/services/rawFormSubmissions.js
src/plugins/mongodb.js
src/plugins/sqs-consumer.js
```

Rules:

- Route modules should describe the route or resource they handle, for example `health`, `cphs`.
- Service modules should describe the business or data responsibility, for example `rawFormSubmissions` or `cphData`.
- Plugin files should be named after the system or concern they integrate with, for example `mongodb`, `sqs-consumer`.
- Name the exported values after the responsibility, not the framework or lifecycle hook.

## 6. URLs and API paths

Use lowercase, hyphen-separated path segments for user-facing URLs and API routes.

Examples:

```text
/health
/cphs
```

Rules:

- Prefer `kebab-case` for URL path segments.
- Keep route names stable and consistent with the domain language.
- Avoid camelCase or PascalCase in URL paths.

## 7. Database and external system identifiers

Use kebab-case for collection names and similar persisted identifiers where the value is consumed by external systems or tools.

Examples:

```js
const collectionName = 'raw-form-submissions'
```

Rules:

- MongoDB collection names should follow `kebab-case` and be descriptive.
- Keep identifiers consistent with system or domain vocabulary rather than implementation details.
- Use a single canonical name for the same concept across code and configuration.

## 8. Tests

Test files should mirror the module they cover and use the same naming idea with a `.test.js` suffix.

Examples:

```text
test/plugins/mongodb.test.js
test/helpers/convict/validate-mongo-uri.test.js
test/handlers/rawFormSubmissions.test.js
```

Rules:

- Use the same base name as the unit under test.
- Append `.test.js` to the source module name.
- Prefer names that describe behaviour, not implementation details.

## 9. Practical examples from this project

The project currently shows the following patterns:

- Files such as `rawFormSubmissions.js` and `validate-mongo-uri.js` use lower camel case or hyphen-separated module names depending on the concern.
- Collection names such as `raw-form-submissions` use kebab case because they are persisted identifiers.
- Folders such as `src/services`, `src/routes/api`, and `src/plugins/options` use lowercase names and group logic by responsibility.

The rule to follow is:

- Use `lowerCamelCase` for JS symbols and most module files.
- Use `kebab-case` for external-facing or persisted identifiers.
- Use `UPPER_SNAKE_CASE` for stabilised constants.
- Keep names domain-driven and readable.

## 10. Decision checklist

When naming a new item, ask:

1. Is this a JavaScript symbol or module? Use `lowerCamelCase`.
2. Is it a config constant or environment value? Use `UPPER_SNAKE_CASE`.
3. Is it a URL path, external identifier or Mongo collection? Use `kebab-case`.
4. Does the name describe the responsibility clearly? If not, revise it.
5. Does the name match the project’s existing pattern? If not, document the exception and keep it intentional.

This keeps naming predictable and reduces the mental overhead of reading the codebase.
