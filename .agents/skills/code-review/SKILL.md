---
name: code-review
description: Use when asked to review code, a diff, a branch or a pull request in this service. Produces a thorough principal-developer review grouped into Blockers, Major issues and Minor (non-critical) issues.
---

# Code review

Review as a principal developer: assess correctness, security, reliability, design and maintainability, not just style. Be specific, evidence-based and constructive.

## Process

1. **Establish scope.** Identify the changed files (`git diff main...HEAD --stat`, the PR, or the files the user named). Review only the change and the code it touches, unless an existing problem is made worse by it.
2. **Understand intent.** Read the PR description, linked ticket and commit messages. If the intent is unclear, say so and list what you assumed.
3. **Read the code in context.** Open the surrounding files, callers and tests. Do not judge a hunk in isolation.
4. **Run the checks** when possible: `npm run lint` and `npm test`. Report failures as findings, and state clearly if you could not run them.
   - A failure may not be caused by the change. Something may be missing or broken on `main`, in the service setup (for example MongoDB, SQS or S3 not running, missing dependencies) or in config (`src/config.js`, env vars, `compose/`).
   - For each failure, establish whether the change caused it: re-run the failing check on `main` (or with the change stashed) and inspect the error for missing services, config or environment.
   - Report failures that the change did not cause separately under "Unrelated failures", and do not count them toward the verdict.
5. **Work through the review areas below.**
6. **Report** using the output format below.

## Review areas

### Correctness
- Does it do what the requirement says, including edge cases (empty, null, duplicates, large input, concurrent calls)?
- Async handling: missing `await`, unhandled rejections, promises in loops, race conditions.
- Error paths: are failures caught, logged and returned with the right status? Is the original error preserved (`Boom.internal(message, err)`)?
- Data handling: MongoDB filters/projections correct, idempotency of writes, upsert behaviour, date/time and timezone handling.

### Security (OWASP Top 10)
- Input validated at the boundary (Joi `options.validate` on routes taking payload, params or query).
- No injection: user input is never placed directly into MongoDB query operators (for example `$where`, `$ne`, or object-typed values from the payload).
- Authentication and authorisation present where required. Check for broken access control on new endpoints.
- No secrets, tokens or personal data in code, logs, error messages or test fixtures.
- Error responses do not leak internals (stack traces, query details).
- New dependencies are necessary, maintained and pinned (this repo pins exact versions).
- Safe use of AWS SDK, S3 keys and SQS message bodies (treat message content as untrusted input).

### Reliability and operations
- Behaviour on dependency failure: MongoDB, SQS, S3 down or slow. Timeouts, retries, poison messages, dead-letter handling.
- Resource leaks: connections, listeners, timers, unclosed streams.
- Startup and shutdown behaviour (plugins registered in `src/server.js`, `hapi-pulse` timeout).
- Logging is useful and at the right level, with no sensitive data, and uses `request.logger` or `server.logger`.
- Configuration is added via `src/config.js` (convict) with validation and a default, not read from `process.env` ad hoc.
- Database changes: indexes for new query patterns, migrations or init scripts (`compose/mongo/10-init.js`), backward compatibility with existing documents.

### Design and maintainability
- Follows the existing layering: routes -> handlers -> services -> helpers. Handlers stay thin and shared logic lives in `src/services/`.
- Single responsibility, no duplication, no speculative abstraction or dead code.
- Public contracts (route paths, response shapes, collection names, message formats) are not broken without versioning or a migration plan.
- Naming and file placement follow `docs/NAMING-CONVENTIONS.md`.
- Complexity is justified. Suggest a simpler alternative where one exists.

### Performance
- Unbounded queries (no limit or projection), N+1 queries, loading whole collections into memory, missing indexes, blocking work on the event loop.

### Tests
- New behaviour is covered, including each branch and failure path. Follow the `unit-testing` skill.
- Tests assert behaviour and would fail if the code were wrong. Flag tests that only verify mocks or tautological values.
- Prefer the smallest unit under test: direct service/db mocks for pure logic instead of booting the full Hapi server unless the lifecycle itself is the thing being tested.
- Flag redundant server lifecycle tests that initialize and stop the full app when the code under test does not depend on server state, as they add cost and flakiness without extra signal.
- Flag low-value assertions that only check metadata such as plugin name, DB namespace, or collection names when the behavior under test is not actually exercised.
- No flaky patterns (real timers, real network, shared state, order dependence).
- Coverage has not dropped for changed files.

### Style and documentation
- Lint-enforced style (`docs/STYLEGUIDE.md`) is left to ESLint. Only raise it if lint is failing or bypassed.
- Comments explain why, not what. README or `docs/` updated when behaviour, config or endpoints change.

## Severity definitions

| Level | Meaning | Merge impact |
| --- | --- | --- |
| **Blocker** | Security vulnerability, data loss or corruption, crash or outage risk, broken requirement, failing build or tests, breaking contract change | Must be fixed before merge |
| **Major** | Likely bug in realistic conditions, missing error handling or validation, missing tests for important paths, design problem that will be costly later, performance risk | Should be fixed before merge, or agreed with the author and ticketed |
| **Minor** | Non-critical: naming, readability, small simplifications, comment or doc gaps, optional improvements | Can be merged. Fix at the author's discretion |

If unsure between two levels, choose the higher one and explain the uncertainty. Do not inflate severity to appear thorough, and do not pad Minor with trivia that lint already enforces.

## Output format

Use exactly these headings, in this order. Write "None" under any empty section.

```md
## Summary
<2-4 sentences: what the change does, overall quality, and a verdict: Approve / Approve with changes / Request changes>

## Blockers
1. **<short title>** - `path/to/file.js:LINE`
   - Problem: <what is wrong and why it matters>
   - Suggestion: <concrete fix, with a code snippet if helpful>

## Major issues
1. **<short title>** - `path/to/file.js:LINE`
   - Problem: ...
   - Suggestion: ...

## Minor (non-critical) issues
1. **<short title>** - `path/to/file.js:LINE`
   - <issue and suggestion in one or two lines>

## Unrelated failures
<Lint, test or startup failures that also occur without this change (missing from main, the service or config), with the evidence and likely cause. Write "None" if there are none.>

## Positives
<Optional: good decisions worth keeping, kept brief>

## Not verified
<Anything not checked, such as tests or lint not run, or areas out of scope>
```

Rules for findings:
- Cite the file and line for every finding, and link to the code.
- Explain the impact, not just the rule. Say what breaks and when.
- Give an actionable fix. If there are options, state the recommended one.
- One finding per item. Group repeated occurrences into a single item that lists the locations.
- Do not edit code during a review unless the user asks for fixes.
- Do not report anything you have not verified in the code. Mark uncertain items as questions.

## Verdict rules

- Any Blocker -> **Request changes**
- No Blockers, one or more Major -> **Approve with changes** (or **Request changes** if the Majors are significant or numerous)
- Only Minor or none -> **Approve**
