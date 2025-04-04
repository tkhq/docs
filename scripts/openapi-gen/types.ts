/**
 * Common type definitions for the OpenAPI generator
 */

/**
 * Options for parsing an OpenAPI specification
 */
export interface OpenAPIParserOptions {
  /** Path to the OpenAPI specification file */
  filePath: string;
}

/**
 * Options for output formatting
 */
export interface OutputOptions {
  /** Optional file path for output (stdout if not specified) */
  outputFile?: string;
  /** Optional JSON path to filter the output */
  jsonPath?: string;
  /** Output format (json or yaml) */
  format?: 'json' | 'yaml';
}
