# Redirect Validator

A utility for validating redirect configurations in the Turnkey documentation platform. This tool helps ensure that all redirects are properly configured and point to valid destinations.

## Overview

The redirect validator performs several key validation tasks:

1. **Configuration Consistency**: Validates that redirects are consistently defined between `vercel.json` and `docs.json`
2. **Destination Validation**: Confirms that redirect destinations map to actual paths in the navigation structure
3. **Redirect Chain Validation**: Verifies that redirect chains correctly resolve to final destinations
4. **Fix Mode**: Optionally generates suggestions to fix inconsistencies

## Directory Structure

```
redirect-validator/
├── docs-redirect-validator.ts     # Main script for docs-specific validation
├── redirect-validator.ts          # General redirect validation utility
├── types.ts                       # TypeScript type definitions
├── utils/                         # Utility functions
│   ├── parser.ts                  # Config parsing utilities
│   ├── chain-builder.ts           # Redirect chain construction
│   ├── validator.ts               # Validation logic
│   └── reporter.ts                # Report generation
├── package.json                   # Dependencies and configuration
└── tsconfig.json                  # TypeScript configuration
```

## Installation

The validator requires Node.js (v16 or higher) and TypeScript.

```bash
cd scripts/redirect-validator
npm install
```

## Usage

### Basic Redirect Validation

This validates redirects defined in `vercel.json` by ensuring redirect chains resolve correctly:

```bash
npx ts-node redirect-validator.ts
```

Options:

- `--base-url=<url>` - Specify the base URL for checking destinations (default: https://docs.turnkey.com)
- `--check-destinations=<true|false>` - Enable/disable checking if destinations exist (default: false)

### Docs-Specific Validation

This validates consistency between `vercel.json` and `docs.json` redirects, and checks navigation paths:

```bash
npx ts-node docs-redirect-validator.ts
```

Options:

- `--no-destinations` - Skip destination validation against navigation paths
- `--no-consistency` - Skip consistency checking between vercel.json and docs.json
- `--fix` - Generate suggestions to fix inconsistencies

## Output

The tools generate detailed reports in Markdown format:

- `redirect-validation-report.md` - Report for general redirect validation
- `redirect-comparison-report.md` - Report for comparison between config files
- `destination-validation-report.md` - Report for invalid destinations
- When using fix mode, suggestions are saved to `missing-redirects.md`

## Examples

### Validate all redirects with destination checking

```bash
npx ts-node redirect-validator.ts --check-destinations=true
```

### Run docs validation and generate fixes

```bash
npx ts-node docs-redirect-validator.ts --fix
```

### Run only consistency checking

```bash
npx ts-node docs-redirect-validator.ts --no-destinations
```

## Validation Logic

The validator performs several types of checks:

1. **Redirect Map Creation**: Builds a map of source paths to destination paths
2. **Chain Building**: Identifies chains of redirects that lead to final destinations
3. **Path Validation**: Checks if destination paths exist in the navigation structure
4. **Consistency Checking**: Ensures redirects are consistently defined in both config files
5. **Fix Generation**: Creates suggested fixes for inconsistencies

## Contributing

When modifying this tool, please update the types in `types.ts` as needed to maintain type safety throughout the codebase.
