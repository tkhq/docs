.PHONY: openapi-gen gen tags mintlify-check

# Convenience method to start dev server
dev:
	mintlify dev

# Install deps for OpenAPI
install:
	cd scripts/openapi-gen && npm install

# Default MDX generation target
gen: mintlify-check
	cd scripts/openapi-gen && npx ts-node openapi-gen.ts --file=openapi.json --generate-mdx

# Run the OpenAPI generator (allows custom ARGS)
openapi-gen: mintlify-check
	cd scripts/openapi-gen && npx ts-node openapi-gen.ts $(ARGS)

tags: mintlify-check
	cd scripts/openapi-gen && npx ts-node openapi-gen.ts --file=openapi.json --list-endpoints-tags ../../snippets/data/endpoint-tags.mdx

mintlify-check:
	@current=$$(mintlify --version 2>/dev/null || echo "not installed"); \
	latest=$$(npm view mintlify version 2>/dev/null || echo "unknown"); \
	if [ "$$current" != "$$latest" ]; then \
		echo "⬆️  Updating Mintlify CLI: $$current → $$latest..."; \
		npm install -g mintlify@latest; \
		echo "✅ Mintlify CLI updated to $$(mintlify --version)"; \
	else \
		echo "✅ Mintlify CLI is up to date ($$current)"; \
	fi
