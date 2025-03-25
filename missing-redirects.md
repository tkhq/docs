# Missing Redirect Destinations

The following destination paths specified in vercel.json don't exist in the current docs.json file structure:

## Static Paths

1. `/api-overview/introduction`
2. `/concepts/users/best-practice` (docs has `/concepts/users/best-practices` - plural difference)
3. `/features/sessions`
4. `/features/email-auth`
5. `/features/email-recovery`
6. `/features/export-wallets` (docs has `/wallets/export-wallets`)
7. `/features/import-wallets` (docs has `/wallets/import-wallets`)
8. `/features/webhooks` (docs has `/developer-reference/webhooks`)
9. `/developer-reference/introduction` (docs has `/developer-reference/api-overview/intro`)

## Dynamic Routes

The following dynamic routes in vercel.json may point to non-existent paths:

1. `/api-overview/:page`

   - This will potentially redirect to non-existent paths since the `/api-overview/` prefix is not used in the current docs structure.
   - Current docs structure uses `/developer-reference/api-overview/...`

2. `/concepts/policies/:page`

   - This is likely valid for existing `/concepts/policies/...` paths
   - Needs verification for any specific pages that might not match

3. `/concepts/users/:page`

   - This is likely valid for existing `/concepts/users/...` paths
   - The "best-practice" vs "best-practices" discrepancy applies here

4. `/developer-reference/:page`
   - Partially valid for `/developer-reference/webhooks`
   - Other direct children of `/developer-reference/` don't exist except as part of deeper paths

## Summary

These redirects will likely lead to 404 errors unless:

1. The destination paths are added to the docs.json structure
2. The redirects in vercel.json are updated to match existing paths
