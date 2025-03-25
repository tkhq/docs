.PHONY: gen validate-redirects validate-docs-redirects validate-redirect-destinations validate-redirect-consistency fix-redirects

# Default configuration values
CHECK_DESTINATIONS ?= false
BASE_URL ?= https://docs.turnkey.com

# Run the generator script
gen:
	npx ts-node scripts/gen.ts 

# Run the redirect validation utility
# Usage: make validate-redirects [CHECK_DESTINATIONS=true] [BASE_URL=https://example.com]
validate-redirects:
	npx ts-node scripts/redirect-validator/redirect-validator.ts \
		--check-destinations=$(CHECK_DESTINATIONS) \
		--base-url=$(BASE_URL)

# Run the docs redirect validation utility
# This validates redirects between vercel.json and docs.json,
# and checks that all destinations exist in the navigation structure
validate-docs-redirects:
	npx ts-node scripts/redirect-validator/docs-redirect-validator.ts

# Validate only that redirect destinations exist in the navigation structure
validate-redirect-destinations:
	npx ts-node scripts/redirect-validator/docs-redirect-validator.ts --no-consistency

# Validate only that redirects are consistent between vercel.json and docs.json
validate-redirect-consistency:
	npx ts-node scripts/redirect-validator/docs-redirect-validator.ts --no-destinations

# Run in fix mode (experimental)
fix-redirects:
	npx ts-node scripts/redirect-validator/docs-redirect-validator.ts --fix 