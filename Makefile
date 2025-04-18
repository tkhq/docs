.PHONY: openapi-gen gen # Add gen here

# Default MDX generation target
gen:
	cd scripts/openapi-gen && npx ts-node openapi-gen.ts --file=openapi.json --generate-mdx

# Run the OpenAPI generator (allows custom ARGS)
openapi-gen:
	cd scripts/openapi-gen && npx ts-node openapi-gen.ts $(ARGS)