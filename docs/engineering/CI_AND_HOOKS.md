# CI and Hooks

## 1. Package manager

Use pnpm only.

Required files:

```text
package.json
pnpm-lock.yaml
```

Forbidden files:

```text
package-lock.json
yarn.lock
```

---

## 2. Required package scripts

Recommended `package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "docs:lint": "markdownlint-cli2 \"**/*.md\" \"#node_modules\"",
    "arch:check": "tsx scripts/check-architecture.ts",
    "check": "pnpm typecheck && pnpm lint && pnpm test && pnpm docs:lint && pnpm arch:check"
  }
}
```

---

## 3. Pre-commit hooks

Use Husky and lint-staged.

Install:

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

Recommended `.husky/pre-commit`:

```sh
pnpm exec lint-staged
```

Recommended `package.json` config:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{md,json,css,html,yml,yaml}": ["prettier --write"],
    "*.md": ["markdownlint-cli2"]
  }
}
```

---

## 4. Commit message hook

Use a commit-msg hook to enforce the Conventional Commit header.

Recommended `.husky/commit-msg`:

```sh
node scripts/validate-commit-msg.mjs "$1"
```

The validator should allow:

```text
feat(scope): description
fix: description
chore: init
Merge branch 'branch-name'
Revert "subject"
```

Allowed types:

```text
feat|fix|refactor|perf|style|test|docs|build|ops|chore
```

---

## 5. GitHub Actions

Recommended workflow file: `.github/workflows/ci.yml`

```yaml
name: ci

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  check:
    runs-on: ubuntu-latest

    steps:
      - name: checkout
        uses: actions/checkout@v4

      - name: setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: setup node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: install
        run: pnpm install --frozen-lockfile

      - name: check formatting
        run: pnpm format:check

      - name: typecheck
        run: pnpm typecheck

      - name: lint
        run: pnpm lint

      - name: test
        run: pnpm test

      - name: lint docs
        run: pnpm docs:lint

      - name: check architecture
        run: pnpm arch:check
```

---

## 6. Architecture check examples

`scripts/check-architecture.ts` should fail CI if:

- `package-lock.json` exists
- `yarn.lock` exists
- `tsconfig.json` does not contain `"strict": true`
- source code contains `.js` files under `src/`
- C/C++ files exist in the repo
- preset IDs are duplicated
- imaging modules import UI modules

This converts team conventions into mechanical gates.
