import fs from "fs";
import path from "path";
import { ApiEndpoint, ApiField, EnumOption } from "../endpoint-parser/types";

// --- Helper: Get Enum Details ---
function getEnumDetails(field: ApiField): {
  isEnum: boolean;
  displayType: string;
  options?: EnumOption[];
} {
  if (field.type === "enum") {
    return {
      isEnum: true,
      displayType: "enum<string>",
      options: field.enumOptions,
    };
  }
  if (field.type === "array" && field.childFields?.[0]?.type === "enum") {
    return {
      isEnum: true,
      displayType: "enum<string[]>",
      options: field.childFields[0].enumOptions,
    };
  }
  return { isEnum: false, displayType: field.type, options: undefined };
}

// --- Helper: Format Enum Options for Descriptions ---
function formatEnumOptions(options: EnumOption[] | undefined): string {
  if (!options || options.length === 0) return "";
  const optionValues = options.map((opt) => `\\\`${opt.value}\\\``).join(", "); // Escaped backticks
  return `Available Options: ${optionValues}`;
}

// --- Helper: Generate Parameter MDX Recursively ---
function generateParamMdxRecursive(
  paramName: string,
  paramDetails: ApiField,
  parentPath: string
): string {
  const isRequired = paramDetails.required ?? false;
  const description =
    paramDetails.description.replace(/</g, "&lt;").replace(/>/g, "&gt;") || "";
  const childFields = paramDetails.childFields;
  const { isEnum, displayType, options } = getEnumDetails(paramDetails);
  let mdx = "";

  if (isEnum) {
    const formattedOptions = formatEnumOptions(options);
    const combinedDescription = description
      ? `<p>${description}</p><p>${formattedOptions}</p>`
      : `<p>${formattedOptions}</p>`;
    mdx = `<NestedParam parentKey="${parentPath}" childKey="${paramName}" type="${displayType}" required={${isRequired}}>${combinedDescription}</NestedParam>\n`;
  } else if (childFields && childFields.length > 0) {
    mdx += `<NestedParam parentKey="${parentPath}" childKey="${paramName}" type="${paramDetails.type}" required={${isRequired}}>\n`;
    // if (description) mdx += `  <p>${description}</p>\n`; // Add description for container if present
    mdx += `  <Expandable title="${paramName} details">\n`;
    let nestedMdx = "";
    const newParentPath = `${parentPath}.${paramName}`;
    for (const nestedField of childFields) {
      nestedMdx += generateParamMdxRecursive(
        nestedField.name,
        nestedField,
        newParentPath
      );
    }
    mdx += nestedMdx
      .split("\n")
      .map((line) => `    ${line}`)
      .join("\n")
      .trimEnd();
    mdx += `\n  </Expandable>\n`;
    mdx += `</NestedParam>\n`;
  } else {
    mdx = `<NestedParam parentKey="${parentPath}" childKey="${paramName}" type="${
      paramDetails.type
    }" required={${isRequired}}>${
      description ? `<p>${description}</p>` : ""
    }</NestedParam>\n`;
  }
  return mdx;
}

