# Redirect Comparison Report

## Summary

Redirects missing in docs.json: 11
Redirects missing in vercel.json: 5
Redirects with mismatched destinations: 1

## Redirects in vercel.json but missing in docs.json

- `/api-design/:page` → `/api-overview/:page`
- `/managing-policies/:page` → `/concepts/policies/:page`
- `/managing-users/:page` → `/concepts/users/:page`
- `/users/best-practice` → `/concepts/users/best-practice`
- `/users/introduction` → `/concepts/users/introduction`
- `/users/root-quorum` → `/concepts/users/root-quorum`
- `/users/credentials` → `/concepts/users/credentials`
- `/features/sessions` → `/authentication/sessions`
- `/api-overview/submissions` → `/developer-reference/api-overview/submissions`
- `/api-overview/introduction` → `/developer-reference/introduction`
- `/api-overview/:page` → `/developer-reference/:page`

## Redirects in docs.json but missing in vercel.json

- `/users/:slug*` → `/concepts/users/:slug*`
- `/api-design/:slug*` → `/api-overview/:slug*`
- `/managing-policies/:slug*` → `/concepts/policies/:slug*`
- `/managing-users/:slug*` → `/concepts/users/:slug*`
- `/api-overview/:slug*` → `/developer-reference/api-overview/:slug*`

## Redirects with mismatched destinations

- `/api-introduction`:
  - vercel.json: `/api-overview/introduction`
  - docs.json: `/developer-reference/api-overview/intro`

