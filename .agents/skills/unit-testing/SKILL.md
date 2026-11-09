---
name: unit-testing
description: Use when writing or updating Vitest unit tests in this service (test/unit/**), including mocking modules, stubbing MongoDB/logger/SQS dependencies and covering every code path.
---

# Unit testing with Vitest

## Setup facts

- Runner: Vitest (`npm test` runs `TZ=UTC vitest run --coverage`; `npm run test:watch` for watch mode).
- Config: `vitest.config.js`. `clearMocks: true` resets mock call history between tests, but not implementations set with `mockResolvedValue` / `mockReturnValue`. Reset those explicitly (`vi.resetAllMocks()` or re-create them in `beforeEach`) if a test depends on a clean implementation.
- Test files: `test/unit/**/*.test.js`, mirroring the `src/` path (`src/handlers/cphs/find.js` -> `test/unit/handlers/cphs/find.test.js`).
- Import `describe`, `test`, `expect`, `vi`, `beforeEach` and `afterEach` explicitly from `vitest`, even though globals are enabled.
- Style follows `docs/STYLEGUIDE.md` (Standard, no semicolons).

## Principles

1. **Unit tests isolate the unit.** Replace everything the unit talks to (database, logger, AWS SDK, other services, clock, network) with a mock or stub. No real I/O.
2. **Test behaviour, not implementation.** Assert on return values, thrown errors, and calls to collaborators that are the observable effect (for example `insertOne` called with the payload). Do not assert on internal variable names or call order that does not matter.
3. **Every path is covered.** For each function, list its branches and write one test per path:
   - success path
   - each `if` / early return / default value
   - each `catch` (collaborator rejects)
   - empty, missing and malformed input where the code handles them
   - boundary values for validation rules
4. **No pointless tests.** Do not write tests that:
   - only assert a mock returns what you just told it to return
   - check that a function exists or is exported
   - duplicate another test with trivially different data
   - test third-party libraries (Hapi, Boom, Joi, the Mongo driver)
   - snapshot large objects with no clear intent
5. **One reason to fail per test.** Name tests by behaviour: `returns an empty list when no CPHs exist`, not `test 1`.
6. **Arrange, act, assert**, with data built by small factory functions, not shared mutable state.

## Mocking and stubbing

**Mock a module** (hoisted, so place it at the top level of the file):

```js
import { vi } from 'vitest'
import { insertRawFormSubmission } from '../../../src/services/rawFormSubmissions.js'

vi.mock('../../../src/services/rawFormSubmissions.js', () => ({
  insertRawFormSubmission: vi.fn()
}))
```

**Stub a collaborator** with `vi.fn()` and configure per test:

```js
insertRawFormSubmission.mockResolvedValue({ upsertedCount: 1 })
insertRawFormSubmission.mockRejectedValue(new Error('db down'))
```

**Stub the Mongo `db`** (handlers receive it as `request.db`). Build it with a factory so each test gets fresh mocks:

```js
function createDb ({ find = vi.fn(), insertOne = vi.fn() } = {}) {
  const collection = { find, insertOne }
  return { collection: vi.fn(() => collection), _collection: collection }
}
```

**Stub the logger** with `{ info: vi.fn(), error: vi.fn() }`. Assert `logger.error` is called on failure paths.

**Time and randomness**: use `vi.useFakeTimers()` / `vi.setSystemTime(...)` and restore with `vi.useRealTimers()` in `afterEach`.

**Spies and env**: `vi.spyOn(obj, 'method')` for existing objects. `vi.stubEnv('NAME', 'value')` for environment variables, and `vi.unstubAllEnvs()` in `afterEach`.

**Restore state** in `afterEach` for anything you changed globally (`vi.restoreAllMocks()`, timers, env).

## Patterns

### Success and failure of an async handler

```js
import Boom from '@hapi/boom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { createCph } from '../../../../src/handlers/cphs/create.js'

function createRequest (overrides = {}) {
  return {
    payload: { cph: '12/345/6789' },
    logger: { info: vi.fn(), error: vi.fn() },
    db: { collection: vi.fn(() => ({ insertOne: vi.fn().mockResolvedValue({ insertedId: 'abc' }) })) },
    ...overrides
  }
}

function createResponseToolkit () {
  const response = { code: vi.fn().mockReturnThis(), header: vi.fn().mockReturnThis() }
  return { response: vi.fn(() => response), _response: response }
}

describe('createCph', () => {
  test('inserts the payload and returns 201 with a Location header', async () => {
    const request = createRequest()
    const h = createResponseToolkit()

    await createCph(request, h)

    expect(request.db.collection().insertOne).toHaveBeenCalledWith(request.payload)
    expect(h._response.code).toHaveBeenCalledWith(201)
    expect(h._response.header).toHaveBeenCalledWith('Location', '/api/cphs/abc')
  })

  test('logs and throws a 500 when the insert fails', async () => {
    const insertOne = vi.fn().mockRejectedValue(new Error('db down'))
    const request = createRequest({ db: { collection: () => ({ insertOne }) } })

    await expect(createCph(request, createResponseToolkit())).rejects.toMatchObject({
      isBoom: true,
      output: { statusCode: 500 }
    })
    expect(request.logger.error).toHaveBeenCalled()
  })
})
```

Note `request.db.collection()` in the first test returns a new object on each call in this sketch. When asserting on a collection stub, create the collection object once in the factory and return the same reference.

### Many inputs, one behaviour

Use `test.each` instead of copy-pasted tests, for example for validation boundaries:

```js
test.each([
  [0, false],
  [1, true],
  [12, true],
  [13, false]
])('month %i is valid: %s', (month, isValid) => {
  expect(isValidMonth(month)).toBe(isValid)
})
```

### Asserting errors

- Async: `await expect(fn()).rejects.toThrow('message')` or `.rejects.toMatchObject({ ... })`.
- Sync: `expect(() => fn()).toThrow('message')`.
- Always assert the message or type, never a bare `.toThrow()`.

## Workflow

1. Read the source file and list its paths (branches, catches, defaults).
2. Create `test/unit/<same path>.test.js` with `vi.mock` calls and factories at the top.
3. Write one test per path from step 1.
4. Run `npx vitest run test/unit/<path>.test.js --coverage --coverage.include=src/<path>.js` and check that no lines or branches are uncovered. Add a test for any gap that represents a real path.
5. Run `npm test` and `npm run lint`.

## Checklist

- [ ] Test file mirrors the source path and ends in `.test.js`
- [ ] All external dependencies are mocked or stubbed, with no real I/O
- [ ] Success, each branch and each failure path has a test
- [ ] Error assertions check the message or status
- [ ] No tests that only verify mocks or exports
- [ ] Global state (timers, env, spies) restored in `afterEach`
- [ ] `npm test` and `npm run lint` pass
