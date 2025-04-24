/**
 * Output formatting utilities
 *
 * This module provides functions for formatting and outputting data.
 */

import fs from "fs";
import { OutputOptions } from "../types";
import yaml from "js-yaml";

/**
 * Get a value from an object using a JSON path
 * Enhanced implementation that supports both dot notation and bracket notation
 */
export function getByJsonPath(obj: any, jsonPath?: string): any {
  if (!jsonPath) return obj;

  try {
    // Handle both dot notation (a.b.c) and bracket notation (a[0].b)
    const segments = jsonPath.split(/\.(?![^\[]*\])/);

    return segments.reduce((result, key) => {
      // Handle array indices in bracket notation
      const match = key.match(/([^\[]+)(?:\[([^\]]+)\])?/);
      if (!match) return undefined;

      const [, objKey, indexKey] = match;

      if (result === undefined) return undefined;

      // Handle the base object key
      result = result[objKey];

      // Handle any array index if present
      if (indexKey !== undefined && result !== undefined) {
        // Try to parse as number for array index, but fallback to string key
        const index = !isNaN(Number(indexKey)) ? Number(indexKey) : indexKey;
        result = result[index];
      }

      return result;
    }, obj);
  } catch (error) {
    throw new Error(`Invalid JSON path: ${jsonPath}`);
  }
}

/**
 * Format data for output
 */
export function formatData(data: any, format: string = "json"): string {
  if (format === "yaml") {
    return yaml.dump(data, { noRefs: true });
  }
  // Default to JSON
  return JSON.stringify(data, null, 2);
}

/**
 * Output the results to stdout or a file
 */
export function outputResults(data: any, options: OutputOptions): void {
  try {
    // Get the data to output (full spec or filtered by JSON path)
    const outputData = getByJsonPath(data, options.jsonPath);

    if (outputData === undefined) {
      throw new Error(`JSON path not found: ${options.jsonPath}`);
    }

    // Format the data
    const formattedOutput = formatData(outputData, options.format);

    if (options.outputFile) {
      // Write to file if output file is specified
      fs.writeFileSync(options.outputFile, formattedOutput);
      console.log(`Output written to ${options.outputFile}`);
    } else {
      // Write directly to stdout for piping to other tools
      process.stdout.write(formattedOutput);
    }
  } catch (error: any) {
    throw new Error(`Error formatting output: ${error.message}`);
  }
}