// --- Helper: Generate JSON Payload Object (Refactored) ---
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
    } else if (field.type === "array" && field.childFields && field.childFields.length > 0) {
      // Handle arrays
      let itemValue: any;
      const firstChild = field.childFields[0];

      // Check if items are simple types (parser sets name to 'item') or objects
      if (firstChild.name === "item") {
        // Items are simple (string, number, boolean, enum)
        const itemField = firstChild; // Use the single 'item' field definition
        if (itemField.enumOptions?.[0]?.value) {
          // Array of enums
          itemValue = `<${itemField.enumOptions[0].value}>`;
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
        itemValue = generateJsonPayloadRecursive(field.childFields);
      }
      value = [itemValue]; // Create an array with one example element
    } else {
      // Handle simple types (non-array, non-object)
      switch (field.type) {
        case "string":
          // Use enum default if available for top-level string enums
          if (field.enumOptions?.[0]?.value) {
            value = field.enumOptions[0].value;
          } else {
            value = "<string>";
          }
          break;
        case "number":
          value = 123;
          break; // Example number
        case "boolean":
          value = true;
          break; // Example boolean
        case "enum":
          value = `<${field.enumOptions?.[0]?.value || "enum"}>`; // Use first enum value or placeholder
          break;
        default:
          value = `<${field.type || "unknown"}>`; // Use type as placeholder if known
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

  const typeField = endpoint.requestBody?.fields?.find(
    (f) => f.name === "type"
  );

  const type = typeField?.enumOptions?.[0]?.value || "ACTIVITY_TYPE_UNKNOWN_V1"; // Use defaultValue or fallback

  // 1. Generate the parameters as a JavaScript object
  // This part should already be correct if Step 27 change was intentional
  const parametersObject = generateJsonPayloadRecursive(
    endpoint.requestBody?.fields?.find((f) => f.name === "parameters")
      ?.childFields // Pass the *fields* of the 'parameters' object
  );

  // 2. Construct the full data payload *object*
  const dataPayloadObject = {
    type,
    timestampMs: "<string> (e.g., " + Date.now() + ")", // Add example timestamp
    organizationId: "<string> (Your Organization ID)", // Add context
    parameters: parametersObject, // Embed the generated parameters object
  };

  // ... rest of the function remains the same ...

  // 3. Stringify the entire payload object for the cURL command's data field
  const dataPayloadString = JSON.stringify(dataPayloadObject, null, 4); // Pretty print (using 4 spaces as per Step 27)

  // 4. Escape single quotes ...
  const escapedDataPayloadString = dataPayloadString.replace(/'/g, "'\\''");

  // 5. Construct the curl command ...
  const curlCommand =
    "```bash cURL\n" +
    "curl --request POST \\\n" + // Use backslash for line continuation
    `  --url ${url} \\\n` +
    "  --header 'Accept: application/json' \\\n" +
    "  --header 'Content-Type: application/json' \\\n" +
    '  --header "X-Stamp: <YOUR_API_KEY>" \\\n' + // Example API Key header
    `  --data '${escapedDataPayloadString}'\n` +
    "```";

  // 6. Return the final MDX component string
  return `<RequestExample>\n\n${curlCommand}\n\n</RequestExample>`;
}

// --- Helper: Generate Response Example MDX (Updated) ---
function generateResponseExample(endpoint: ApiEndpoint): string {
  const typeField = endpoint.requestBody?.fields?.find(
    (f) => f.name === "type"
  );

  const activityType =
    typeField?.enumOptions?.[0]?.value || "ACTIVITY_TYPE_UNKNOWN_V1"; // Use defaultValue or fallback

  // 1. Construct the example response payload as a JavaScript object
  const responsePayloadObject = {
    activity: {
      id: "<activity-id>",
      status: "ACTIVITY_STATUS_COMPLETED", // Example status
      type: activityType, // Use derived or placeholder type
      organizationId: "<organization-id>",
      timestampMs: "<timestamp> (e.g., " + Date.now() + ")", // Add example
      result: {
        // Placeholder for the result object.
        // Ideally, this would be populated based on the endpoint's response schema if available.
        // For now, leaving it as a generic placeholder.
        "<result_key>": "<result_value>",
        // ... other potential result fields
      },
    },
  };

  // 2. Stringify the object with indentation
  const responseJsonString = JSON.stringify(responsePayloadObject, null, 2); // 2-space indent

  // 3. Construct the markdown code block
  const responseJsonBlock = `\`\`\`json 200\n${responseJsonString}\n\`\`\``;

  // 4. Return the final MDX component string
  return `<ResponseExample>\n\n${responseJsonBlock}\n\n</ResponseExample>`;
}

// --- Helper: Title to Kebab Case ---
function titleToKebabCase(title: string): string {
  // ... (same implementation as before) ...
  if (!title) return "";
  let result = "";
  for (let i = 0; i < title.length; i++) {
    const char = title[i];
    const lowerChar = char.toLowerCase();
    const upperChar = char.toUpperCase();
    if (char === " " || char === "_") {
      if (result.length > 0 && result[result.length - 1] !== "-") {
        result += "-";
      }
    } else if (char === upperChar && char !== lowerChar) {
      const prevChar = i > 0 ? title[i - 1] : "";
      const nextChar = i < title.length - 1 ? title[i + 1] : "";
      const isPrevLower =
        prevChar &&
        prevChar.toLowerCase() === prevChar &&
        prevChar.toUpperCase() !== prevChar;
      const isPrevUpper =
        prevChar &&
        prevChar.toUpperCase() === prevChar &&
        prevChar.toLowerCase() !== prevChar;
      const isNextLower =
        nextChar &&
        nextChar.toLowerCase() === nextChar &&
        nextChar.toUpperCase() !== nextChar;
      if (
        result.length > 0 &&
        result[result.length - 1] !== "-" &&
        (isPrevLower || (isPrevUpper && isNextLower))
      ) {
        result += "-";
      }
      result += lowerChar;
    } else {
      result += lowerChar;
    }
  }
  result = result.replace(/-+/g, "-");
  return result;
}

// --- Main MDX Generation Function ---
export function generateMdxFile(
  endpoint: ApiEndpoint,
  baseOutputDir: string,
  addOnly: boolean = false
): string | null {
  if (!endpoint.title || !endpoint.path) {
    // Ensure path exists for examples
    console.warn(
      `Skipping MDX generation for endpoint (Title: ${endpoint.title}, Path: ${endpoint.path}) due to missing title or path.`
    );
    return null;
  }

  let kebabCaseTitle = titleToKebabCase(endpoint.title);
  kebabCaseTitle = kebabCaseTitle.replace(/\?/g, ""); // Remove invalid chars

  const filename = `${kebabCaseTitle}.mdx`;
  const subDir = endpoint.type === "query" ? "queries" : "activities";
  const outputDir = path.resolve(baseOutputDir, subDir);
  const outputPath = path.join(outputDir, filename);
  const relativePathBase = path.relative(
    path.resolve(baseOutputDir, ".."),
    outputDir
  );
  const relativeOutputPathWithoutExt = path.join(
    relativePathBase,
    path.basename(filename, ".mdx")
  );

  try {
    if (addOnly && fs.existsSync(outputPath)) {
      return relativeOutputPathWithoutExt;
    }

    fs.mkdirSync(outputDir, { recursive: true });

    // 1. Frontmatter & Imports
    let mdxContent = `---
title: "${endpoint.title}"
description: "${endpoint.description || "API endpoint documentation"}"
---

import { Authorizations } from "/snippets/api/authorizations.mdx";
import { H3Bordered } from "/snippets/h3-bordered.mdx";
import { NestedParam } from "/snippets/nested-param.mdx";

<Authorizations />

`;

    // 2. Request Body Parameters Section
    if (
      endpoint.requestBody?.fields &&
      endpoint.requestBody.fields.length > 0
    ) {
      mdxContent += `<H3Bordered text="Body" />\n\n`;
      const topLevelFields = endpoint.requestBody.fields;

      for (const field of topLevelFields) {
        const fieldName = field.name;
        const fieldRequired = field.required ?? false;
        const fieldDescription = field.description || "";
        const fieldChildren = field.childFields;
        const { isEnum, displayType, options } = getEnumDetails(field);

        if (
          fieldChildren &&
          fieldChildren.length > 0 &&
          !(field.type === "array" && isEnum)
        ) {
          // Top-level Object/Array (Non-Enum): Use ParamField > Expandable
          mdxContent += `<ParamField body="${fieldName}" type="${field.type}" required={${fieldRequired}}>\n`;
          // Add description for container if present
          if (fieldDescription) mdxContent += `  <p>${fieldDescription}</p>\n`;
          mdxContent += `  <Expandable title="${fieldName} details">\n`;
          let nestedMdx = "";
          const childParentPath = fieldName;
          for (const nestedField of fieldChildren) {
            nestedMdx += generateParamMdxRecursive(
              nestedField.name,
              nestedField,
              childParentPath
            );
          }
          mdxContent += nestedMdx
            .split("\n")
            .map((line) => `    ${line}`)
            .join("\n")
            .trimEnd();
          mdxContent += `\n  </Expandable>\n`;
          mdxContent += `</ParamField>\n`;
        } else {
          // Top-level Simple Type OR Enum (string/array)
          let finalDescription = "";
          if (isEnum) {
            const formattedOptions = formatEnumOptions(options);
            finalDescription = fieldDescription
              ? `<p>${fieldDescription}</p><p>${formattedOptions}</p>`
              : `<p>${formattedOptions}</p>`;
          } else {
            finalDescription = fieldDescription
              ? `<p>${fieldDescription}</p>`
              : "";
          }
          mdxContent += `<ParamField body="${fieldName}" type="${displayType}" required={${fieldRequired}}>${finalDescription}</ParamField>\n`;
        }
      }
    } else {
      mdxContent += `\n{/* No request body parameters defined for this endpoint. */}\n`;
    }

    // 3. Add Request Example Section
    mdxContent += `\n${generateRequestExample(endpoint)}\n`;

    // 4. Add Response Example Section
    mdxContent += `\n${generateResponseExample(endpoint)}\n`;

    // Write the file
    fs.writeFileSync(outputPath, mdxContent);
    console.log(`Generated MDX file: ${outputPath}`);
    return relativeOutputPathWithoutExt;
  } catch (error: any) {
    console.error(
      `Error generating MDX file for endpoint "${endpoint.title}": ${error.message}`
    );
    if (error.stack) console.error(error.stack);
    return null;
  }
}
