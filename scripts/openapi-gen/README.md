# OpenAPI Generator

A utility for parsing, dereferencing, and generating content from OpenAPI specifications.

## Usage

### Options

- `--file, -f`: (Required) Path to the OpenAPI specification file
- `--path`: (Optional) JSON path to a specific element to output (e.g., `components.schemas`)
- `--output, -o`: (Optional) Output file path (defaults to stdout if not specified)

### Commands

- **List Endpoint Tags** (`--list-endpoints-tags <outputFile>`):
  Generate a JSON or MDX snippet of all endpoints with tags. If `<outputFile>` ends with `.mdx`, an MDX file exporting `endpoints` and `tags` arrays is created.
- **Generate MDX** (`--generate-mdx`):
  Write individual MDX files for each endpoint under the target directory (`--mdx-output-dir`).
- **Custom Invocation**:
  ```bash
  # Any combination of flags can be passed:
  npx ts-node openapi-gen.ts --file openapi.json --endpoints --generate-mdx --mdx-output-dir api-reference
  ```

## File Structure

```text
scripts/openapi-gen/
├── openapi-gen.ts           # CLI entrypoint and core logic
├── utils/
│   ├── cli.ts               # Commander-based argument parsing
│   ├── parser.ts            # OpenAPI spec parsing & dereferencing
│   ├── formatter.ts         # JSON/YAML formatter
│   ├── endpoint-parser/
│   │   ├── types.ts         # Type definitions for ApiEndpoint
│   │   └── parser.ts        # Logic to extract and tag endpoints
│   └── mdx-generator/
│       └── generator.ts     # Generates MDX files per endpoint
├── package.json             # Dependencies for CLI (commander, ts-node)
└── tsconfig.json             # TypeScript configuration
``` 

## Generated Outputs

The tool produces or updates these files/directories:

- `endpoints-tags.json` or `snippets/data/endpoint-tags.mdx`: list of endpoints + tags.
- MDX files under `api-reference/` (default) when using `--generate-mdx`.
- Any existing MDX files can be optionally preserved with `--mdx-add-only`.

**Warning:** Running these commands may overwrite existing files. Review diff before committing.

## Maintenance Notes

- **Contribution:** Please update this README and `Makefile` when adding new CLI flags or output modes.
