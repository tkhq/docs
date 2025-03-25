# Redirect Fix Instructions

## Summary of Issues

- Redirects missing in docs.json: 11
- Redirects missing in vercel.json: 5
- Redirects with mismatched destinations: 1

## How to Apply Fixes

### Option 1: Update docs.json

Replace the `redirects` array in `docs.json` with the contents of `suggested-docs-redirects.json`.

### Option 2: Update vercel.json

Replace the `redirects` array in `vercel.json` with the contents of `suggested-vercel-redirects.json`.

## Decision Required

You need to decide which file to use as the source of truth:

- If `docs.json` should be the source of truth, apply Option 2
- If `vercel.json` should be the source of truth, apply Option 1

Note: The recommended approach is to use **docs.json as the source of truth**, as it defines the site structure.