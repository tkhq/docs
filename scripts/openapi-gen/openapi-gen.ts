#!/usr/bin/env node

/**
 * OpenAPI Generator
 * 
 * This tool parses and dereferences OpenAPI specifications, with the ability
 * to output the full or filtered specification in various formats.
 */

import { parseOpenAPI } from "./utils/parser";
import { parseArguments } from "./utils/cli";
import { outputResults } from "./utils/formatter";
import { handleError } from "./utils/error-handler";
import { parseApiEndpoints, formatApiEndpoints } from "./utils/endpoint-parser";

/**
 * Main function
 */
async function main() {
  try {
    // Parse command line arguments
    const options = parseArguments(process.argv);
    
    // Parse and dereference the OpenAPI spec
    const api = await parseOpenAPI({ filePath: options.file });
    
    // Check if we should generate API Endpoint objects
    if (options.endpoints) {
      // Parse the API endpoints
      const endpointResult = parseApiEndpoints(api, {
        requiredPropertiesOnly: options.requiredOnly
      });
      
      // Format the endpoints
      const formattedOutput = formatApiEndpoints(endpointResult, {
        format: options.format,
        outputFile: options.output,
        prettyPrint: true
      });
      
      // If there's no output file, print to stdout
      if (!options.output) {
        process.stdout.write(formattedOutput);
      }
    } else {
      // Output the raw OpenAPI spec
      outputResults(api, {
        outputFile: options.output,
        jsonPath: options.path,
        format: options.format
      });
    }
  } catch (error) {
    // Handle errors with appropriate exit codes
    handleError(error);
  }
}

// Run the main function
main().catch(handleError);
