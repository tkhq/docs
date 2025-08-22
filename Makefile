ROOT := $(shell git rev-parse --show-toplevel)
JS_SDK_ROOT := $(ROOT)/../sdk

.PHONY: openapi-gen gen tags

# Convenience method to start dev server
dev:
	mintlify dev

# Install deps for OpenAPI
install:
	cd scripts/openapi-gen && npm install

# Default MDX generation target
gen:
	cd scripts/openapi-gen && npx ts-node openapi-gen.ts --file=openapi.json --generate-mdx

# Run the OpenAPI generator (allows custom ARGS)
openapi-gen:
	cd scripts/openapi-gen && npx ts-node openapi-gen.ts $(ARGS)

tags:
	cd scripts/openapi-gen && npx ts-node openapi-gen.ts --file=openapi.json --list-endpoints-tags ../../snippets/data/endpoint-tags.mdx

.PHONY: sync-sdk-gen-docs
sync-sdk-gen-docs:
	@if [ ! -d $(JS_SDK_ROOT) ]; then git clone git@github.com:tkhq/sdk.git $(JS_SDK_ROOT); fi
	$(cd "$JS_SDK_ROOT && git pull)

	cp docs.json $(JS_SDK_ROOT)/generated-docs

	@mkdir -p ./generated-docs/formatted

	@echo Generating docs and formatting output into mdx...
	(cd $(JS_SDK_ROOT) && pnpm run generate-docs)

	@echo Copying formatted docs to ./generated-docs/formatted...
	cp -R $(JS_SDK_ROOT)/generated-docs/formatted/react-wallet-kit ./generated-docs/formatted
	cp -R $(JS_SDK_ROOT)/generated-docs/formatted/core ./generated-docs/formatted

	(cd $(JS_SDK_ROOT) && node $(JS_SDK_ROOT)/typedoc-theme/format-json-output.js \
		--packages react-wallet-kit core \
		--groups React "TypeScript | Frontend")

	@echo Running prettier...
	(cd $(JS_SDK_ROOT) && pnpm run prettier-all:write)

	@echo Copying synced docs.json to root...
	cp $(JS_SDK_ROOT)/generated-docs/docs.json docs.json

	@echo Deleting temporary files...
	rm -rf $(JS_SDK_ROOT)/generated-docs/sdks.json
