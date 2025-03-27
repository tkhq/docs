# OpenAPI Generator

A utility for parsing, dereferencing, and generating content from OpenAPI specifications.

## Usage

```bash
# Parse and output the entire OpenAPI spec
make openapi-gen ARGS="--file=path/to/openapi.json"

# Parse and output a specific part of the OpenAPI spec
make openapi-gen ARGS="--file=path/to/openapi.json --path=components.schemas"

# Save the output to a file
make openapi-gen ARGS="--file=path/to/openapi.json --output=output.json"

# Pipe the output to jq for further processing
make openapi-gen ARGS="--file=path/to/openapi.json" | jq '.info.title'
```

## Options

- `--file, -f`: (Required) Path to the OpenAPI specification file
- `--path`: (Optional) JSON path to a specific element to output (e.g., `components.schemas`)
- `--output, -o`: (Optional) Output file path (defaults to stdout if not specified)
