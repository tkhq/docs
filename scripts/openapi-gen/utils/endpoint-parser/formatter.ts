/**
 * Formatter for ApiEndpoint objects
 */

import { ApiEndpoint, ApiEndpointParserResult } from "./types";
import fs from "fs";

/**
 * Options for formatting ApiEndpoint objects
 */
export interface ApiEndpointFormatterOptions {
  /**
   * Output format - json or typescript
   */
  format?: "json" | "typescript";

  /**
   * Output file path (if not provided, output is returned as a string)
   */
  outputFile?: string;

  /**
   * Whether to pretty print the output (for JSON format)
   */
  prettyPrint?: boolean;
}

/**
 * Default formatter options
 */
const DEFAULT_OPTIONS: ApiEndpointFormatterOptions = {
  format: "json",
  prettyPrint: true,
};

/**
 * Format ApiEndpoint objects as JSON or TypeScript
 */
export function formatApiEndpoints(
  result: ApiEndpointParserResult,
  options: ApiEndpointFormatterOptions = DEFAULT_OPTIONS
): string {
  let output: string;

  // Format the output based on the requested format
  if (options.format === "typescript") {
    output = formatAsTypeScript(result.endpoints);
  } else {
    // Default to JSON format
    output = formatAsJson(result.endpoints, options.prettyPrint);
  }

  // If an output file is specified, write to it
  if (options.outputFile) {
    fs.writeFileSync(options.outputFile, output);
    return `Output written to ${options.outputFile}`;
  }

  // Otherwise, return the formatted string
  return output;
}

/**
 * Format ApiEndpoint objects as JSON
 */
function formatAsJson(endpoints: ApiEndpoint[], prettyPrint = true): string {
  return JSON.stringify(endpoints, null, prettyPrint ? 2 : 0);
}

/**
 * Format ApiEndpoint objects as TypeScript
 */
function formatAsTypeScript(endpoints: ApiEndpoint[]): string {
  // Start with the import
  let output = `/**
 * Generated API Endpoints
 * Auto-generated from OpenAPI specification
 */

import { ApiEndpoint } from '../types';

/**
 * List of all API endpoints
 */
export const API_ENDPOINTS: ApiEndpoint[] = ${JSON.stringify(
    endpoints,
    null,
    2
  )};

/**
 * Map of API endpoints by path
 */
export const API_ENDPOINTS_BY_PATH: Record<string, ApiEndpoint[]> = API_ENDPOINTS.reduce((acc, endpoint) => {
  if (!acc[endpoint.path]) {
    acc[endpoint.path] = [];
  }
  acc[endpoint.path].push(endpoint);
  return acc;
}, {} as Record<string, ApiEndpoint[]>);

/**
 * Map of API endpoints by version
 */
export const API_ENDPOINTS_BY_VERSION: Record<string, ApiEndpoint[]> = API_ENDPOINTS.reduce((acc, endpoint) => {
  const version = endpoint.version || '1';
  if (!acc[version]) {
    acc[version] = [];
  }
  acc[version].push(endpoint);
  return acc;
}, {} as Record<string, ApiEndpoint[]>);
`;

  return output;
}
