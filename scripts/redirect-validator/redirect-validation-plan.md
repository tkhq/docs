# Redirect Validation Utility - Detailed Implementation Plan

## Overview

This utility will validate the redirect configurations in `vercel.json` by ensuring that each redirect's source path leads to the correct final destination without any dead ends or incorrect mappings.

## Technical Specifications

### Language and Environment

- **Programming Language**: TypeScript
- **Execution Environment**: Node.js
- **Orchestration**: Makefile for easy execution

### Dependencies

- TypeScript for type safety
- Node.js built-in libraries for file operations
- Node.js built-in fetch API for HTTP requests and redirect following
- ts-node for TypeScript execution without compilation step

## Implementation Details

### 1. Parsing the Vercel Configuration

- Read and parse the `vercel.json` file
- Extract the redirects array
- Create a map from source paths to destination paths

```typescript
interface Redirect {
  source: string;
  destination: string;
  permanent: boolean;
}

interface RedirectMap {
  [sourcePath: string]: {
    destination: string;
    permanent: boolean;
  };
}
```

### 2. Building Redirect Chains

- Identify if a destination is also a source for another redirect
- Construct chains of redirects until reaching a final destination
- Handle path parameters (e.g., `:page`) appropriately

```typescript
interface RedirectChain {
  sourcePath: string;
  steps: {
    path: string;
    type: "source" | "intermediate" | "destination";
  }[];
  finalDestination: string;
}
```

### 3. Validation Process

- For each source path:
  - Follow the redirect chain using fetch API with { redirect: 'manual' } to handle redirects programmatically
  - Validate that each step is properly configured
  - Check for circular redirects
  - Verify the final destination exists (if possible)
- Report any issues found during validation

### 4. Reporting

- Generate a comprehensive report including:
  - Total number of redirects
  - Number of valid redirects
  - Number of invalid redirects
  - Details of each invalid redirect
  - Suggestions for fixing issues

## Implementation Phases

### Phase 1: Setup

- Create the TypeScript script file structure
- Configure the development environment
- Set up the Makefile task

### Phase 2: Core Functionality

- Implement the configuration parser
- Build the redirect chain resolver
- Create the validation logic

### Phase 3: Execution and Reporting

- Implement the execution flow
- Create the reporting mechanism
- Format and present results

### Phase 4: Testing and Refinement

- Test with various configurations
- Handle edge cases
- Refine the validation and reporting

## File Structure

```
scripts/
  └── redirect-validator/
      ├── redirect-validator.ts     # Main script
      ├── types.ts                  # Type definitions
      └── utils/
          ├── parser.ts             # Vercel config parser
          ├── chain-builder.ts      # Redirect chain construction
          ├── validator.ts          # Validation logic
          └── reporter.ts           # Report generation
```

## Makefile Integration

Add a command to the Makefile to easily run the validation:

```makefile
validate-redirects:
	npx ts-node scripts/redirect-validator/redirect-validator.ts
```

## Success Criteria

1. The script can parse the vercel.json file correctly
2. It builds accurate redirect chains
3. It identifies problematic redirects
4. It provides clear and actionable reports
5. It can be easily run as part of a development workflow
