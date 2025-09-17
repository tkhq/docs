import fs from "fs";
import path from "path";
import { ApiEndpoint, ApiField, EnumOption } from "../endpoint-parser/types";

// --- Helper: Escape HTML Chars ---
function escapeHtmlChars(text: string): string {
  if (!text) return "";
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}");
}

// --- Helper: Get Enum Details ---
function getEnumDetails(field: ApiField): {
  isEnum: boolean;
  displayType: string;
  options: EnumOption[]; // Always return an array, even if empty
} {
  if (field.type === "enum" && field.enumOptions) {
    return {
      isEnum: true,
      displayType: "enum<string>", // Typically enums are strings
      options: field.enumOptions,
    };
  }
  // Only treat as array of enums if the array items are enums (not objects)
  if (
    field.type === "array" &&
    field.childFields?.length === 1 &&
    field.childFields[0].name === "item" &&
    field.childFields[0].type === "enum" &&
    field.childFields[0].enumOptions
  ) {
    return {
      isEnum: true, // Treat as enum context for display
      displayType: "enum<string[]>", // Indicate it's an array of enums
      options: field.childFields[0].enumOptions, // Get options from the item definition
    };
  }
  // Default case: not an enum or empty options
  return { isEnum: false, displayType: field.type, options: [] };
}

// --- Helper: Generate Enum Options MDX ---
function generateEnumOptionsMdx(options: EnumOption[]): string {
  if (!options || options.length === 0) {
    return "";
  }
  // Escape backticks for MDX code formatting, join with ', '
  const optionValues = options
    .map((opt) => `\`${escapeHtmlChars(opt.value)}\``)
    .join(", ");
  // Return formatted string
  return `\nEnum options: ${optionValues}\n`;
}

