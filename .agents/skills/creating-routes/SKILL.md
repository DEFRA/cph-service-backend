---
name: creating-routes
description: Use when adding or modifying a Hapi route, handler or API endpoint in this service (src/routes, src/handlers), including registering it and writing its unit test.
---

# Creating routes

## Structure

| Concern | Location | Example |
| --- | --- | --- |
| Route definitions (one array per resource) | `src/routes/<resource>.js` | `src/routes/cphs.js` exports `cphsRoutes` |
| Handlers (one file per operation) | `src/handlers/<resource>/<action>.js` | `src/handlers/cphs/find.js` exports `findCphs` |
| Data/business logic reused across handlers | `src/services/` | `src/services/cphRecords.js` |
| Route registration | `src/routes/index.js` | spreads each `*Routes` array into `routes` |
| Tests | `test/unit/handlers/<resource>/<action>.test.js` | `test/unit/handlers/cphs/find.test.js` |

`server.js` calls `server.route(routes)` once. Do not register routes anywhere else.

## Steps

1. **Handler**: create `src/handlers/<resource>/<action>.js` exporting a named async function `(request, h)`.
   - Name it verb-first in `lowerCamelCase` (`findCphs`, `createCph`, `deleteCphs`).
   - Use `request.db` for MongoDB (attached by the `mongodb` plugin) and `request.logger` for logging.
   - Return a plain object for 200 responses. Use `h.response().code(201).header('Location', ...)` for creates.
   - Wrap the body in `try/catch`: log with `request.logger.error(err, 'message')`, then `throw Boom.internal('message', err)`. Import `Boom` from `@hapi/boom`.
   - Keep collection names as a top-level constant (`const CPH_COLLECTION = 'cphs'`). Collection names are `kebab-case`.
2. **Route**: add an entry to the resource's array in `src/routes/<resource>.js`, or create a new file exporting `<resource>Routes`.

   ```js
   export const exampleRoutes = [
     { method: 'GET', path: '/api/examples', handler: findExamples }
   ]
   ```

   - Paths are lowercase and `kebab-case`. API routes live under `/api/`. Health is `/health`.
   - Trailing slashes are stripped by the router, so do not define them.
3. **Register**: for a new routes file, import it in `src/routes/index.js` and add it to the `routes` array. Without this the route is never served.
4. **Validation**: for payloads, path params or query params, add `options.validate` (Joi) to the route.
   - Use `validate.payload`, `validate.params` and `validate.query` for each respective input.
   - Query params arrive as strings. Joi converts them to the declared type (for example `Joi.number().integer().min(1)`), and the validated values are available on `request.query`.
   - Hapi rejects unknown query keys by default, so declare every accepted key and mark optional ones with `.optional()` or a `.default()`.

   ```js
   {
     method: 'PUT',
     path: '/api/examples/{id}',
     handler: updateExample,
     options: {
       validate: {
         params: Joi.object({
           id: Joi.string().hex().length(24).required()
         }),
         payload: Joi.object({
           name: Joi.string().trim().max(100).required(),
           active: Joi.boolean().default(true)
         }),
         query: Joi.object({
           page: Joi.number().integer().min(1).default(1),
           pageSize: Joi.number().integer().min(1).max(100).default(20),
           name: Joi.string().trim().max(100).optional()
         })
       }
     }
   }
   ```

   - Failures are handled by the global `failAction` in `src/server.js`, which logs and returns `Boom.badRequest`. Do not override it per route.
   - `abortEarly: false` is already set globally.
   - Small schemas can live inline in the route definition.
   - Larger schemas live in `src/schemas/`.
5. **Test**: add a Vitest test mirroring the handler path with a `.test.js` suffix (see below).
6. **Verify**: run `npm test` and `npm run lint`.

## Testing a handler

Call the handler directly with a stubbed `request` and `h`. No server is needed.

```js
import { describe, expect, test } from 'vitest'
import { findCphs } from '../../../src/handlers/cphs/find.js'

describe('findCphs', () => {
  test('returns the array of CPH values from the database', async () => {
    const request = {
      db: { collection: () => ({ find: () => ({ toArray: async () => [{ cph: 'CPH-1' }] }) }) },
      logger: { info: () => {}, error: () => {} }
    }

    expect(await findCphs(request, {})).toEqual({ cphs: ['CPH-1'] })
  })
})
```

- Cover the success path and the failure path (assert it rejects with a Boom 500).
- Stub only what the handler uses (`db`, `logger`, `payload`, `params`).

## Conventions

- ES modules with named exports. Relative imports include the `.js` extension (the `#/` alias maps to `src/`).
- Standard style, no semicolons, space before function parentheses (`async function findCphs (request, h)`).
- Files are `kebab-case`. Some existing files use `camelCase` (for example `rawFormSubmissions.js`), so follow `docs/NAMING-CONVENTIONS.md` for new files.
- See `docs/STYLEGUIDE.md` and `docs/NAMING-CONVENTIONS.md` for the full rules.

## Checklist

- [ ] Handler exported by name, verb-first, with try/catch and Boom error
- [ ] Route path is kebab-case under `/api/`
- [ ] Route array imported and spread in `src/routes/index.js`
- [ ] Joi validation added if the route takes input
- [ ] Test added under `test/unit/handlers/...` covering success and failure
- [ ] `npm test` and `npm run lint` pass
