/**
 * OpenAPI parsing utilities
 *
 * This module provides functions for parsing and dereferencing OpenAPI specifications.
 */

import fs from "fs";
import path from "path";
import { OpenAPIParserOptions } from "../types";
import * as OpenAPIParser from "@readme/openapi-parser";

/**
 * Validates if a file exists and is accessible
 */
export function validateFile(filePath: string): string {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`File not found: ${resolvedPath}`);
  }
  return resolvedPath;
}

/**
 * Parse and dereference an OpenAPI specification
 */
export async function parseOpenAPI(
  options: OpenAPIParserOptions
): Promise<any> {
  try {
    // Validate file exists before attempting to parse
    const resolvedPath = validateFile(options.filePath);

    // Read the file content
    const fileContent = fs.readFileSync(resolvedPath, "utf8");

    // Parse the JSON content
    const jsonContent = JSON.parse(fileContent);

    // Dereference the parsed JSON
    const api = await OpenAPIParser.default.dereference(jsonContent);

    return api;
  } catch (error: any) {
    // Enhance error message to provide more context
    const errorMessage = error.message || "Unknown error";
    throw new Error(`Failed to parse OpenAPI specification: ${errorMessage}`);
  }
}
