import fs from "fs";
import path from "path";
import { ApiEndpoint } from "../endpoint-parser/types";
import {
  generateParamMdxRecursive,
  generateResponseFieldMdxRecursive,
  generateJsonPayloadRecursive,
} from "./generator";

const BASE_URL = "https://authproxy.turnkey.com";
const AUTH_HEADER = "X-Auth-Proxy-Config-Id";

// --- Helper: Generate curl request example ---
function generateRequestExample(endpoint: ApiEndpoint): string {
  const url = `${BASE_URL}${endpoint.path}`;
  const fields = endpoint.requestBody?.fields || [];
  const dataPayloadObject = generateJsonPayloadRecursive(fields, endpoint.path);

  const dataPayloadString = JSON.stringify(
    dataPayloadObject,
    (_key, value) => (typeof value === "bigint" ? value.toString() : value),
    4
  );
  const escapedDataPayloadString = dataPayloadString.replace(/'/g, "'\\''");

  const curlCommand =
    "```bash title=\"cURL\"\n" +
    "curl --request POST \\\n" +
    `  --url ${url} \\\n` +
    "  --header 'Accept: application/json' \\\n" +
    "  --header 'Content-Type: application/json' \\\n" +
    `  --header "${AUTH_HEADER}: <string> (see Authorizations)" \\\n` +
    `  --data '${escapedDataPayloadString}'\n` +
    "```";

  return `<RequestExample>\n\n${curlCommand}\n\n</RequestExample>`;
}

// --- Helper: Generate response example ---
function generateResponseExample(endpoint: ApiEndpoint): string {
  const successResponse = endpoint.responses?.find(
    (res) => res.statusCode === 200
  );

  let resultPayload: Record<string, any>;
  if (successResponse?.fields) {
    resultPayload = generateJsonPayloadRecursive(
      successResponse.fields,
      endpoint.path
    );
  } else {
    resultPayload = { "<result_key>": "<result_value>" };
  }

  const responseJsonString = JSON.stringify(
    resultPayload,
    (_key, value) => (typeof value === "bigint" ? value.toString() : value),
    2
  );

  return `<ResponseExample>\n\n\`\`\`json 200\n${responseJsonString}\n\`\`\`\n\n</ResponseExample>`;
}

// --- Main MDX content generation for auth proxy endpoints ---
function generateAuthProxyMdxContent(endpoint: ApiEndpoint): string {
  let mdxContent = `---
title: "${endpoint.title || "API Endpoint"}"
description: "${endpoint.description || "API endpoint documentation"}"
---

import { H3Bordered } from "/snippets/h3-bordered.mdx";
import { NestedParam } from "/snippets/nested-param.mdx";

<div class="flex w-full flex-col bg-background-light dark:bg-background-dark border-standard rounded-2xl p-1.5 mb-4">
  <div class="flex items-center space-x-1.5">
    <div class="relative flex-1 flex gap-2 min-w-0 rounded-xl items-center cursor-pointer p-1.5 border-standard">
      <div class="rounded-lg font-bold px-1.5 py-0.5 text-sm leading-5 bg-blue-400/20 dark:bg-blue-400/20 text-blue-700 dark:text-blue-400">POST</div>
      <div class="text-sm font-mono text-gray-800 dark:text-white">${BASE_URL}${endpoint.path}</div>
    </div>
  </div>
</div>

<H3Bordered text="Authorizations" />

<ParamField header="${AUTH_HEADER}" type="string" required={true}>
  Your Auth Proxy config ID, found in **Dashboard → AUTH**. See [Auth Proxy reference](/reference/auth-proxy) for setup.
</ParamField>

`;

  // Request body
  if (endpoint.requestBody?.fields && endpoint.requestBody.fields.length > 0) {
    mdxContent += `<H3Bordered text="Body" />\n\n`;
    for (const field of endpoint.requestBody.fields) {
      mdxContent += generateParamMdxRecursive(field.name, field, "");
    }
  }

  // Response fields
  const successResponse = endpoint.responses?.find(
    (res) => res.statusCode === 200
  );
  if (successResponse?.fields && successResponse.fields.length > 0) {
    mdxContent += `\n<H3Bordered text="Response" />\n`;
    mdxContent += `A successful response returns the following fields:\n\n`;
    for (const field of successResponse.fields) {
      mdxContent += generateResponseFieldMdxRecursive(field);
    }
  } else {
    mdxContent += `\n{/* No explicit 200 response schema defined. */}\n`;
  }

  // Examples
  mdxContent += `\n${generateRequestExample(endpoint)}\n`;
  mdxContent += `\n${generateResponseExample(endpoint)}\n`;

  return mdxContent;
}

// --- Main file generation function for auth proxy endpoints ---
// Uses the path slug (without version suffix) as the filename so that
// e.g. /v1/otp_init_v2 → otp-init.mdx (concept name, not version name).
export function generateAuthProxyMdxFile(
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

  const slug = (endpoint.path.split("/").filter(Boolean).pop() || endpoint.title)
    .replace(/_v\d+$/, ""); // strip version suffix

  const kebabCaseSlug = slug
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  const filename = `${kebabCaseSlug}.mdx`;
  const outputPath = path.join(baseOutputDir, filename);

  if (!fs.existsSync(baseOutputDir)) {
    fs.mkdirSync(baseOutputDir, { recursive: true });
  }

  if (addOnly && fs.existsSync(outputPath)) {
    console.log(`Skipping existing file (addOnly=true): ${outputPath}`);
    return kebabCaseSlug;
  }

  try {
    const mdxContent = generateAuthProxyMdxContent(endpoint);
    fs.writeFileSync(outputPath, mdxContent);
    console.log(`Generated MDX file: ${outputPath}`);
    return kebabCaseSlug;
  } catch (error: any) {
    console.error(
      `Error generating auth proxy MDX file for endpoint "${endpoint.title}": ${error.message}`
    );
    if (error.stack) console.error(error.stack);
    return null;
  }
}
