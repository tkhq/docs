/**
 * API Endpoint Parser
 *
 * Parses OpenAPI specification and converts it to ApiEndpoint objects
 */

import {
  ApiEndpoint,
  ApiEndpointParserOptions,
  ApiEndpointParserResult,
  ApiField,
  ApiRequestBody,
  ApiResponse,
  DataType,
  EndpointType,
  HttpMethod,
  EnumOption,
} from "./types";

import {
  snakeToCamel,
  snakeToScreaming,
  extractEndpointName,
  determineEndpointType,
  extractVersionFromComponent,
  createIntentBaseName,
  createResultBaseName,
  createActivityType,
  startsWith,
} from "./string-utils";

/**
 * Default parser options
 */
const DEFAULT_OPTIONS: ApiEndpointParserOptions = {
  requiredPropertiesOnly: true,
};

/**
 * Main function to parse an OpenAPI spec and generate ApiEndpoint objects
 */
export function parseApiEndpoints(
  openApiSpec: any,
  options: ApiEndpointParserOptions = DEFAULT_OPTIONS
): ApiEndpointParserResult {
  const endpoints: ApiEndpoint[] = [];

  try {
    // Get paths from the spec
    const paths = openApiSpec.paths || {};

    // Process each path
    for (const [path, pathItem] of Object.entries(paths)) {
      // Process each HTTP method for this path
      for (const [method, operationObj] of Object.entries(
        pathItem as Record<string, any>
      )) {
        // Skip if not a valid HTTP method
        if (!isHttpMethod(method)) continue;

        const operation = operationObj as Record<string, any>;

        // Get basic endpoint info
        const endpointName = extractEndpointName(path);
        const endpointType = determineEndpointType(path);

        // --- Common Endpoint Properties ---
        const baseEndpointInfo = {
          title: operation.summary || "",
          path,
          method: method as HttpMethod,
          description: operation.description || "",
          type: endpointType,
        };

        let requestBody: ApiRequestBody | undefined = undefined;
        if (operation.requestBody?.content?.["application/json"]?.schema) {
          const requestBodySchema =
            operation.requestBody.content["application/json"].schema;
          requestBody = {
            contentType: "application/json",
            fields: parseSchemaToApiFields(requestBodySchema),
          };
        }

        let pathParams: any[] = [];
        let queryParams: any[] = [];
        if (operation.parameters && Array.isArray(operation.parameters)) {
          for (const param of operation.parameters) {
            if (param.in === "path") {
              pathParams.push(parameterToApiParameter(param));
            } else if (param.in === "query") {
              queryParams.push(parameterToApiParameter(param));
            }
            // Header params could be added here if needed
          }
        }

        // --- Type-Specific Logic ---
        if (endpointType === "query") {
          // --- Handle Query Endpoints ---
          const endpoint: ApiEndpoint = {
            ...baseEndpointInfo,
            requestBody, // Add parsed request body
            tags: operation.tags || [],
            pathParams: pathParams.length > 0 ? pathParams : undefined,
            queryParams: queryParams.length > 0 ? queryParams : undefined,
            responses: parseResponsesFromOperation(operation.responses), // Use helper for responses
            version: undefined, // Queries might not have explicit versions in the same way
          };
          endpoints.push(endpoint);
        } else {
          // --- Handle Activity Endpoints (Existing Logic) ---
          // Find versioned components
          const intentBaseName = createIntentBaseName(endpointName);
          const resultBaseName = createResultBaseName(endpointName);
          const activityTypeBase = createActivityType(endpointName);
          const typeEnum = findActivityTypeEnum(openApiSpec, activityTypeBase);
          const intents = findVersionedComponents(
            openApiSpec,
            "intent",
            intentBaseName
          );
          const results = findVersionedComponents(
            openApiSpec,
            "result",
            resultBaseName
          );
          const versionedComponents = matchVersionedComponents(
            typeEnum,
            intents,
            results
          );

          // Create ApiEndpoint for each matched version
          for (const component of versionedComponents) {
            const intentSchema = getComponentSchema(
              openApiSpec,
              "Intent",
              component.intentName
            );
            const resultSchema = getComponentSchema(
              openApiSpec,
              "Result",
              component.resultName
            );

            // Create basic endpoint structure for this version
            const endpoint: ApiEndpoint = {
              ...baseEndpointInfo,
              tags: operation.tags || [],
              description: operation.description || "",
              version: component.version,
              requestBody, // Add parsed request body
              pathParams: pathParams.length > 0 ? pathParams : undefined,
              queryParams: queryParams.length > 0 ? queryParams : undefined,
              responses: [
                {
                  statusCode: 200,
                  contentType: "application/json",
                  description: "Successful activity response", // Add description
                  fields: [
                    {
                      name: "activity",
                      type: "object",
                      required: true,
                      description:
                        "The activity object containing type, intent, and result",
                      childFields: [
                        {
                          name: "type",
                          type: "string",
                          required: true,
                          description: "The activity type",
                          defaultValue: component.activityType,
                        },
                        {
                          name: "intent",
                          type: "object",
                          required: true,
                          description: "The intent of the activity",
                          childFields: [
                            {
                              name: component.intentName,
                              type: "object",
                              required: true,
                              description: `The ${component.intentName} object`,
                              childFields: intentSchema
                                ? parseSchemaProperties(intentSchema)
                                : [],
                            },
                          ],
                        },
                        {
                          name: "result",
                          type: "object",
                          required: true,
                          description: "The result of the activity",
                          childFields: resultSchema
                            ? [
                                {
                                  name: component.resultName,
                                  type: "object",
                                  required: true,
                                  description: `The ${component.resultName} object`,
                                  childFields: parseSchemaProperties(resultSchema),
                                },
                              ]
                            : [
                                {
                                  name: "activity",
                                  type: "object",
                                  required: true,
                                  description: "The activity result object",
                                  childFields: [
                                    {
                                      name: "id",
                                      type: "string",
                                      required: true,
                                      description: "The activity ID",
                                    },
                                    {
                                      name: "status",
                                      type: "string",
                                      required: true,
                                      description: "The activity status",
                                    },
                                    {
                                      name: "type",
                                      type: "string",
                                      required: true,
                                      description: "The activity type",
                                    },
                                    {
                                      name: "organizationId",
                                      type: "string",
                                      required: true,
                                      description: "The organization ID",
                                    },
                                    {
                                      name: "timestampMs",
                                      type: "string",
                                      required: true,
                                      description: "The activity timestamp",
                                    },
                                  ],
                                },
                              ],
                        },
                      ],
                    },
                  ],
                },
                // Potentially add other standard responses (e.g., 4xx, 5xx) if defined elsewhere
              ],
            };
            endpoints.push(endpoint);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error parsing API endpoints:", error);
    // Re-throw or handle more gracefully depending on desired behavior
    throw error;
  }

  return { endpoints };
}

/**
 * Converts an OpenAPI parameter to ApiParameter
 */
function parameterToApiParameter(param: any): any {
  return {
    name: param.name,
    in: param.in,
    type: mapOpenApiTypeToDataType(param.schema?.type || "string"),
    required: !!param.required,
    description: param.description || "",
    example: param.example || undefined,
  };
}

/**
 * Gets a component schema from the OpenAPI spec
 */
function getComponentSchema(
  openApiSpec: any,
  componentType: string,
  componentName: string
): any | null {
  try {
    const schema = openApiSpec.components?.schemas?.[componentType];
    if (schema?.properties?.[componentName]) {
      return schema.properties[componentName];
    }
  } catch (error) {
    console.error(`Error getting component schema: ${error}`);
  }
  return null;
}

/**
 * Parse schema properties into ApiField array
 */
function parseSchemaProperties(schema: any): ApiField[] {
  const fields: ApiField[] = [];
  if (!schema || !schema.properties) {
    return fields;
  }

  const requiredFields = new Set(schema.required || []);

  for (const [name, propSchema] of Object.entries(schema.properties)) {
    fields.push(schemaToApiField(name, propSchema, requiredFields.has(name)));
  }
  return fields;
}

/**
 * Parse a schema into an array of ApiField objects
 */
function parseSchemaToApiFields(schema: any): ApiField[] {
  if (schema.type === "object") {
    return parseSchemaProperties(schema);
  } else if (schema.type === "array" && schema.items) {
    // For array types, represent as a single field with array type
    return [
      {
        name: "items",
        type: "array",
        required: true,
        description: schema.description || "Array items",
        childFields:
          schema.items.type === "object"
            ? parseSchemaProperties(schema.items)
            : [schemaToApiField("item", schema.items, true)],
      },
    ];
  } else {
    // For primitive types
    return [
      {
        name: "value",
        type: mapOpenApiTypeToDataType(schema.type),
        required: true,
        description: schema.description || "",
        ...(schema.enum ? { enumOptions: createEnumOptions(schema.enum) } : {}),
      },
    ];
  }
}

/**
 * Create EnumOption array from enum values
 */
function createEnumOptions(enumValues: string[]): EnumOption[] {
  return enumValues.map((value) => ({
    value,
    description: `${value} option`,
  }));
}

/**
 * Convert OpenAPI schema to ApiField
 */
function schemaToApiField(
  name: string,
  schema: any,
  required: boolean
): ApiField {
  const dataType = mapOpenApiTypeToDataType(schema.type);

  const field: ApiField = {
    name,
    type: dataType,
    required,
    description: schema.description || `${name} field`,
  };

  // Add example if available
  if (schema.example !== undefined) {
    field.example =
      typeof schema.example === "object"
        ? JSON.stringify(schema.example)
        : String(schema.example);
  }

  // Add default value if available
  if (schema.default !== undefined) {
    field.defaultValue =
      typeof schema.default === "object"
        ? JSON.stringify(schema.default)
        : String(schema.default);
  }

  // Handle enum type
  if (schema.enum && Array.isArray(schema.enum)) {
    field.type = "enum";
    field.enumOptions = createEnumOptions(schema.enum);
  }

  // Handle nested objects
  if (dataType === "object" && schema.properties) {
    field.childFields = parseSchemaProperties(schema);
  }

  // Handle arrays
  if (dataType === "array" && schema.items) {
    if (schema.items.type === "object") {
      field.childFields = parseSchemaProperties(schema.items);
    } else {
      field.childFields = [schemaToApiField("item", schema.items, true)];
    }
  }

  return field;
}

/**
 * Map OpenAPI type to DataType
 */
function mapOpenApiTypeToDataType(openApiType: string): DataType {
  switch (openApiType) {
    case "string":
      return "string";
    case "integer":
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "array":
      return "array";
    case "object":
      return "object";
    default:
      return "string"; // Default to string for unknown types
  }
}

/**
 * Checks if a string is a valid HTTP method
 */
function isHttpMethod(method: string): method is HttpMethod {
  return ["get", "post", "put", "patch", "delete"].includes(
    method.toLowerCase()
  );
}

/**
 * Finds all activity types that match the given base
 */
function findActivityTypeEnum(
  openApiSpec: any,
  activityTypeBase: string
): string[] {
  const activityTypes: string[] = [];

  try {
    // Find the components.schemas.ActivityType schema
    const activityTypeSchema = openApiSpec.components?.schemas?.ActivityType;

    if (activityTypeSchema?.enum) {
      // Filter enum values that start with the activity type base
      activityTypes.push(
        ...activityTypeSchema.enum.filter((type: string) =>
          startsWith(type, activityTypeBase)
        )
      );
    }
  } catch (error) {
    // If there's an error, return an empty array
    console.error(`Error finding activity types: ${error}`);
  }

  return activityTypes;
}

/**
 * Finds all components that match the given base name
 */
function findVersionedComponents(
  openApiSpec: any,
  componentType: "intent" | "result",
  baseName: string
): string[] {
  const components: string[] = [];

  try {
    // Determine the path to look for components
    const schemaType = componentType === "intent" ? "Intent" : "Result";
    const schema = openApiSpec.components?.schemas?.[schemaType];

    if (schema?.properties) {
      // Filter properties that start with the base name
      components.push(
        ...Object.keys(schema.properties).filter((property) =>
          startsWith(property, baseName)
        )
      );
    }
  } catch (error) {
    // If there's an error, return an empty array
    console.error(`Error finding ${componentType} components: ${error}`);
  }

  return components;
}

/**
 * Represents a matched set of versioned components
 */
interface VersionedComponent {
  version: string;
  activityType: string;
  intentName: string;
  resultName: string;
}

/**
 * Matches activity types, intents, and results by version
 */
function matchVersionedComponents(
  activityTypes: string[],
  intents: string[],
  results: string[]
): VersionedComponent[] {
  const components: VersionedComponent[] = [];
  const versionMap: Map<string, Partial<VersionedComponent>> = new Map();

  // Process activity types
  for (const typeName of activityTypes) {
    const version = extractVersionFromComponent(typeName);
    if (version) {
      if (!versionMap.has(version)) versionMap.set(version, {});
      versionMap.get(version)!.activityType = typeName;
    }
  }

  // Process intents
  for (const intentName of intents) {
    const version = extractVersionFromComponent(intentName);
    if (version) {
      if (!versionMap.has(version)) versionMap.set(version, {});
      versionMap.get(version)!.intentName = intentName;
    }
  }

  // Process results
  for (const resultName of results) {
    const version = extractVersionFromComponent(resultName);
    if (version) {
      if (!versionMap.has(version)) versionMap.set(version, {});
      versionMap.get(version)!.resultName = resultName;
    }
  }

  // Create final components where all parts are found
  for (const [version, component] of versionMap.entries()) {
    if (
      component.activityType &&
      component.intentName &&
      component.resultName
    ) {
      components.push({
        version,
        activityType: component.activityType,
        intentName: component.intentName,
        resultName: component.resultName,
      });
    }
  }

  // Handle endpoints that use generic ActivityResponse (no specific result component)
  // For these, we create a component with a generic result name
  for (const [version, component] of versionMap.entries()) {
    if (
      component.activityType &&
      component.intentName &&
      !component.resultName
    ) {
      // Create a generic result name based on the intent name
      const genericResultName = component.intentName.replace('Intent', 'Result');
      components.push({
        version,
        activityType: component.activityType,
        intentName: component.intentName,
        resultName: genericResultName,
      });
    }
  }

  // Sort by version (optional, but good practice)
  components.sort((a, b) => a.version.localeCompare(b.version));

  return components;
}

/**
 * Parses the 'responses' object from an OpenAPI operation into an ApiResponse array.
 */
function parseResponsesFromOperation(operationResponses: any): ApiResponse[] {
  const apiResponses: ApiResponse[] = [];
  if (!operationResponses) {
    return apiResponses;
  }

  for (const [statusCodeStr, responseObj] of Object.entries(
    operationResponses
  )) {
    const statusCode = parseInt(statusCodeStr, 10);
    if (isNaN(statusCode)) continue; // Skip if status code is not a number (like 'default')

    const response = responseObj as any;
    let fields: ApiField[] | undefined = undefined;
    let contentType: ApiResponse["contentType"] = undefined;

    // Check for JSON content first
    const jsonContent = response.content?.["application/json"]?.schema;
    if (jsonContent) {
      contentType = "application/json";
      fields = parseSchemaToApiFields(jsonContent); // Use existing helper
    }
    // Add checks for other content types if needed (text/plain, application/xml)

    apiResponses.push({
      statusCode,
      description: response.description || "", // Add description
      contentType, // Optional contentType
      fields, // Optional fields
      // TODO: Add example parsing if needed from response.content?.[contentType]?.example(s)
    });
  }

  return apiResponses;
}