// --- Helper: Generate Request Parameter MDX Recursive ---
function generateParamMdxRecursive(
  fieldName: string,
  field: ApiField,
  parentPath: string
): string {
  let mdx = "";
  const fieldRequired = field.required ?? false;
  const fieldDescription = escapeHtmlChars(field.description || ""); // Use helper
  const fieldChildren = field.childFields;
  const { isEnum, displayType, options } = getEnumDetails(field);
  const currentPath = parentPath ? `${parentPath}.${fieldName}` : fieldName;

  // Exclude simple enum arrays from needing outer Expandable for item structure
  const treatAsComplex =
    (field.type === "object" || field.type === "array") &&
    fieldChildren &&
    fieldChildren.length > 0 &&
    !(
      field.type === "array" &&
      fieldChildren[0]?.name === "item" &&
      getEnumDetails(fieldChildren[0]).isEnum
    );

  if (treatAsComplex) {
    // Build default attribute string conditionally for ParamField
    const defaultAttr = field.defaultValue
      ? ` default="${field.defaultValue}"`
      : "";

    // Object or Array of Objects/Simple Types: Use ParamField > Expandable
    mdx += `<ParamField body="${fieldName}" type="${displayType}" required={${fieldRequired}} path="${currentPath}"${defaultAttr}>
`;
    // Add description for container ONLY if present AND NOT an enum
    if (fieldDescription && !isEnum) mdx += `  <p>${fieldDescription}</p>\n`; // fieldDescription is already escaped
    // Use helper for enum options
    if (isEnum) {
      mdx += `  ${generateEnumOptionsMdx(options)}`; // Add indentation
    }
    mdx += `  <Expandable title="${
      field.type === "array" ? "item details" : "details"
    }">\n`;
    let nestedMdx = "";
    const childParentPath = currentPath;

    if (field.type === "array") {
      const firstChild = fieldChildren[0];
      if (firstChild.name === "item") {
        // Array of simple types (non-enum) - describe the item type
        const itemField = firstChild;
        const { displayType: itemDisplayType } = getEnumDetails(itemField);
        nestedMdx += `    <p>Array item type: <code>${itemDisplayType}</code></p>\n`;
        if (itemField.description)
          nestedMdx += `    <p>${escapeHtmlChars(itemField.description)}</p>\n`; // Use helper
      } else {
        // Array of objects - generate structure for one item
        for (const nestedField of fieldChildren) {
          nestedMdx += generateParamMdxRecursive(
            nestedField.name,
            nestedField,
            childParentPath // Pass the *same* parent path for array items
          );
        }
      }
    } else {
      // Object - generate structure for properties
      for (const nestedField of fieldChildren) {
        nestedMdx += generateParamMdxRecursive(
          nestedField.name,
          nestedField,
          childParentPath // Pass the *current* path as parent for object properties
        );
      }
    }

    mdx += nestedMdx
      .split("\n")
      .map((line) => `    ${line}`)
      .join("\n")
      .trimEnd();
    mdx += `\n  </Expandable>\n`;
    mdx += `</ParamField>\n`;
  } else {
    // Simple Type or Enum: Determine if top-level or nested

    // Calculate content needed for both cases first
    const descriptionContent =
      !isEnum && fieldDescription ? `\n${fieldDescription}\n` : ""; // fieldDescription is already escaped
    const enumOptionsContent = isEnum ? generateEnumOptionsMdx(options) : ""; // Use helper

    if (parentPath === "") {
      // TOP-LEVEL Simple Type/Enum: Use ParamField
      const defaultAttr = field.defaultValue
        ? ` default="${field.defaultValue}"`
        : "";
      mdx += `<ParamField body="${fieldName}" type="${displayType}" required={${fieldRequired}}${defaultAttr}>\n`;
      mdx += `${descriptionContent}${enumOptionsContent}`; // Combine description (if not enum) and enum options
      mdx += `</ParamField>\n\n`;
    } else {
      // NESTED Simple Type/Enum: Use NestedParam
      mdx += `<NestedParam parentKey="${parentPath}" childKey="${fieldName}" type="${displayType}" required={${fieldRequired}} default="${
        field.defaultValue || ""
      }">`; // Changed parentPath->parentKey, body->childKey
      mdx += `${descriptionContent}${enumOptionsContent}`; // Combine description (if not enum) and enum options
      mdx += `</NestedParam>\n\n`;
    }
  }

  return mdx;
}

// --- Helper: Generate Response Field MDX Recursively ---
// Uses built-in <ResponseField> for top-level, imported <NestedParam> for nested.
function generateResponseFieldMdxRecursive(
  field: ApiField,
  parentKey: string = ""
): string {
  let mdx = "";
  const fieldName = field.name;
  // Construct the full key for the current field, used as parentKey for children
  const fullKey = parentKey ? `${parentKey}.${fieldName}` : fieldName;
  let description = field.description
    ? escapeHtmlChars(field.description) // Escape HTML first
    : "";

  const required = field.required ?? false; // Assume false if undefined for responses
  const fieldType = field.type; // Assuming ApiField already formats type like 'object', 'string', 'array', 'enum<string>'

  if (field.childFields && field.childFields.length > 0) {
    // Object or Array with children
    let childMdx = "";
    for (const childField of field.childFields) {
      // Recursive call: Pass the *current* field's full key as the parentKey for the next level
      childMdx += generateResponseFieldMdxRecursive(childField, fullKey);
    }

    // Top-level Object/Array: Use <ResponseField>
    if (!parentKey) {
      mdx += `<ResponseField name="${fieldName}" type="${fieldType}" required={${required}}>
  ${description.trim()}
  <Expandable title="${fieldName} details">
    ${childMdx}
  </Expandable>
</ResponseField>
`;
    } else {
      // ANY NESTED Object/Array: Use <NestedParam>
      mdx += `<NestedParam parentKey="${parentKey}" childKey="${fieldName}" type="${fieldType}" required={${required}}>
      ${description.trim()}
      <Expandable title="${fieldName} details">
        ${childMdx}
      </Expandable>
    </NestedParam>
`;
    }
  } else {
    // Primitive field or array of primitives (no children)
    const { isEnum, options } = getEnumDetails(field);

    // Top-level Primitive: Use <ResponseField>
    if (!parentKey) {
      mdx += `<ResponseField name="${fieldName}" type="${fieldType}" required={${required}}>${description.trim()}${
        isEnum
          ? `
  ${generateEnumOptionsMdx(options)}`
          : ""
      }</ResponseField>
`; // Removed newline before closing tag
    } else {
      // ANY NESTED Primitive: Use <NestedParam>
      mdx += `<NestedParam parentKey="${parentKey}" childKey="${fieldName}" type="${fieldType}" required={${required}}>\n${description.trim()}${
        isEnum
          ? `
  ${generateEnumOptionsMdx(options)}`
          : ""
      }\n</NestedParam>
`; // Removed newline before closing tag
    }
  }

  return mdx;
}

