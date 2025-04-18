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
  // Check for array of enums
  if (
    field.type === "array" &&
    field.childFields?.[0]?.type === "enum" &&
    field.childFields?.[0]?.enumOptions
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
  fields: ApiField[] | undefined
): Record<string, any> {
  if (!fields) {
    return {};
  }

  const result: Record<string, any> = {};

  fields.forEach((field) => {
    let value: any;

    if (field.type === "object" && field.childFields) {
      // Recursive call for nested objects
      value = generateJsonPayloadRecursive(field.childFields);
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
              itemValue = "<string_element>";
              break;
            case "number":
              itemValue = 456;
              break;
            case "boolean":
              itemValue = false;
              break;
            default:
              itemValue = `<${itemField.type || "unknown"}_element>`;
          }
        }
      } else {
        // Items are objects: recursively generate structure using all childFields
        // Pass the *whole* childFields array, representing the structure of ONE item.
        itemValue = generateJsonPayloadRecursive(field.childFields);
      }
      value = [itemValue]; // Create an array with one example element
    } else {
      // Handle simple types (non-array, non-object)
      const fieldDetails = getEnumDetails(field);
      if (fieldDetails.isEnum && fieldDetails.options.length > 0) {
        // Simple Enum
        value = `<${fieldDetails.options[0].value}>`;
      } else {
        // Simple Type (non-enum)
        switch (field.type) {
          case "string":
            value = "<string>";
            break;
          case "number":
            value = 123;
            break;
          case "boolean":
            value = true;
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

// --- Helper: Generate Request Example MDX ---
function generateRequestExample(endpoint: ApiEndpoint): string {
  const path = endpoint.path || "unknown_path";
  const url = `https://api.turnkey.com/public/v1/submit/${path}`;

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

  // Find the 'parameters' field which contains the main payload
  const parametersField = endpoint.requestBody?.fields?.find(
    (f) => f.name === "parameters"
  );
  const parametersObject = generateJsonPayloadRecursive(
    parametersField?.childFields
  );

  const dataPayloadObject = {
    type: activityType,
    timestampMs: "<string> (e.g., " + Date.now() + ")",
    organizationId: "<string> (Your Organization ID)",
    parameters: parametersObject,
  };

  // Stringify carefully, handle potential BigInts if they arise
  const dataPayloadString = JSON.stringify(
    dataPayloadObject,
    (key, value) => (typeof value === "bigint" ? value.toString() : value),
    4
  ); // Pretty print with 4 spaces

  // Escape single quotes for bash compatibility within single-quoted string
  const escapedDataPayloadString = dataPayloadString.replace(/'/g, "'\\''");

  const curlCommand =
    "```bash cURL\n" +
    "curl --request POST \\\n" +
    `  --url ${url} \\\n` +
    "  --header 'Accept: application/json' \\\n" +
    "  --header 'Content-Type: application/json' \\\n" +
    '  --header "X-Stamp: <YOUR_API_KEY.YOUR_API_SECRET>" \\\n' + // Added reminder for secret
    `  --data '${escapedDataPayloadString}'\n` +
    "```";

  return `<RequestExample>\n\n${curlCommand}\n\n</RequestExample>`;
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
  let activityResultPayload: Record<string, any>;
  if (successResponse?.fields) {
    // Assuming the success response structure is directly the content of 'activity.result'
    // Adjust this logic if the actual response schema nests the result differently
    activityResultPayload = generateJsonPayloadRecursive(
      successResponse.fields
    );
  } else {
    // Fallback if no 200 response schema is defined
    activityResultPayload = { "<result_key>": "<result_value>" };
  }

  const responsePayloadObject = {
    activity: {
      id: "<activity-id>",
      status: "ACTIVITY_STATUS_COMPLETED", // Example status
      type: activityType, // Echo derived or placeholder type from request
      organizationId: "<organization-id>",
      timestampMs: "<timestamp> (e.g., " + Date.now() + ")",
      result: activityResultPayload, // Use generated or fallback result
    },
  };

  const responseJsonString = JSON.stringify(
    responsePayloadObject,
    (key, value) => (typeof value === "bigint" ? value.toString() : value),
    2
  ); // 2-space indent

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
