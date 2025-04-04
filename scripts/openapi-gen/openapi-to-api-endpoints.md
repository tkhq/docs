# OpenAPI to API Endpoints Parser

## Overview

This document outlines the implementation of a feature that will parse OpenAPI specifications and generate structured TypeScript interfaces representing API endpoints. The goal is to create a representation that follows the ApiEndpoint type schema, making it easier to generate documentation and client libraries.

## ApiEndpoint Type Schema

The ApiEndpoint type is a structured representation of an API endpoint with the following key components:

```typescript
/**
 * Represents the full specification of an API endpoint in your documentation.
 */
export interface ApiEndpoint {
  title: string;
  path: string;
  method: HttpMethod;
  description: string;
  version?: string;
  type: EndpointType;
  headers?: ApiHeader[];
  pathParams?: ApiParameter[];
  queryParams?: ApiParameter[];
  requestBody?: ApiRequestBody;
  responses: ApiResponse[];
  examples?: ApiExample[];
  documentationLinks?: { text: string; url: string }[];
}
```

Where `HttpMethod` is one of "GET" | "POST" | "PUT" | "PATCH" | "DELETE", and `EndpointType` is either "mutation" or "query" based on the path.

## Implementation Strategy

The implementation will follow these high-level steps:

1. Extend the current OpenAPI parser to extract path and method information
2. Add utilities to convert schema objects to ApiField objects
3. Implement logic to handle versioned intents and results
4. Create functions to map paths to their appropriate endpoint types
5. Add a new command-line option to output the parsed endpoints

### Processing Versioned Endpoints

The OpenAPI specification includes versioned endpoints with the following naming conventions:

- **Intent:** `{camelCaseEndpointName}Intent` for v1, `{camelCaseEndpointName}IntentV2` for v2, etc.
- **Result:** `{camelCaseEndpointName}Result` for v1, `{camelCaseEndpointName}ResultV2` for v2, etc.
- **Activity Type:** `ACTIVITY_TYPE_{SCREAMING_SNAKE_CASE_ENDPOINT_NAME}` for v1, `ACTIVITY_TYPE_{SCREAMING_SNAKE_CASE_ENDPOINT_NAME}_V2` for v2, etc.

For each path in the OpenAPI spec, we will:

1. Extract the endpoint name from the path (e.g., "create_private_keys" from "/public/v1/submit/create_private_keys")
2. Convert to camelCase and append "Intent" to get the base intent name
3. Find all matching intents in the schema
4. Do the same for results and activity types
5. Generate separate ApiEndpoint objects for each version

### Required Utility Functions

1. **String transformations:**

   - `snakeToCamel`: Convert snake_case to camelCase
   - `snakeToScreaming`: Convert snake_case to SCREAMING_SNAKE_CASE

2. **Schema processing:**

   - `schemaToApiField`: Convert OpenAPI schema to ApiField
   - `findVersionedComponents`: Find all versions of a component by prefix
   - `extractEndpointName`: Extract the endpoint name from a path

3. **Type determination:**
   - `determineEndpointType`: Determine if an endpoint is a mutation or query
   - `determineVersion`: Extract version number from component name

## Implementation Phases

### Phase 1: Basic Structure and Utilities

- Define types for the new feature
- Implement string transformation utilities
- Add schema processing helpers for basic field conversion

### Phase 2: Path and Method Extraction

- Extract paths and methods from the OpenAPI spec
- Identify endpoint names and types (mutation/query)
- Create basic ApiEndpoint objects with minimal info

### Phase 3: Schema Conversion

- Implement logic to convert OpenAPI schemas to ApiField objects
- Handle nested objects and array types
- Process enum options

### Phase 4: Version Processing

- Implement logic to identify versioned components
- Match intents, results, and activity types
- Generate separate ApiEndpoint objects for each version

### Phase 5: Integration and Output

- Add CLI option to generate ApiEndpoint objects
- Create formatters for outputting ApiEndpoint objects as JSON or TypeScript
- Integrate with the existing CLI tool

## Challenges and Considerations

1. **Large File Processing:** The OpenAPI spec is large, and efficient processing is necessary
2. **Complex Schema Matching:** Matching versioned components requires careful string manipulation
3. **Nested Field Processing:** Converting nested schemas to ApiField objects with childFields
4. **Output Format:** Determining the best format for the ApiEndpoint output (JSON, TypeScript, etc.)