// --- Helper: Generate JSON Payload Object ---
function generateJsonPayloadRecursive(
  fields: ApiField[] | undefined,
  endpointPath?: string,
  parentPath: string = ""
): Record<string, any> {
  if (!fields) {
    return {};
  }

  const result: Record<string, any> = {};

  fields.forEach((field) => {
    let value: any;
    const currentPath = parentPath ? `${parentPath}.${field.name}` : field.name;

    // Special handling for ApproveActivity result field
    if (endpointPath?.includes("approve_activity") && field.name === "result" && field.childFields?.length === 0) {
      value = "<object> (approved activity result, if completed)";
    } else if (field.type === "object" && field.childFields) {
      // Special handling for get-activity: only include the first intent in the response example
      if (
        endpointPath?.includes("get_activity") &&
        field.name === "intent" &&
        field.childFields.length > 0
      ) {
        // Only include the first intent child
        value = generateJsonPayloadRecursive([field.childFields[0]], endpointPath, currentPath);
      } else {
        // Recursive call for nested objects
        value = generateJsonPayloadRecursive(field.childFields, endpointPath, currentPath);
      }
    } else if (
      field.type === "array" &&
      field.childFields &&
      field.childFields.length > 0
    ) {
      // Handle arrays
      let itemValue: any;
      const firstChild = field.childFields[0];

      // Check if items are simple types (parser sets name to 'item') or objects
      if (firstChild.name === "item") {
        // Items are simple (string, number, boolean, enum)
        const itemField = firstChild; // Use the single 'item' field definition
        const itemDetails = getEnumDetails(itemField);
        if (itemDetails.isEnum && itemDetails.options.length > 0) {
          // Array of enums
          itemValue = `<${itemDetails.options[0].value}>`;
        } else {
          // Array of simple types
          switch (itemField.type) {
            case "string":
              itemValue = "<string>";
              break;
            case "number":
              itemValue = "<number>";
              break;
            case "boolean":
              itemValue = "<boolean>";
              break;
            default:
              itemValue = `<${itemField.type || "unknown"}_element>`;
          }
        }
      } else {
        // Items are objects: recursively generate structure using all childFields
        // Pass the *whole* childFields array, representing the structure of ONE item.
        itemValue = generateJsonPayloadRecursive(field.childFields, endpointPath, currentPath);
      }
      value = [itemValue]; // Create an array with one example element
    } else {
      // Handle simple types (non-array, non-object)
      const fieldDetails = getEnumDetails(field);
      if (fieldDetails.isEnum && fieldDetails.options.length > 0) {
        // Simple Enum
        let enumValue = `<${fieldDetails.options[0].value}>`;
        
        // Special handling for credential type in get-api-key and get-api-keys endpoints.
        // Current behavior: for enum types, we grab the first (which defaults to CREDENTIAL_TYPE_WEBAUTHN_AUTHENTICATOR).
        // However, for `get_api_key` and `get_api_keys` endpoints, we want to use CREDENTIAL_TYPE_API_KEY_P256.
        if (
          (endpointPath?.includes("get_api_key") || endpointPath?.includes("get_api_keys")) &&
          field.name === "type" &&
          enumValue === "<CREDENTIAL_TYPE_WEBAUTHN_AUTHENTICATOR>"
        ) {
          enumValue = "<CREDENTIAL_TYPE_API_KEY_P256>";
        }
        
        value = enumValue;
      } else {
        // Simple Type (non-enum)
        switch (field.type) {
          case "string":
            value = "<string>";
            break;
          case "number":
            value = "<number>";
            break;
          case "boolean":
            value = "<boolean>";
            break;
          default:
            value = `<${field.type || "unknown"}>`; // Use type as placeholder if known
        }
      }
    }
    result[field.name] = value;
  });

  return result;
}

