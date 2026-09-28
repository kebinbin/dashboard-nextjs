---
name: commit-message
description: Format and content rules for git commit messages in this project. Use whenever writing, suggesting, or reviewing a commit message, or when the user asks to commit changes.
---

# Commit messages

Follow Conventional Commits. Before writing, run `git diff --staged` (or `git diff` if nothing is staged) and describe what actually changed. Never guess from file names alone.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type (required)

| Type | Use for |
|---|---|
| `feat` | New user-facing feature |
| `fix` | Bug fix |
| `refactor` | Code change with no behavior change |
| `perf` | Performance improvement |
| `style` | Formatting, CSS/Tailwind-only visual tweaks |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `chore` | Deps, config, tooling, build |

### Scope (optional, recommended)

The area of the app that changed: `invoices`, `customers`, `dashboard`, `auth`, `db`, `ui`, `actions`, `config`.

### Subject (required)

- Imperative mood: "add", not "added" or "adds"
- Lowercase first letter, no trailing period
- 50 characters or fewer
- Say *what* changes, not how

### Body (when the change is not trivial)

- Blank line after the subject, wrap at 72 characters
- Explain *why* the change was needed and any non-obvious decisions
- Use `-` bullets for multiple distinct changes
- Mention side effects: migrations, new env vars, changed routes

### Footer (when applicable)

- `BREAKING CHANGE: <description>` for incompatible changes (also add `!` after the type/scope, e.g. `feat(auth)!:`)
- `Closes #<issue>` / `Refs #<issue>` for linked issues
- Keep any `Co-Authored-By:` trailer on its own line at the very end

## Content rules

- One logical change per commit. If the diff mixes unrelated work, suggest splitting it.
- Never include secrets, `.env` values, or credentials in the message.
- Don't list every file touched; summarize the intent.
- Don't commit generated or local-only files (`.next/`, `.playwright-mcp/`, screenshots, `tmp-*` files) unless asked.

## Examples

```
feat(invoices): add search by customer name

Filter the invoices table with a debounced search input that syncs
the query to the URL, so results are shareable and survive refresh.
```

```
fix(auth): redirect to login when session expires
```

```
chore(config): ignore Playwright MCP output
```
