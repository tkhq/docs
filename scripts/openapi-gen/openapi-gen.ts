#!/usr/bin/env node

/**
 * OpenAPI Generator
 *
 * This tool parses and dereferences OpenAPI specifications, with the ability
 * to output the full or filtered specification in various formats.
 */

import { parseOpenAPI } from "./utils/parser";
import { parseArguments, CliOptions } from "./utils/cli";
import { outputResults } from "./utils/formatter";
import { handleError } from "./utils/error-handler";
import {
  parseApiEndpoints,
  formatApiEndpoints,
  ApiEndpointParserResult,
} from "./utils/endpoint-parser";
import { generateMdxFile } from "./utils/mdx-generator";
import path from "path";
import fs from "fs";

/**
 * Main function
 */
async function main() {
  try {
    const options: CliOptions = parseArguments(process.argv);
    const api = await parseOpenAPI({ filePath: options.file });

    let endpointResult: ApiEndpointParserResult | null = null;
    // Always parse endpoints if either --endpoints or --generate-mdx is requested,
    // as MDX generation depends on the parsed endpoint data.
    if (options.endpoints || options.generateMdx) {
      endpointResult = parseApiEndpoints(api, {
        requiredPropertiesOnly: options.requiredOnly,
      });
    }

    // --- Determine Output Mode ---

    if (options.generateMdx) {
      // --- MDX Generation Mode ---
      if (!endpointResult) {
        // This should theoretically not happen based on the check above, but safety first.
        throw new Error(
          "Endpoint data is required for MDX generation (--endpoints flag might be needed)."
        );
      }
      console.log(`--- Starting MDX Generation ---`);
      const absoluteMdxOutputDir = path.resolve(
        options.mdxOutputDir || "api-reference-v2"
      );
      console.log(`Output directory: ${absoluteMdxOutputDir}`);
      fs.mkdirSync(absoluteMdxOutputDir, { recursive: true });
      console.log(`Endpoint count: ${endpointResult.endpoints.length}`);
      for (const endpoint of endpointResult.endpoints) {
        generateMdxFile(endpoint, absoluteMdxOutputDir);
      }
      console.log(`--- Finished MDX Generation ---`);

      // If --output is ALSO specified, write the formatted endpoints to that file.
      if (options.output) {
        console.log(
          `Additionally writing formatted endpoints to ${options.output}`
        );
        const endpointFormat =
          options.format === "yaml" ? "json" : options.format; // Default to json if yaml requested
        // formatApiEndpoints handles writing to the file and logging
        formatApiEndpoints(endpointResult, {
          format: endpointFormat,
          outputFile: options.output,
          prettyPrint: true,
        });
      }
    } else if (options.endpoints) {
      // --- Formatted Endpoints Mode (JSON/TypeScript) ---
      if (!endpointResult) {
        // Should not happen
        throw new Error("Endpoint data parsing failed.");
      }
      const endpointFormat =
        options.format === "yaml" ? "json" : options.format; // Default to json if yaml requested

      // formatApiEndpoints handles writing to file (and logging) or returns string for stdout
      const formattedOutput = formatApiEndpoints(endpointResult, {
        format: endpointFormat,
        outputFile: options.output, // Pass output file path if provided
        prettyPrint: true,
      });

      // Only write to stdout if no output file was specified
      if (!options.output) {
        process.stdout.write(formattedOutput);
      }
    } else {
      // --- Raw OpenAPI Spec Mode (JSON/YAML) ---
      if (options.format === "typescript") {
        // Ensure compatible format
        throw new Error(
          "TypeScript format is only supported when using the --endpoints or --generate-mdx flags."
        );
      }
      // outputResults handles writing to file (and logging) or stdout
      outputResults(api, {
        outputFile: options.output,
        jsonPath: options.path,
        format: options.format,
      });
    }
  } catch (error) {
    handleError(error);
  }
}

main().catch(handleError);
