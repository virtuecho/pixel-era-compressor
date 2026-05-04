# Agent Task Template

Use this template when asking an agent to work on Pixel Era Compressor.

````md
## Task

<Describe the exact change.>

## Context

- Relevant docs:
  - AGENTS.md
  - docs/product/PRODUCT_SPEC.md
  - docs/engineering/ARCHITECTURE.md
- Product boundary:
  - This is a 2000–2013 digital photo compression simulator.
  - This is not a Y2K fashion filter.

## Requirements

- Use pnpm.
- Use TypeScript with strict mode.
- Use Rust instead of C/C++ if systems code is needed.
- Keep code comments detailed.
- Keep commits small if committing.
- Never push.

## Expected files

<List expected files or modules.>

## Validation

Run:

```bash
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm docs:lint
pnpm arch:check
```
````

## Output

Summarize:

- files changed
- tests run
- commit messages created
- known limitations
