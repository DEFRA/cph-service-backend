---
name: pr-description
description: Use when asked to write, draft or update a pull request description for this service. Builds a comprehensive description from the differences between the current branch and main, and outputs it as raw markdown.
---

# PR description

Write the description from what the branch actually changes relative to `main`, not from memory of the conversation.

## Process

1. **Gather the diff.** Run these and read the output:
   - `git branch --show-current`
   - `git --no-pager log main..HEAD --format='%h %s%n%b'` for commit messages and intent
   - `git --no-pager diff main...HEAD --stat` for the changed files
   - `git --no-pager diff main...HEAD` for the full diff. For large diffs, read file by file.
   If `main` is not available locally, use `origin/main`. If the branch has no differences, say so and stop.
2. **Find the Jira ticket and intent.**
   - The ticket key is in the branch name after the first `/`, in the form `cph-123` (for example `feature/cph-175-add-lookup` gives `cph-175`). Uppercase it and build the link `https://eaflood.atlassian.net/browse/CPH-175`.
   - If the branch has no `/` or no key after it, ask the user for the ticket, or omit the link and say so. Never guess a key.
   - If the key prefix is not `cph` (for example a typo such as `chp`), still use the key found but flag the mismatch under Notes for reviewers.
   - Use commit messages and any user-supplied context for intent. If the intent is unclear, state the assumption rather than inventing a reason.
3. **Read the changed code in context** when the diff alone does not explain behaviour: callers, config, tests and the route/handler/service layer it touches.
4. **Classify each change** as one of: new feature, behaviour change, bug fix, refactor or move, test-only, config or dependency, docs or CI.
5. **Check impact:**
   - Route paths, response shapes, collection names, message formats or env vars that change (breaking or not).
   - New or changed config in `src/config.js`, indexes or init scripts (`compose/mongo/10-init.js`).
   - New dependencies in `package.json`.
   - Security-relevant changes: validation, auth, logging of data, error responses.
6. **Optionally run `npm run lint` and `npm test`** and report the real result. Never claim they pass unless you ran them.
7. **Output the description** as one raw markdown code block (a ```markdown fenced block) so it can be copied directly. Do not create a file unless asked.

## Template

Use these headings in this order. Omit a section only where noted.

```markdown
## Jira ticket
[CPH-123](https://eaflood.atlassian.net/browse/CPH-123)

## Summary
<2-4 sentences: what the PR does and why.>

## Motivation / context
<The problem or requirement. Omit if the Summary already covers it.>

## Changes
### <Area, e.g. Routes, Handlers, Services, Plugins, Config, Tests>
- <Specific change, naming files and functions in backticks>

## Behaviour and API impact
<Endpoints, request/response contracts, messages, collections, env vars that change. Write "No change to public behaviour" if none. Call out breaking changes explicitly.>

## Database / infrastructure
<Indexes, migrations, init scripts, compose or CI changes. Omit if none.>

## Dependencies
<Added, removed or upgraded packages with versions. Omit if none.>

## Testing
- <Tests added or changed and what they cover, including failure paths>
- <Commands run and their real results, e.g. `npm test`, `npm run lint`>
- <Manual verification steps, if any>

## Security and reliability
<Validation, auth, logging, error handling, dependency-failure behaviour touched by the change. Omit if not relevant.>

## Risks and rollout
<What could go wrong, how to roll back, any deploy ordering or config needed.>

## Notes for reviewers
<Where to focus, known limitations, deliberate omissions, follow-ups.>
```

## Rules

- Always put the Jira ticket link first, as a markdown link with the uppercase key as the text. Omit the section only when no key can be found.
- Base every statement on the diff or commits. Do not describe changes that are not there, and do not omit significant ones.
- Group by area, not by commit. Collapse noise (renames, formatting) into one line, but mention that files were moved or renamed.
- Be specific: name files, functions, routes and config keys in backticks. Avoid vague lines such as "various fixes".
- Explain why as well as what, wherever the diff shows a reason.
- State test results honestly. If a check was not run, write "not run".
- Mention anything noticed in the diff that a reviewer should know about, such as unused imports, leftover debug code, or missing tests for a new path, under Notes for reviewers.
- Keep the tone factual and impersonal. No emojis.
- For very small changes, keep the same headings that apply but stay concise. Comprehensive means complete, not padded.
