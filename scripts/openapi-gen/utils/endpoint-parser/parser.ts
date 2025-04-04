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

        // Find versioned components
        const intentBaseName = createIntentBaseName(endpointName);
        const resultBaseName = createResultBaseName(endpointName);
        const activityTypeBase = createActivityType(endpointName);

        // Find activity type enum
        const typeEnum = findActivityTypeEnum(openApiSpec, activityTypeBase);

        // Find intents and results
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

        // Match versions and create endpoints
        const versionedComponents = matchVersionedComponents(
          typeEnum,
          intents,
          results
        );

        // Create ApiEndpoint for each version
        for (const component of versionedComponents) {
          // Get intent and result schemas
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

          // Create basic endpoint
          const endpoint: ApiEndpoint = {
            title: operation.summary || "",
            path,
            method: method as HttpMethod,
            description: operation.description || "",
            version: component.version,
            type: endpointType,
            responses: [
              {
                statusCode: 200,
                contentType: "application/json",
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
                            // Parse the intent schema
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
                        childFields: [
                          {
                            name: component.resultName,
                            type: "object",
                            required: true,
                            description: `The ${component.resultName} object`,
                            // Parse the result schema
                            childFields: resultSchema
                              ? parseSchemaProperties(resultSchema)
                              : [],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          };

          // Process request body if available
          if (operation.requestBody?.content?.["application/json"]?.schema) {
            const requestBodySchema =
              operation.requestBody.content["application/json"].schema;
            endpoint.requestBody = {
              contentType: "application/json",
              fields: parseSchemaToApiFields(requestBodySchema),
            };
          }

          // Process parameters if available
          if (operation.parameters && Array.isArray(operation.parameters)) {
            const pathParams = [];
            const queryParams = [];

            for (const param of operation.parameters) {
              if (param.in === "path") {
                pathParams.push(parameterToApiParameter(param));
              } else if (param.in === "query") {
                queryParams.push(parameterToApiParameter(param));
              }
            }

            if (pathParams.length > 0) {
              endpoint.pathParams = pathParams;
            }

            if (queryParams.length > 0) {
              endpoint.queryParams = queryParams;
            }
          }

          // Only include required properties if specified
          if (!options.requiredPropertiesOnly) {
            // Add optional properties here
          }

          endpoints.push(endpoint);
        }
      }
    }

    return { endpoints };
  } catch (error: any) {
    throw new Error(`Failed to parse API endpoints: ${error.message}`);
  }
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

  if (!schema.properties) {
    return fields;
  }

  // Get required properties
  const requiredProps = schema.required || [];

  // Process each property
  for (const [propName, propSchema] of Object.entries(
    schema.properties as Record<string, any>
  )) {
    fields.push(
      schemaToApiField(propName, propSchema, requiredProps.includes(propName))
    );
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

  // Process each intent
  for (const intentName of intents) {
    const version = extractVersionFromComponent(intentName);

    // Find matching result and activity type
    const versionSuffix = version === "1" ? "" : `_V${version}`;
    const expectedResultName = intentName.replace("Intent", "Result");
    const expectedActivityType = `${activityTypes[0]}${versionSuffix}`;

    // Check if we have matching components
    const hasMatchingResult = results.includes(expectedResultName);
    const hasMatchingActivityType = activityTypes.some(
      (type) => type === expectedActivityType
    );

    if (hasMatchingResult && hasMatchingActivityType) {
      components.push({
        version,
        activityType: expectedActivityType,
        intentName,
        resultName: expectedResultName,
      });
    }
  }

  return components;
}
