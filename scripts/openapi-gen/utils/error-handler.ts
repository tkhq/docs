/**
 * Error handling utilities
 *
 * This module provides functions for handling errors and setting exit codes.
 */

/**
 * Error types with associated exit codes
 */
export enum ErrorType {
  FILE_NOT_FOUND = 1,
  PARSE_ERROR = 2,
  PATH_ERROR = 3,
  OUTPUT_ERROR = 4,
  UNKNOWN_ERROR = 99,
}

/**
 * Handle error and exit with appropriate code
 */
export function handleError(error: any): never {
  const message = error.message || "Unknown error occurred";

  // Determine the error type and exit code
  let exitCode = ErrorType.UNKNOWN_ERROR;

  if (message.includes("File not found")) {
    exitCode = ErrorType.FILE_NOT_FOUND;
  } else if (message.includes("Failed to parse")) {
    exitCode = ErrorType.PARSE_ERROR;
  } else if (
    message.includes("JSON path not found") ||
    message.includes("Invalid JSON path")
  ) {
    exitCode = ErrorType.PATH_ERROR;
  } else if (message.includes("Error formatting output")) {
    exitCode = ErrorType.OUTPUT_ERROR;
  }

  // Log the error message
  console.error(`Error: ${message}`);

  // Exit with the appropriate code
  process.exit(exitCode);
}
