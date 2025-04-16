/**
 * Type definitions for API endpoints
 */

/**
 * Supported HTTP methods for endpoints.
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Data types that a field can have.
 */
export type DataType =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "object"
  | "enum"
  | "datetime";

/**
 * Represents an option for enum fields.
 */
export interface EnumOption {
  value: string;
  description?: string;
}

/**
 * Represents a header required by the API endpoint.
 */
export interface ApiHeader {
  name: string;
  type: DataType;
  required: boolean;
  description: string;
  example?: string;
}

/**
 * Represents a parameter, which can be in the path, query, or header.
 */
export interface ApiParameter {
  name: string;
  in: "query" | "path" | "header";
  type: DataType;
  required: boolean;
  description: string;
  example?: string;
}

/**
 * Represents a single field in the request body or response body.
 */
export interface ApiField {
  name: string;
  type: DataType;
  required: boolean;
  description: string;

  /**
   * Default value for this field, if any.
   */
  defaultValue?: string;

  /**
   * Example value to display in documentation.
   */
  example?: string;

  /**
   * Enum options, if the type is 'enum'.
   */
  enumOptions?: EnumOption[];

  /**
   * Child fields if the type is 'object' or 'array'.
   * This allows you to represent nested structures.
   */
  childFields?: ApiField[];
}

/**
 * Represents the body structure for an API request.
 */
export interface ApiRequestBody {
  contentType:
    | "application/json"
    | "multipart/form-data"
    | "application/x-www-form-urlencoded";
  fields: ApiField[];
}

/**
 * Represents a single possible response from the API, with a status code
 * and a set of fields (if applicable).
 */
export interface ApiResponse {
  statusCode: number;
  contentType: "application/json" | "text/plain" | "application/xml";

  /**
   * Fields that describe the structure of this response, if any.
   */
  fields?: ApiField[];

  /**
   * A sample of what this response might look like.
   */
  example?: object | string;
}

/**
 * Represents a code example for a specific endpoint.
 */
export interface ApiExample {
  format: "curl" | "http" | "javascript" | "python";
  exampleCode: string;
}

/**
 * Endpoint type based on path analysis
 * - if the path contains `submit`, it is a mutation
 * - if the path contains `query` it is a query
 */
export type EndpointType = "activity" | "query";

/**
 * Represents the full specification of an API endpoint in your documentation.
 */
export interface ApiEndpoint {
  // paths.[path].[method].summary
  title: string;
  path: string;
  method: HttpMethod;
  // paths.[path].[method].description
  description: string;
  // Version extracted from intent name
  // createPrivateKeysIntent => version = "1"
  // createPrivateKeysIntentV2 => version = "2"
  version?: string;
  type: EndpointType;

  /**
   * Headers required by this endpoint.
   */
  headers?: ApiHeader[];

  /**
   * Path parameters (e.g., /users/{id}).
   */
  pathParams?: ApiParameter[];

  /**
   * Query parameters (e.g., ?limit=10).
   */
  queryParams?: ApiParameter[];

  /**
   * The request body definition, if this endpoint expects a body.
   */
  requestBody?: ApiRequestBody;

  /**
   * Possible responses this endpoint can return.
   */
  responses: ApiResponse[];

  /**
   * One or more usage examples for this endpoint.
   */
  examples?: ApiExample[];

  /**
   * Links to relevant documentation pages.
   */
  documentationLinks?: { text: string; url: string }[];
}

/**
 * Options for parsing OpenAPI to ApiEndpoint
 */
export interface ApiEndpointParserOptions {
  /**
   * Whether to include only required properties in the ApiEndpoint objects
   */
  requiredPropertiesOnly?: boolean;
}

/**
 * Result of endpoint parsing operation
 */
export interface ApiEndpointParserResult {
  /**
   * List of parsed API endpoints
   */
  endpoints: ApiEndpoint[];
}
