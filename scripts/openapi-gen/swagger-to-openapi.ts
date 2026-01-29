import * as fs from "fs";
import * as path from "path";
import { convertObj } from "swagger2openapi";

const SWAGGER_PATH = path.resolve(__dirname, "../../public_api.swagger.json");
const OUTPUT_PATH = path.resolve(__dirname, "openapi.json");

// Doing some custom key ordering to match the old openapi.json and minimize diffs in initial change
const KEY_ORDERS: Record<string, string[]> = {
  root: [
    "openapi", "info", "servers", "security", "tags",
    "paths", "components", "x-tagGroups", "x-original-swagger-version",
  ],
  info: ["title", "description", "contact", "version"],
  operation: [
    "tags", "summary", "description", "operationId",
    "requestBody", "responses", "x-codegen-request-body-name",
  ],
};

// Utility to order keys of an object based on a specified order
function orderKeys(obj: any, order: string[]): any {
  const ordered: Record<string, unknown> = {};
  for (const key of order) {
    if (key in obj) ordered[key] = obj[key];
  }
  // Append any remaining keys not in the order list
  for (const key of Object.keys(obj)) {
    if (!(key in ordered)) ordered[key] = obj[key];
  }
  return ordered;
}

// Reorder keys in each operation under paths
function reorderPaths(paths: any): any {
  const result: Record<string, any> = {};
  for (const [pathKey, methods] of Object.entries<any>(paths)) {
    result[pathKey] = {};
    for (const [method, operation] of Object.entries<any>(methods)) {
      result[pathKey][method] = orderKeys(operation, KEY_ORDERS.operation);
    }
  }
  return result;
}

async function main() {
  const swagger = JSON.parse(fs.readFileSync(SWAGGER_PATH, "utf-8"));

  const { openapi } = await convertObj(swagger, {
    patch: true,
    warnOnly: true,
  });

  const ordered = orderKeys(
    {
      openapi: "3.0.1",
      info: orderKeys(openapi.info, KEY_ORDERS.info),
      servers: openapi.servers,
      security: openapi.security,
      tags: openapi.tags,
      paths: reorderPaths(openapi.paths),
      components: openapi.components,
      "x-tagGroups": (openapi as any)["x-tagGroups"],
      "x-original-swagger-version": swagger.swagger,
    },
    KEY_ORDERS.root,
  );

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(ordered, null, 2));
  console.log(`Converted Swagger 2.0 → OpenAPI 3.0.1 and wrote to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("Conversion failed:", err);
  process.exit(1);
});