// --- Helper: Map endpoint path to SDK method name ---
function getSdkMethodName(endpoint: ApiEndpoint): string {

  // Prefer operationId if present
  if (endpoint.operationId && endpoint.operationId.trim() !== "") {
    const op = endpoint.operationId.trim();
    // Lowercase only the very first character, keep the rest unchanged
    return op.slice(0, 1).toLowerCase() + op.slice(1);
  }
  const path = endpoint.path || "";
  
  // Extract the last part of the path (e.g., "approve_activity" from "/public/v1/submit/approve_activity")
  const pathParts = path.split("/").filter(Boolean);
  const lastPart = pathParts[pathParts.length - 1];
  
  if (!lastPart) return "unknownMethod";
  
  // Convert snake_case to camelCase
  return lastPart.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// --- Helper: Generate SDK parameter value for a field ---
function generateSdkParameterValue(field: ApiField, indent: number = 2): string {
  const indentStr = " ".repeat(indent);
  const fieldName = field.name;
  const fieldType = field.type;
  const description = field.description ? ` // ${field.description}` : "";
  
  // Check if this is an enum field
  const { isEnum, options } = getEnumDetails(field);
  
  if (isEnum && options.length > 0) {
    // For enum fields, show the first option as an example
    const firstOption = options[0].value;
    return `${indentStr}${fieldName}: "<${firstOption}>"${description}`;
  } else if (fieldType === "string") {
    return `${indentStr}${fieldName}: "<string>${field.description ? ` (${field.description})` : ''}"`;
  } else if (fieldType === "number") {
    return `${indentStr}${fieldName}: 0${description}`;
  } else if (fieldType === "boolean") {
    return `${indentStr}${fieldName}: true${description}`;
  } else if (fieldType === "array") {
    if (field.childFields && field.childFields.length > 0) {
      // If the array is of objects (multiple fields, or first child is an object)
      if (
        field.childFields.length > 1 ||
        (field.childFields.length === 1 && field.childFields[0].type === "object")
      ) {
        const lines = [`${indentStr}${fieldName}: [{${description}`];
        for (const child of field.childFields) {
          lines.push(generateSdkParameterValue(child, indent + 2));
        }
        lines.push(`${indentStr}}]`);
        return lines.join(",\n");
      } else if (
        field.childFields.length === 1 &&
        field.childFields[0].name === "item"
      ) {
        // Array of primitives or enums
        const itemField = field.childFields[0];
        const { isEnum, options } = getEnumDetails(itemField);
        if (isEnum && options.length > 0) {
          return `${indentStr}${fieldName}: ["<${options[0].value}>"]${description}`;
        } else {
          return `${indentStr}${fieldName}: ["<string>"]${description}`;
        }
      } else {
        // Fallback
        return `${indentStr}${fieldName}: ["<string>"]${description}`;
      }
    } else {
      return `${indentStr}${fieldName}: ["<string>"]${description}`;
    }
  } else if (fieldType === "object") {
    if (field.childFields && field.childFields.length > 0) {
      const lines = [`${indentStr}${fieldName}: {${description}`];
      for (const childField of field.childFields) {
        lines.push(generateSdkParameterValue(childField, indent + 2));
      }
      lines.push(`${indentStr}}`);
      return lines.join(",\n");
    } else {
      return `${indentStr}${fieldName}: { /* object */ }${description}`;
    }
  }
  
  return `${indentStr}${fieldName}: "<unknown>"${description}`;
}

// --- Helper: Generate SDK parameters from endpoint ---
function generateSdkParameters(endpoint: ApiEndpoint): string {
  const fields = endpoint.requestBody?.fields || [];
  const parametersWrapper = fields.find((f) => f.name === "parameters");
  
  if (parametersWrapper) {
    if (parametersWrapper.childFields && parametersWrapper.childFields.length > 0) {
      // For activity endpoints, extract parameters from the parameters wrapper only
      const paramLines: string[] = [];
      for (const field of parametersWrapper.childFields) {
        paramLines.push(generateSdkParameterValue(field));
      }
      return paramLines.join(",\n");
    } else {
      // parameters exists but has no child fields, so no endpoint-specific parameters
      return "";
    }
  } else {
    // For query endpoints, use all top-level fields (excluding only type and timestampMs)
    const commonFields = ["type", "timestampMs"]; // organizationId should be included for queries
    const endpointSpecificFields = fields.filter(f => !commonFields.includes(f.name));
    
    if (endpointSpecificFields.length === 0) {
      return ""; // No endpoint-specific parameters
    }
    const paramLines: string[] = [];
    for (const field of endpointSpecificFields) {
      paramLines.push(generateSdkParameterValue(field));
    }
    return paramLines.join(",\n");
  }
}

// --- Helper: Generate Request Example MDX ---
function generateRequestExample(endpoint: ApiEndpoint): string {
  const path = endpoint.path || "unknown_path";
  const url = `https://api.turnkey.com${path}`;

  // Find the 'type' field, often indicates the specific activity type
  const typeField = endpoint.requestBody?.fields?.find(
    (f) => f.name === "type"
  );
  const typeFieldDetails = typeField
    ? getEnumDetails(typeField)
    : { options: [] };
  const activityType =
    typeFieldDetails.options.length > 0
      ? typeFieldDetails.options[0].value
      : "ACTIVITY_TYPE_UNKNOWN_V1";

  // Determine payload: if there's a `parameters` wrapper, use it, otherwise serialize all root-level fields
  const fields = endpoint.requestBody?.fields || [];
  const parametersWrapper = fields.find((f) => f.name === "parameters");
  let dataPayloadObject: Record<string, any>;
  if (parametersWrapper) {
    // activity-style endpoint
    const parametersObject = generateJsonPayloadRecursive(
      parametersWrapper.childFields,
      endpoint.path
    );
    dataPayloadObject = {
      type: activityType,
      timestampMs: "<string> (e.g. 1746736509954)",
      organizationId: "<string> (Your Organization ID)",
      parameters: parametersObject,
    };
  } else {
    // query-style endpoint: flatten all top-level fields
    dataPayloadObject = generateJsonPayloadRecursive(fields, endpoint.path);
  }

  // Stringify carefully, handle potential BigInts if they arise
  const dataPayloadString = JSON.stringify(
    dataPayloadObject,
    (key, value) => (typeof value === "bigint" ? value.toString() : value),
    4
  ); // Pretty print with 4 spaces

  // Escape single quotes for bash compatibility within single-quoted string
  const escapedDataPayloadString = dataPayloadString.replace(/'/g, "'\\''");

  const curlCommand =
    "```bash title=\"cURL\"\n" +
    "curl --request POST \\\n" +
    `  --url ${url} \\\n` +
    "  --header 'Accept: application/json' \\\n" +
    "  --header 'Content-Type: application/json' \\\n" +
    '  --header "X-Stamp: <string> (see Authorizations)" \\\n' + // Added reminder for secret
    `  --data '${escapedDataPayloadString}'\n` +
    "```";

  // Generate JavaScript SDK example
  const sdkMethodName = getSdkMethodName(endpoint);
  const sdkParameters = generateSdkParameters(endpoint);
  const jsParams = sdkParameters.trim() === "" ? "{}" : `{
${sdkParameters}
}`;
  const javascriptExample = 
    "```javascript title=\"JavaScript\"\n" +
    "import { Turnkey } from \"@turnkey/sdk-server\";\n\n" +
    "const turnkeyClient = new Turnkey({\n" +
    "  apiBaseUrl: \"https://api.turnkey.com\",\n" +
    "  apiPublicKey: process.env.API_PUBLIC_KEY!,\n" +
    "  apiPrivateKey: process.env.API_PRIVATE_KEY!,\n" +
    "  defaultOrganizationId: process.env.ORGANIZATION_ID!,\n" +
    "});\n\n" +
    `const response = await turnkeyClient.apiClient().${sdkMethodName}(${jsParams});\n` +
    "```";

  return `<RequestExample>\n\n${curlCommand}\n\n${javascriptExample}\n\n</RequestExample>`;
}

// --- Helper: Generate Response Example MDX ---
function generateResponseExample(endpoint: ApiEndpoint): string {
  // Find the 'type' field from the request to potentially echo in response (common pattern)
  const reqTypeField = endpoint.requestBody?.fields?.find(
    (f) => f.name === "type"
  );
  const reqTypeDetails = reqTypeField
    ? getEnumDetails(reqTypeField)
    : { options: [] };
  const activityType =
    reqTypeDetails.options.length > 0
      ? reqTypeDetails.options[0].value
      : "ACTIVITY_TYPE_UNKNOWN_V1";

  // Attempt to find the 200 OK response schema
  const successResponse = endpoint.responses?.find(
    (res) => res.statusCode === 200
  );

  // Generate payload based on response schema if available, otherwise fallback
  let resultPayload: Record<string, any>;
  if (successResponse?.fields) {
    resultPayload = generateJsonPayloadRecursive(
      successResponse.fields,
      endpoint.path
    );
  } else {
    resultPayload = { "<result_key>": "<result_value>" };
  }

  let responseJsonString: string;
  if (endpoint.type === "activity") {
    // Activity endpoints: wrap in activity object
    const responsePayloadObject = {
      activity: {
        id: "<activity-id>",
        status: "ACTIVITY_STATUS_COMPLETED", // Example status
        type: activityType, // Echo derived or placeholder type from request
        organizationId: "<organization-id>",
        timestampMs: "<timestamp> (e.g. 1746736509954)",
        result: resultPayload, // Use generated or fallback result
      },
    };
    responseJsonString = JSON.stringify(
      responsePayloadObject,
      (key, value) => (typeof value === "bigint" ? value.toString() : value),
      2
    ); // 2-space indent
  } else {
    // Query endpoints: just the result object
    responseJsonString = JSON.stringify(
      resultPayload,
      (key, value) => (typeof value === "bigint" ? value.toString() : value),
      2
    );
  }

  const responseJsonBlock = `\`\`\`json 200\n${responseJsonString}\n\`\`\``;

  return `<ResponseExample>\n\n${responseJsonBlock}\n\n</ResponseExample>`;
}

// --- Helper: Determine Subdirectory ---
function determineSubdirectory(endpointPath: string): string {
  if (endpointPath.includes("/public/v1/query/")) {
    return "queries";
  } else if (endpointPath.includes("/public/v1/submit/")) {
    return "activities";
  } else {
    // Default fallback
    return "other";
  }
}

// --- Main MDX File Generation Function ---
// This function uses generateMdxContent internally
export function generateMdxFile(
  endpoint: ApiEndpoint,
  baseOutputDir: string,
  addOnly: boolean = false
): string | null {
  if (!endpoint.title || !endpoint.path) {
    console.warn(
      `Skipping MDX generation for endpoint (Title: ${endpoint.title}, Path: ${endpoint.path}) due to missing title or path.`
    );
    return null;
  }

  let kebabCaseTitle = endpoint.title
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens

  const filename = `${kebabCaseTitle}.mdx`;

  // *** Determine the correct subdirectory ***
  const subdirectory = determineSubdirectory(endpoint.path); // Use the helper function

  // Construct the full output path including the determined subdirectory
  const outputPath = path.join(baseOutputDir, subdirectory, filename); // Use dynamic subdirectory
  const relativeOutputPathWithoutExt = path.join(subdirectory, kebabCaseTitle); // Relative path for index

  // Ensure the subdirectory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}`);
  }

  // Check if file exists and if we should skip (addOnly mode)
  if (addOnly && fs.existsSync(outputPath)) {
    console.log(`Skipping existing file (addOnly=true): ${outputPath}`);
    return relativeOutputPathWithoutExt; // Return path even if skipped
  }

  try {
    // Generate the actual MDX content using the dedicated function
    const mdxContent = generateMdxContent(endpoint);

    // Write the generated content to the file
    fs.writeFileSync(outputPath, mdxContent);
    console.log(`Generated MDX file: ${outputPath}`);
    return relativeOutputPathWithoutExt; // Return the relative path for index generation
  } catch (error: any) {
    console.error(
      `Error generating MDX file for endpoint "${endpoint.title}": ${error.message}`
    );
    if (error.stack) console.error(error.stack);
    return null; // Indicate failure
  }
}

// --- Main MDX Content Generation ---
export function generateMdxContent(endpoint: ApiEndpoint): string {
  const rootEndpointPath = endpoint.path.split("/").filter(Boolean).pop();

  // 1. Frontmatter and Imports
  let mdxContent = `---
title: "${endpoint.title || "API Endpoint"}"
description: "${endpoint.description || "API endpoint documentation"}"
---

import { Authorizations } from "/snippets/api/authorizations.mdx";
import { H3Bordered } from "/snippets/h3-bordered.mdx";
import { NestedParam } from "/snippets/nested-param.mdx";
import { EndpointPath } from "/snippets/api/endpoint.mdx";

<EndpointPath type="${
    endpoint.type === "activity" ? "submit" : "query"
  }" path="${rootEndpointPath}" />

<Authorizations />

`;

  // 2. Request Body Parameters Section
  if (endpoint.requestBody?.fields && endpoint.requestBody.fields.length > 0) {
    mdxContent += `<H3Bordered text="Body" />\n\n`;
    const topLevelFields = endpoint.requestBody.fields;

    for (const field of topLevelFields) {
      // Pass empty string for field name initially, it's handled inside recursion
      mdxContent += generateParamMdxRecursive(field.name, field, "");
    }
  }

  // 3. Response Body Parameters Section (Assuming 200 OK)
  const successResponse = endpoint.responses?.find(
    (res) => res.statusCode === 200
  );

  if (successResponse?.fields && successResponse.fields.length > 0) {
    mdxContent += `\n<H3Bordered text="Response" />\n`;
    mdxContent += `A successful response returns the following fields:\n\n`; // Add context

    for (const field of successResponse.fields) {
      mdxContent += generateResponseFieldMdxRecursive(field); // Use NEW recursive function
    }
  } else {
    mdxContent += `\n{/* No explicit 200 response schema defined. */}\n`;
  }

  // 4. Request Example Section
  const requestExample = generateRequestExample(endpoint);
  if (requestExample) {
    mdxContent += `\n${requestExample}\n`;
  }

  // 5. Response Example Section
  const responseExample = generateResponseExample(endpoint);
  if (responseExample) {
    mdxContent += `\n${responseExample}\n`;
  }

  return mdxContent;
}