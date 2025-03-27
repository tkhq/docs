#!/usr/bin/env node

import { Command } from "commander";
import { dereference } from "@readme/openapi-parser";
import fs from "fs";
import path from "path";
import { OpenAPIParserOptions, OutputOptions } from "./types";

/**
 * Parse and dereference an OpenAPI specification
 */
async function parseOpenAPI(options: OpenAPIParserOptions): Promise<any> {
  try {
    const api = await dereference(options.filePath);
    return api;
  } catch (error: any) {
    throw new Error(`Failed to parse OpenAPI specification: ${error.message}`);
  }
}

/**
 * Output the results to stdout or a file
 */
function outputResults(data: any, options: OutputOptions): void {
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

/**
 * Get a value from an object using a JSON path
 * Simple implementation that supports dot notation
 */
function getByJsonPath(obj: any, path: string): any {
  // For now, a simple implementation that only supports dot notation
  return path.split(".").reduce((o, i) => {
    if (o === undefined) return undefined;
    return o[i];
  }, obj);
}

/**
 * Main function
 */
async function main() {
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
    .parse(process.argv);

  const options = program.opts();

  try {
    // Check if the file exists
    const filePath = path.resolve(options.file);
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      process.exit(1);
    }

    // Parse and dereference the OpenAPI spec
    const api = await parseOpenAPI({ filePath });

    // Output the results
    outputResults(api, {
      outputFile: options.output,
      jsonPath: options.path,
    });
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
