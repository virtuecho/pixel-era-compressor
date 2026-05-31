# AI Code Review Checklist

Use this checklist for AI-generated code.

## 1. Product correctness

- Does the change preserve the 2000–2013 digital photo scope?
- Does it use technical-device visual language from early digital photography?
- Does output still look like old digital photography?
- Are hard jagged edges avoided?
- Are device presets historically plausible?

## 2. Image-processing correctness

- Is high-quality resize used before degradation?
- Is nearest-neighbor avoided by default?
- Is softness applied subtly and intentionally?
- Are noise and color transforms bounded to valid pixel ranges?
- Is JPEG encoding the final step, not an early step?
- Are device-specific differences data-driven?

## 3. TypeScript quality

- Does code compile under `strict: true`?
- Are public APIs typed explicitly?
- Are union types exhaustive?
- Is `any` avoided unless documented?
- Are magic numbers named or explained?

## 4. Architecture

- Does UI remain separate from pixel-level processing?
- Are presets stored as data?
- Are worker boundaries typed?
- Does code fit the documented directory structure?
- Does the change avoid introducing C/C++?

## 5. Validation

- Does TypeScript validation pass?
- Does linting pass?
- Does formatting pass?
- Does documentation linting pass?
- Do architecture checks pass?

## 6. Documentation

- Are product-facing behavior changes documented?
- Are architectural decisions updated?
- Are comments meaningful and not redundant?
- Does documentation pass markdown lint?

## 7. Git and workflow

- Is the commit small?
- Does the commit message follow Conventional Commits?
- Did the agent avoid pushing?
- Were checks run before the commit?
