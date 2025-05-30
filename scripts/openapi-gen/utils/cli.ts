/**
 * CLI configuration utilities
 *
 * This module provides functions for configuring the command-line interface.
 */

import { Command } from "commander";

/**
 * Command line argument options interface
 */
export interface CliOptions {
  /**
   * If set, output a list of endpoint names and tags to the specified file
   */
  listEndpointsTags?: string;
  file: string;
  path?: string;
  output?: string;
  format?: "json" | "yaml" | "typescript";
  endpoints?: boolean;
  requiredOnly?: boolean;
  generateMdx?: boolean;
  mdxOutputDir?: string;
  mdxAddOnly?: boolean; // Add the new option
}

/**
 * Configure the command-line interface
 */
export function configureCLI(): Command {
  const program = new Command();

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
    .option(
      "--format <format>",
      "Output format (json or yaml)",
      (value) => {
        if (value !== "json" && value !== "yaml" && value !== "typescript") {
          throw new Error(
            'Format must be either "json", "yaml", or "typescript"'
          );
        }
        return value;
      },
      "json"
    )
    .option(
      "--endpoints",
      "Generate API Endpoint objects instead of raw OpenAPI spec"
    )
    .option(
      "--list-endpoints-tags <outputFile>",
      "Output a JSON list of endpoint names and tags to the given file"
    )
    .option(
      "--required-only",
      "Include only required properties in the generated API Endpoint objects",
      true
    )
    .option("--generate-mdx", "Generate MDX files for each API endpoint")
    .option(
      "--mdx-output-dir <path>",
      "Base directory for generated MDX files",
      "api-reference"
    )
    .option(
      "--mdx-add-only",
      "Only add new MDX files, do not overwrite existing ones",
      false
    );

  return program;
}

/**
 * Parse and validate command line arguments
 */
export function parseArguments(argv: string[]): CliOptions {
  const program = configureCLI();
  program.parse(argv);
  return program.opts() as CliOptions;
}
