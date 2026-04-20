ROOT := $(shell git rev-parse --show-toplevel)
JS_SDK_ROOT := $(ROOT)/../sdk

.PHONY: openapi-gen gen tags mintlify-check

# Convenience method to start dev server
dev:
	mintlify dev

# Install deps for OpenAPI
install:
	cd scripts/openapi-gen && npm install

# Generate MDX for all APIs (main + auth proxy).
# Requires both swagger files to be present in the repo root — see README for copy commands.
gen: mintlify-check
	npx ts-node scripts/openapi-gen/swagger-to-openapi.ts
	cd scripts/openapi-gen && npx ts-node openapi-gen.ts --file=openapi.json --generate-mdx
	npx ts-node scripts/openapi-gen/swagger-to-openapi.ts --service=auth-proxy
	cd scripts/openapi-gen && npx ts-node openapi-gen.ts \
		--file=proxy_api_openapi.json \
		--generate-mdx \
		--mdx-output-dir=api-reference/auth-proxy \
		--nav-group="Auth Proxy" \
		--auth-proxy

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
	cd $(JS_SDK_ROOT) && \
		SDK_TAG=$$(curl -sI https://github.com/tkhq/sdk/releases/latest | grep -i '^location:' | sed 's|.*/tag/||' | tr -d '\r\n') && \
		echo "Checking out latest SDK release: $$SDK_TAG" && \
		git fetch --tags && \
		git checkout $$SDK_TAG && \
		pnpm run clean-all && \
		pnpm run build-all

	cp docs.json $(JS_SDK_ROOT)/generated-docs

	@mkdir -p ./generated-docs

	@echo Generating docs and formatting output into mdx...
	cd $(JS_SDK_ROOT) && \
		SDK_TAG=$$(git describe --tags --exact-match) && \
		sed -i.bak "s/\"gitRevision\": \"[^\"]*\"/\"gitRevision\": \"$$SDK_TAG\"/" typedoc.json && \
		rm -f typedoc.json.bak && \
		pnpm exec typedoc --options typedoc.json

	cd $(JS_SDK_ROOT) && pnpm exec typedoc --options typedoc.json

	(cd $(JS_SDK_ROOT) && node $(JS_SDK_ROOT)/typedoc-theme/format-json-output.js \
		--packages react-wallet-kit core react-native-wallet-kit \
		--groups React "TypeScript | Frontend" "React Native")

	@echo Running prettier...
	(cd $(JS_SDK_ROOT) && pnpm run prettier-all:write)

	@echo Copying synced docs.json to root...
	cp $(JS_SDK_ROOT)/generated-docs/docs.json docs.json

	@echo Copying formatted docs to ./generated-docs...
	cp -R $(JS_SDK_ROOT)/generated-docs/react-wallet-kit ./generated-docs
	cp -R $(JS_SDK_ROOT)/generated-docs/core ./generated-docs
	cp -R $(JS_SDK_ROOT)/generated-docs/react-native-wallet-kit ./generated-docs

	@echo Copying formatted changelogs to ./changelogs...
	cp -R $(JS_SDK_ROOT)/generated-docs/changelogs .

	@echo Deleting temporary files...
	find $(JS_SDK_ROOT)/generated-docs -mindepth 1 \
		! -name 'docs.json' \
		! -name 'sdk-docs.json' \
		-exec rm -rf {} +
	
	@echo Sync complete! Checking back out main branch in SDK repo...
	cd $(JS_SDK_ROOT) && git checkout main

# Convenience method to sync docs without checking out latest release (e.g. for testing/instant syncing)
# If you want the references to reflect the latest release, update the "packageOptions" in the repo level typedoc.json to have "gitRevision": "<TAG>" and then run this target
.PHONY: sync-sdk-gen-docs-off-main
sync-sdk-gen-docs-off-main:
	@if [ ! -d $(JS_SDK_ROOT) ]; then git clone git@github.com:tkhq/sdk.git $(JS_SDK_ROOT); fi

	cp docs.json $(JS_SDK_ROOT)/generated-docs

	@mkdir -p ./generated-docs

	@echo Generating docs and formatting output into mdx...
	cd $(JS_SDK_ROOT) && pnpm exec typedoc --options typedoc.json

	(cd $(JS_SDK_ROOT) && node $(JS_SDK_ROOT)/typedoc-theme/format-json-output.js \
		--packages react-wallet-kit core react-native-wallet-kit \
		--groups React "TypeScript | Frontend" "React Native")

	@echo Running prettier...
	(cd $(JS_SDK_ROOT) && pnpm run prettier-all:write)

	@echo Copying synced docs.json to root...
	cp $(JS_SDK_ROOT)/generated-docs/docs.json docs.json

	@echo Copying formatted docs to ./generated-docs...
	cp -R $(JS_SDK_ROOT)/generated-docs/react-wallet-kit ./generated-docs
	cp -R $(JS_SDK_ROOT)/generated-docs/core ./generated-docs
	cp -R $(JS_SDK_ROOT)/generated-docs/react-native-wallet-kit ./generated-docs

	@echo Copying formatted changelogs to ./changelogs...
	cp -R $(JS_SDK_ROOT)/generated-docs/changelogs .

	@echo Deleting temporary files...
	find $(JS_SDK_ROOT)/generated-docs -mindepth 1 \
		! -name 'docs.json' \
		! -name 'sdk-docs.json' \
		-exec rm -rf {} +
	
	@echo Sync complete! Checking back out main branch in SDK repo...
	cd $(JS_SDK_ROOT) && git checkout main