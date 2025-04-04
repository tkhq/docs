/**
 * String utility functions for endpoint processing
 */

/**
 * Converts a snake_case string to camelCase
 * Example: "create_private_keys" -> "createPrivateKeys"
 */
export function snakeToCamel(input: string): string {
  return input.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

/**
 * Converts a snake_case string to SCREAMING_SNAKE_CASE
 * Example: "create_private_keys" -> "CREATE_PRIVATE_KEYS"
 */
export function snakeToScreaming(input: string): string {
  return input.toUpperCase();
}

/**
 * Extracts the endpoint name from a path
 * Example: "/public/v1/submit/create_private_keys" -> "create_private_keys"
 */
export function extractEndpointName(path: string): string {
  // Get the last segment of the path
  const segments = path.split("/").filter((segment) => segment.length > 0);
  return segments[segments.length - 1];
}

/**
 * Determines if a path is a mutation or query endpoint
 * - If path contains "submit", it's a mutation
 * - If path contains "query", it's a query
 */
export function determineEndpointType(path: string): "mutation" | "query" {
  if (path.includes("/submit/")) {
    return "mutation";
  } else if (path.includes("/query/")) {
    return "query";
  }

  // Default to mutation if we can't determine from path
  return "mutation";
}

/**
 * Extracts the version number from a component name
 * Examples:
 * "createPrivateKeysIntent" -> "1"
 * "createPrivateKeysIntentV2" -> "2"
 */
export function extractVersionFromComponent(componentName: string): string {
  const versionMatch = componentName.match(/V(\d+)$/);
  return versionMatch ? versionMatch[1] : "1";
}

/**
 * Creates the base intent name for an endpoint
 * Example: "create_private_keys" -> "createPrivateKeysIntent"
 */
export function createIntentBaseName(endpointName: string): string {
  return `${snakeToCamel(endpointName)}Intent`;
}

/**
 * Creates the base result name for an endpoint
 * Example: "create_private_keys" -> "createPrivateKeysResult"
 */
export function createResultBaseName(endpointName: string): string {
  return `${snakeToCamel(endpointName)}Result`;
}

/**
 * Creates the activity type for an endpoint
 * Example: "create_private_keys" -> "ACTIVITY_TYPE_CREATE_PRIVATE_KEYS"
 */
export function createActivityType(endpointName: string): string {
  return `ACTIVITY_TYPE_${snakeToScreaming(endpointName)}`;
}

/**
 * Checks if a string starts with a given prefix
 */
export function startsWith(str: string, prefix: string): boolean {
  return str.indexOf(prefix) === 0;
}
