ROOT := $(shell git rev-parse --show-toplevel)
JS_SDK_ROOT := $(ROOT)/../sdk

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


.PHONY: sync-sdk-gen-docs
sync-sdk-gen-docs:
	@if [ ! -d $(JS_SDK_ROOT) ]; then git clone git@github.com:tkhq/sdk.git $(JS_SDK_ROOT); fi
	$(cd "$JS_SDK_ROOT && git pull)

	cp docs.json $(JS_SDK_ROOT)/generated-docs

	@mkdir -p ./generated-docs

	@echo Generating docs and formatting output into mdx...
	(cd $(JS_SDK_ROOT) && pnpm run generate-docs)

	(cd $(JS_SDK_ROOT) && node $(JS_SDK_ROOT)/typedoc-theme/format-json-output.js \
		--packages react-wallet-kit core \
		--groups React "TypeScript | Frontend")

	@echo Running prettier...
	(cd $(JS_SDK_ROOT) && pnpm run prettier-all:write)

	@echo Copying synced docs.json to root...
	cp $(JS_SDK_ROOT)/generated-docs/docs.json docs.json

	@echo Copying formatted docs to ./generated-docs...
	cp -R $(JS_SDK_ROOT)/generated-docs/react-wallet-kit ./generated-docs
	cp -R $(JS_SDK_ROOT)/generated-docs/core ./generated-docs

	@echo Deleting temporary files...
	find $(JS_SDK_ROOT)/generated-docs -mindepth 1 \
		! -name 'docs.json' \
		! -name 'sdk-docs.json' \
		-exec rm -rf {} +