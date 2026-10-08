# JavaScript Style Guide

This document sets out the code style conventions for this Node.js / Hapi.js service and explains why we enforce them. All style rules are enforced automatically by ESLint, so in practice you should rarely need to think about them. Let the tooling do the work.

### Reference documents

- [Defra Software Development Standards - JavaScript standards](https://defra.github.io/software-development-standards/standards/javascript_standards/)
- [Defra Software Development Standards - Node.js standards](https://defra.github.io/software-development-standards/standards/node_standards/)

## Why we enforce a style

- **Code reviews focus on substance.** Automated style checks remove formatting nitpicks from PRs, so reviewers can concentrate on logic, security and design.
- **Diffs stay clean.** When everyone formats code identically, diffs contain only meaningful changes. That means fewer merge conflicts and a more useful `git blame`.
- **The codebase reads as one voice.** New team members learn one set of patterns, and unfamiliar files feel familiar.
- **It costs almost nothing.** Nearly every rule is auto-fixable with `eslint --fix` or format-on-save.
- **It removes friction.** Style is a tooling decision made once, not an opinion debated repeatedly.
- **It catches some bugs.** Consistent indentation and brace rules expose misleading code, such as a statement that looks like it's inside an `if` but isn't.

## Tooling

| Tool | Purpose |
|---|---|
| [ESLint](https://eslint.org/) (flat config) | Linting engine |
| [neostandard](https://github.com/neostandard/neostandard) | Base ruleset: correctness, best-practice **and** style rules |

We use neostandard's built-in style, which follows [`standard`](https://standardjs.com/) conventions. Its style rules are provided by [`@stylistic/eslint-plugin`](https://eslint.style/), which neostandard bundles and registers. There is no need to install or import it separately.

### Configuration

```js
// eslint.config.js
import neostandard from 'neostandard'

export default neostandard({
  env: ['node', 'vitest'],
  ignores: [...neostandard.resolveIgnoresFromGitignore()],
  noJsx: true
})
```

Do **not** pass `noStyle: true`, because that option disables all of the style rules described below.

The rules below describe the most visible conventions from neostandard's style set. They are not an exhaustive list. For the full set, see the [neostandard](https://github.com/neostandard/neostandard) and [standard](https://standardjs.com/rules.html) documentation.

## Rules

### Indentation: 2 spaces

```js
// ✅ Good
const routes = [
  {
    method: 'GET',
    path: '/users/{id}',
    handler: getUser
  }
]

switch (status) {
  case 'active':
    return true
  default:
    return false
}
```

**Why:** 2 spaces is the dominant Node.js convention. Consistent indentation makes nesting, such as route configs, Joi schemas and promise chains, readable at a glance. It also prevents misleading layouts that hide logic errors.

### Quotes: single

```js
// ✅ Good
const name = 'Hapi'
const message = "It's ready"          // allowed: avoids escaping
const greeting = `Hello ${name}`      // template literal with interpolation

// ❌ Bad
const name = "Hapi"
const plain = `no interpolation here`
```

**Why:** Single quotes are the Node ecosystem norm. Allowing double quotes to avoid escapes keeps strings readable. Restricting backticks to interpolation makes them a clear signal that a value is being inserted.

### Semicolons: none

```js
// ✅ Good
const server = Hapi.server({ port: 3000 })
await server.start()

// ❌ Bad
const server = Hapi.server({ port: 3000 });
```

**Why:** This is consistent with `standard`. It is safe because neostandard keeps the `no-unexpected-multiline` rule enabled, which flags the genuine automatic semicolon insertion (ASI) hazards. Never start a line with `(`, `[` or `` ` ``.

### Brace style: one true brace style (1TBS)

```js
// ✅ Good
if (!user) {
  throw Boom.notFound('User not found')
} else {
  return user
}

if (!user) { return h.response().code(404) }   // single-line allowed

// ❌ Bad
if (!user)
{
  throw Boom.notFound('User not found')
}
```

**Why:** Predictable block structure aids scanning. Single-line blocks keep simple guard clauses concise.

### Space before function parentheses

```js
// ✅ Good
function getUser (request, h) { }
const handler = async function (request, h) { }
getUser(request, h)                    // calls have no space

// ❌ Bad
function getUser(request, h) { }
```

**Why:** This `standard` convention visually distinguishes function declarations from function calls.

### Keyword spacing

```js
// ✅ Good
if (valid) {
  return await save(payload)
}

// ❌ Bad
if(valid){
  return await save(payload)
}
```

**Why:** Spacing around keywords such as `if`, `else`, `return` and `await` makes control flow stand out.

### Spacing around operators

```js
// ✅ Good
const total = price * quantity + shipping

// ❌ Bad
const total = price*quantity+shipping
```

**Why:** Expressions are easier to parse visually, especially in arithmetic and conditionals.

### Object curly spacing

```js
// ✅ Good
const { params, payload } = request
return { id, name }

// ❌ Bad
const {params, payload} = request
```

**Why:** Destructuring and object literals are pervasive in Hapi code, and the spacing makes them noticeably more readable.

### Key spacing

```js
// ✅ Good
const schema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().integer()
})

// ❌ Bad
const schema = Joi.object({
  name : Joi.string().required(),
  age:Joi.number().integer()
})
```

**Why:** Object literals make up much of a Hapi codebase, including route options, Joi schemas and plugin config. Consistent `key: value` formatting keeps them uniform.

### Whitespace hygiene

- **No trailing spaces.** Invisible whitespace creates noisy diffs.
- **Files end with a single newline.** POSIX tools expect one, and git otherwise reports "No newline at end of file".
- **At most one consecutive blank line.** This keeps vertical spacing meaningful, with blank lines as logical separators.

## Editor setup

1. Install the ESLint extension for your editor (e.g. `dbaeumer.vscode-eslint` for VS Code).
2. Enable fix-on-save. For VS Code, add this to your user `settings.json`:

   ```json
   {
     "files.autoSave": "onFocusChange",
     "editor.codeActionsOnSave": {
        "source.fixAll.eslint": "always"
    }
   }
   ```

   Note: autoSave must be set to onFocusChange and not afterDelay
3. Respect the repository's `.editorconfig`.
4. Do **not** run Prettier on this project. Formatting is handled by ESLint stylistic rules, and running both will conflict.

## Naming conventions

For project-specific naming rules for files, functions, routes, config and database identifiers, see [NAMING-CONVENTIONS.md](NAMING-CONVENTIONS.md).

## Commands

```bash
npm run lint        # report issues
npm run lint:fix    # auto-fix issues
```

These assume the following `package.json` scripts:

{
  "scripts": {
    "lint": "eslint --cache --cache-strategy content \"**/*.{cjs,js}\"",
    "lint:fix": "npm run lint -- --fix"
  }
}

## Enforcement

- **CI:** `npm run lint` runs on every PR and must pass before merge.
- **Pre-commit (optional):** husky and lint-staged run `eslint --fix` on staged files.
- **Disabling rules:** Inline `eslint-disable` comments must target a specific rule and include a reason, e.g. `// eslint-disable-next-line @stylistic/max-len -- generated SQL`. Blanket disables are not accepted in review.

## Changing the rules

We deliberately stay close to neostandard's defaults, so overrides should be rare and well justified. Overrides go in `eslint.config.js`, referencing rules by their `@stylistic/` name.

Rule changes are made by PR to `eslint.config.js` and this document together. The PR description should explain the reasoning. Any resulting reformat should be a separate formatting-only commit, added to `.git-blame-ignore-revs`.

Upgrading neostandard can occasionally change style rules. Review the changelog on upgrades, and treat any resulting reformat the same way.
