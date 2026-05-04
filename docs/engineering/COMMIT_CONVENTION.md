# Commit Convention

Pixel Era Compressor uses Conventional Commits.

## 1. Format

```text
<type>(<optional scope>): <description>

<optional body>

<optional footer>
```

## 2. Initial commit

```text
chore: init
```

## 3. Allowed types

- `feat`: add, adjust, or remove a user-facing feature or API
- `fix`: fix a user-facing bug or API bug
- `refactor`: restructure code without changing behavior
- `perf`: improve performance without changing behavior
- `style`: formatting or style-only change
- `test`: add or correct tests
- `docs`: documentation-only change
- `build`: build tools, dependencies, package scripts
- `ops`: CI/CD, deployment, hooks, operational scripts
- `chore`: repository maintenance

## 4. Recommended scopes

- `product`
- `docs`
- `presets`
- `imaging`
- `pipeline`
- `ui`
- `worker`
- `jpeg`
- `tests`
- `ci`
- `hooks`
- `release`

## 5. Description rules

Description must:

- be mandatory
- use imperative present tense
- start lowercase
- not end with a period

Good:

```text
feat(presets): add nokia n95 profile
```

Bad:

```text
Added Nokia N95 preset.
```

## 6. Breaking changes

Use `!` before `:` and add a footer.

```text
feat(pipeline)!: replace image processing contract

BREAKING CHANGE: processImage now returns ProcessedImage instead of Blob.
```

## 7. Commit size

One commit should contain one logical change.

Good sequence:

```text
docs(product): add camera preset specification
build: add pnpm workspace scripts
feat(presets): add phone preset data
test(presets): validate preset dimensions
feat(pipeline): add high-quality resize step
```

Bad:

```text
feat: add entire app
```

## 8. Agent push policy

Agents must not push.

Allowed:

```bash
git status
git diff
git add ...
git commit -m "docs(product): add preset table"
```

Forbidden:

```bash
git push
git push origin main
git push --force
```
