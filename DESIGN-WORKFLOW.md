# Docs design workflow

Guide for contributing design changes to the Turnkey Mintlify docs (welcome page revamp and related UI).

## Branch strategy

- Base design work on **`graham/docs-revamp`** (or a short-lived branch from it, e.g. `serge/design-welcome`).
- Open PRs **into `graham/docs-revamp`** until the revamp merges to `main`.
- Sync often to avoid drift from the Mintlify preview:

```sh
git fetch origin
git merge origin/graham/docs-revamp
```

Production deploys from **`main`** (see README).

## Files to edit

| Change                      | Files                               |
| --------------------------- | ----------------------------------- |
| Welcome / landing layout    | `welcome.mdx`                       |
| Welcome / shared UI styles  | `styles.css` (`.tk-*` classes)      |
| Site-wide color, nav, fonts | `docs.json`                         |
| Illustrations, icons        | `images/` (use `/images/...` paths) |
| Logos / favicon             | `logo/`, `favicon.svg`              |

Avoid unless intentional:

- `generated-docs/`, `api-reference/` (generated — use `make gen` for API reference)
- Duplicating content in `snippets/shared/` (update the snippet once; see README)

## Local development

Mintlify CLI requires **Node ≥ 20.17** (`.nvmrc` may list an older version).

```sh
nvm use 20
cd docs   # directory containing docs.json
mintlify dev
```

Preview welcome: http://localhost:3000/welcome

Before opening a PR:

```sh
mintlify validate
```

### Common pitfall

Use **straight ASCII quotes** (`'`) in imports and JSX — not curly/smart quotes (`‘` `’`). Smart quotes in `import` paths or `style={{}}` cause MDX parse errors and can blank pages during `mintlify dev`.

## Shipping to the team

1. Make focused commits (e.g. hero spacing, nav labels — not one giant “design” commit).
2. Push your branch to `tkhq/docs`.
3. Open a PR **into `graham/docs-revamp`** with:
   - What changed (welcome vs sitewide)
   - Before/after screenshots (light and dark if relevant)
   - Mintlify preview link from the PR checks
   - Local test steps: `mintlify dev` → `/welcome`
4. Request review from the revamp owner / docs maintainers.
5. Merge via team process; do not merge to `main` unless agreed.

## Style conventions

- Prefer **CSS classes in `styles.css`** over large inline `style={{}}` in `welcome.mdx`.
- Commit image assets in-repo; do not rely only on Mintlify CDN URLs for new art.
- `welcome.mdx` uses `mode: "custom"` for a full-width landing layout (navbar only).

## Access

- **GitHub:** write access to `tkhq/docs` allows push + PR without a fork.
- **Mintlify dashboard:** optional (`mintlify login`); not required for local preview.

## Quick checklist

- [ ] Branch is up to date with `origin/graham/docs-revamp`
- [ ] `mintlify dev` — `/welcome` looks correct (light + dark)
- [ ] `mintlify validate` passes
- [ ] No smart quotes in imports / JSX
- [ ] PR targets `graham/docs-revamp` with screenshots
