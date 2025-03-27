# OpenAPI Generator - Detailed Implementation Plan

## Overview

This utility will parse and dereference OpenAPI specification files, with the initial goal of displaying a portion of the dereferenced spec for evaluation. The later goal will be to generate content based on the API specification.

## Technical Specifications

### Language and Environment

- **Programming Language**: TypeScript
- **Execution Environment**: Node.js
- **Orchestration**: Makefile for easy execution

### Dependencies

- TypeScript for type safety
- `@readme/openapi-parser` for parsing and dereferencing OpenAPI specifications
- `commander` for CLI argument parsing
- Node.js built-in libraries for file operations
- ts-node for TypeScript execution without compilation step

## Implementation Details

### 1. Parsing and Dereferencing

- Read and parse the OpenAPI JSON/YAML file
- Use `@readme/openapi-parser` to dereference the specification
- Handle path and external references appropriately
- Manage errors during the parsing and dereferencing process

```typescript
interface OpenAPIParserOptions {
  filePath: string;
}

async function parseOpenAPI(options: OpenAPIParserOptions): Promise<any> {
  try {
    const api = await dereference(options.filePath);
    return api;
  } catch (error) {
    throw new Error(`Failed to parse OpenAPI specification: ${error.message}`);
  }
}
```

### 2. CLI Interface

- Create a command-line interface using Commander
- Accept the file path as a required argument
- Support optional arguments for controlling output
- Add help and version information

```typescript
program
  .name("openapi-gen")
  .description("OpenAPI specification parser and content generator")
  .version("0.1.0")
  .requiredOption("-f, --file <path>", "Path to OpenAPI specification file")
  .option("--path <jsonPath>", "JSON path to specific element to output")
  .option(
    "-o, --output <filepath>",
    "Output file path (stdout if not specified)"
  )
  .parse(process.argv);
```

### 3. Output Generation

- Implement output formatting for the console
- Allow filtering of output by JSON path
- Format the output for readability
- Support direct output to stdout for piping to other tools (like jq)
- Provide file output option for saving results

```typescript
function outputResults(
  data: any,
  options: { outputFile?: string; jsonPath?: string }
) {
  // Get the data to output (full spec or filtered by JSON path)
  const outputData = options.jsonPath
    ? getByJsonPath(data, options.jsonPath)
    : data;

  // Format the data as JSON string
  const formattedOutput = JSON.stringify(outputData, null, 2);

  if (options.outputFile) {
    // Write to file if output file is specified
    fs.writeFileSync(options.outputFile, formattedOutput);
    console.log(`Output written to ${options.outputFile}`);
  } else {
    // Write directly to stdout for piping to other tools
    process.stdout.write(formattedOutput);
  }
}
```

### 4. Error Handling

- Comprehensive error handling for file operations and parsing
- Provide clear error messages for common issues
- Set appropriate exit codes for automation

## File Structure

```
scripts/
  └── openapi-gen/
      ├── openapi-gen.ts       # Main script entry point
      ├── package.json         # Dependencies and scripts
      ├── tsconfig.json        # TypeScript configuration
      ├── README.md            # Documentation
      ├── types.ts             # Type definitions
      └── utils/
          ├── parser.ts        # OpenAPI parsing utilities
          ├── cli.ts           # CLI configuration
          ├── formatter.ts     # Output formatting
          └── error-handler.ts # Error handling utilities
```

## Makefile Integration

Add a command to the Makefile to easily run the OpenAPI generator:

```makefile
openapi-gen:
	cd scripts/openapi-gen && npx ts-node openapi-gen.ts $(ARGS)
```

## Implementation Plan

### Phase 1: Project Setup

- Create the directory structure
- Initialize package.json
- Add dependencies: @readme/openapi-parser, commander, typescript, ts-node
- Configure TypeScript with tsconfig.json
- Create initial entry point file
- Add to Makefile

### Phase 2: Core Functionality

- Implement file reading functionality
- Add basic OpenAPI spec parsing
- Create simple console output for testing
- Implement basic error handling
- Implement command-line argument parsing with Commander
- Add required and optional arguments
- Create help documentation
- Integrate CLI with parser functionality

### Phase 3: Output Formatting

- Implement JSON output formatting
- Create pretty-printing for console output
- Add filtering capabilities for specific parts of the spec
- Implement stdout output for piping to other tools
- Add file output option

### Phase 4: Error Handling and Refinement

- Enhance error handling with specific error types
- Implement proper exit codes
- Improve performance for large specifications

### Phase 5: Testing and Documentation

- Test with various OpenAPI specifications
- Test piping output to jq and other tools
- Create README with usage instructions
- Add examples for common use cases
- Document extension points for future development

### Phase 6: Future Planning

- Outline plan for content generation
- Design template system
- Identify output formats
- Plan for integration with other tools

## Success Criteria

1. The CLI tool accepts an OpenAPI specification file path and successfully parses it
2. All references in the OpenAPI specification are properly dereferenced
3. The tool can output specific portions of the API specification
4. Output can be directed to stdout for piping to tools like jq
5. Output can be saved to a file if specified
6. Error handling is robust and provides clear messages
7. The tool can be easily executed via the Makefile
8. The code is well-structured and maintainable for future extensions
