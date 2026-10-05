# GitHub Workflows Overview

This repository uses three GitHub Actions workflows to manage quality checks, release validation, and deployment.

## 1. Check Pull Request

File: `.github/workflows/check-pull-request.yml`

Purpose:
- Validates any pull request targeting `main` before it can be merged.
- Acts as the main quality gate for code changes.

Trigger:
- `pull_request`
- Branch: `main`
- Events: `opened`, `reopened`, `synchronize`, `ready_for_review`

What it runs:
- Checks out the code
- Sets up Node.js from `.nvmrc`
- Installs dependencies with `npm ci`
- Runs linting with `npm run lint`
- Runs the test suite with `npm test`
- Builds the Docker image with `docker build --no-cache --tag cdp-node-backend-template .`
- Runs a security audit with `npm run security-audit`
- Runs a SonarCloud scan for non-Dependabot actors

Permissions:
- `contents: read`
- `pull-requests: write`

Developer note:
- This is the expected pre-merge safety check for normal feature work and bug fixes.
- If a PR fails here, it is usually because linting, tests, Docker build validation, or the security/quality checks failed.

---

## 2. Publish Hot Fix

File: `.github/workflows/publish-hotfix.yml`

Purpose:
- Supports a manual hot-fix deployment path.
- Mirrors the standard PR validation flow and is intended for urgent or exceptional release work.

Trigger:
- Manual dispatch via `workflow_dispatch`

Concurrency:
- Grouped by the branch or ref name
- `cancel-in-progress: false`
- `queue: max`

What it runs:
- Checks out the repository with full history (`fetch-depth: 0`)
- Sets up Node.js from `.nvmrc`
- Installs dependencies
- Runs linting
- Runs tests
- Validates the Docker image build
- Runs security audit
- Runs SonarCloud analysis

Permissions:
- `id-token: write`
- `contents: write`
- `pull-requests: write`

Environment:
- `AWS_REGION=eu-west-2`
- `AWS_ACCOUNT_ID=094954420758`

Developer note:
- This workflow is not automatically triggered by a push; it is started manually when a maintainer decides to publish a hot fix.
- It is useful for urgent patches when the standard branch-based release flow is not sufficient.

---

## 3. Publish

File: `.github/workflows/publish.yml`

Purpose:
- Publishes the application after code is merged into `main`.
- This is the repository's main deployment workflow for standard release builds.

Trigger:
- `push` to `main`

Concurrency:
- Grouped by workflow name
- `cancel-in-progress: false`
- `queue: max`

Permissions:
- `id-token: write`
- `contents: write`
- `pull-requests: write`

Environment:
- `AWS_REGION=eu-west-2`
- `AWS_ACCOUNT_ID=094954420758`

What it runs:
- Checks out the code
- Runs the shared CDP build and publish action:
  `DEFRA/cdp-build-action/build@main`
- This is the workflow responsible for the actual build and deployment path for the main branch

[Information regarding DEFRA/cdp-build-action/build@main can be found here] (https://github.com/DEFRA/cdp-build-action/tree/main/build)

Job condition:
- `if: github.run_number != 1`
- This prevents the workflow from running on the initial workflow run edge case.

Developer note:
- Once code is merged into `main`, this workflow is the normal release path.
- The `publish-hotfix.yml` workflow is a manual, special-case path, while `publish.yml` is the standard deployment pipeline after merge.

---

## Workflow relationship

The repository follows a simple release model:

1. A pull request is validated by the PR check workflow.
2. Code is merged to `main`.
3. The publish workflow runs automatically on the main branch.
4. In exceptional situations, the hot-fix workflow can be manually triggered for urgent release work.

This gives the team both a strong merge gate and a standard deployment path, while still allowing controlled manual intervention for production-critical fixes.
