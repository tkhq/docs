.PHONY: openapi-gen gen tags

# Default MDX generation target
gen:
	cd scripts/openapi-gen && npx ts-node openapi-gen.ts --file=openapi.json --generate-mdx

# Run the OpenAPI generator (allows custom ARGS)
openapi-gen:
	cd scripts/openapi-gen && npx ts-node openapi-gen.ts $(ARGS)

tags:
	cd scripts/openapi-gen && npx ts-node openapi-gen.ts --file=openapi.json --list-endpoints-tags ../snippets/data/endpoint-tags.mdx