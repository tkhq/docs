#!/usr/bin/env node

/**
 * OpenAPI Generator
 *
 * This tool parses and dereferences OpenAPI specifications, with the ability
 * to output the full or filtered specification in various formats.
 */

import { parseOpenAPI } from "./utils/parser";
import { parseArguments, CliOptions } from "./utils/cli";
import { outputResults } from "./utils/formatter";
import { handleError } from "./utils/error-handler";
import {
  parseApiEndpoints,
  formatApiEndpoints,
  ApiEndpointParserResult,
} from "./utils/endpoint-parser";
import { generateMdxFile, generateAuthProxyMdxFile } from "./utils/mdx-generator";
import path from "path";
import fs from "fs";

const API_CATEGORIES = [
  "Organizations & sub-organizations",
  "Users, access & sessions",
  "Authentication & credentials",
  "Policies & approvals",
  "Wallets & private keys",
  "Signing & broadcasting",
  "Transaction management",
  "Turnkey Verifiable Cloud",
] as const;

type ApiCategory = (typeof API_CATEGORIES)[number];

const TAG_CATEGORY_ALIASES: Record<string, ApiCategory> = {
  Organizations: "Organizations & sub-organizations",
  Features: "Organizations & sub-organizations",
  "IP Allowlist": "Organizations & sub-organizations",
  Users: "Users, access & sessions",
  "User Tags": "Users, access & sessions",
  Invitations: "Users, access & sessions",
  Sessions: "Users, access & sessions",
  "Session Profiles": "Users, access & sessions",
  Email: "Users, access & sessions",
  "API keys": "Authentication & credentials",
  "API Keys": "Authentication & credentials",
  Authenticators: "Authentication & credentials",
  "User Auth": "Authentication & credentials",
  "User Verification": "Authentication & credentials",
  "User Recovery": "Authentication & credentials",
  Policies: "Policies & approvals",
  Activities: "Policies & approvals",
  Consensus: "Policies & approvals",
  "MFA Policies": "Policies & approvals",
  Wallets: "Wallets & private keys",
  "Private Keys": "Wallets & private keys",
  "Private Key Tags": "Wallets & private keys",
  Signing: "Signing & broadcasting",
  Broadcasting: "Signing & broadcasting",
  "Send Transactions": "Signing & broadcasting",
  Swaps: "Transaction management",
  Earn: "Transaction management",
  "On Ramp": "Transaction management",
  TVC: "Turnkey Verifiable Cloud",
  "Boot Proof": "Turnkey Verifiable Cloud",
  "App Proof": "Turnkey Verifiable Cloud",
  Secrets: "Turnkey Verifiable Cloud",
};

const NOOP_CODEGEN_ANCHOR_PATH = "/tkhq/api/v1/noop-codegen-anchor";
const MANUAL_QUERY_PATHS = [
  {
    path: "api-reference/queries/get-webhook-jwks",
    title: "Get webhook JWKS",
    type: "query" as const,
    category: "Organizations & sub-organizations" as ApiCategory,
  },
];

interface CategorizedOperation {
  path: string;
  operationId?: string;
  tags?: string[];
}

function getApiCategory(operation: CategorizedOperation): ApiCategory | null {
  const pathAndId = `${operation.path} ${
    operation.operationId || ""
  }`.toLowerCase();

  if (pathAndId.includes("webhook")) {
    return "Organizations & sub-organizations";
  }
  if (pathAndId.includes("spark") || pathAndId.includes("lightning")) {
    return "Signing & broadcasting";
  }
  if (
    operation.path === "/public/v1/query/get_oauth2_credential" ||
    operation.operationId?.toLowerCase() === "getoauth2credential"
  ) {
    return "Authentication & credentials";
  }

  const categories = (operation.tags || []).map(
    (tag) => TAG_CATEGORY_ALIASES[tag.trim()]
  );
  if (categories.length === 0 || categories.some((category) => !category)) {
    return null;
  }

  const uniqueCategories = new Set(categories);
  return uniqueCategories.size === 1 ? [...uniqueCategories][0] : null;
}

function validatePublicOperationCategories(api: any): void {
  const unsupportedOperations: string[] = [];
  const httpMethods = new Set(["get", "post", "put", "patch", "delete"]);

  for (const [operationPath, pathItem] of Object.entries(api.paths || {})) {
    if (operationPath === NOOP_CODEGEN_ANCHOR_PATH) continue;

    for (const [method, operationValue] of Object.entries(
      pathItem as Record<string, any>
    )) {
      if (!httpMethods.has(method.toLowerCase())) continue;

      const operation = operationValue as Record<string, any>;
      if (
        !getApiCategory({
          path: operationPath,
          operationId: operation.operationId,
          tags: operation.tags,
        })
      ) {
        unsupportedOperations.push(
          operation.operationId || `${method.toUpperCase()} ${operationPath}`
        );
      }
    }
  }

  if (unsupportedOperations.length > 0) {
    throw new Error(
      `API navigation category mapping is missing for operationIds: ${unsupportedOperations.join(
        ", "
      )}`
    );
  }
}

/**
 * Main function
 */
async function main() {
  try {
    const options: CliOptions = parseArguments(process.argv);
    const api = await parseOpenAPI({ filePath: options.file });

    let endpointResult: ApiEndpointParserResult | null = null;
    // Always parse endpoints if either --endpoints or --generate-mdx is requested,
    // as MDX generation depends on the parsed endpoint data.
    if (options.endpoints || options.generateMdx) {
      endpointResult = parseApiEndpoints(api, {
        requiredPropertiesOnly: options.requiredOnly,
      });
    }

    // --- Handle Endpoint Name/Tags Listing Mode ---
    if (options.listEndpointsTags) {
      // Parse endpoints if not already done
      if (!endpointResult) {
        endpointResult = parseApiEndpoints(api, {
          requiredPropertiesOnly: options.requiredOnly,
        });
      }

      // Helper to kebab-case strings and remove '?'
      const kebabCase = (str: string) =>
        str.replace(/\?/g, '').trim().toLowerCase()
          .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      // Build raw list with name, id, type, tags
      const rawList = endpointResult.endpoints.map(ep => {
        const name = ep.title.replace(/\?/g, '').trim();
        const id = kebabCase(name);
        const type = ep.type;
        const tags = (ep.tags || []).map(t => ({
          id: kebabCase(t),
          label: t,
        }));
        return { name, id, type, tags };
      });

      // Deduplicate by id + tag ids
      const uniqueList: { name: string; id: string; type: string; tags: { id: string; label: string }[] }[] = [];
      const seen = new Set<string>();
      for (const item of rawList) {
        const key = `${item.id}|${item.tags.map(t => t.id).join(',')}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueList.push(item);
        }
      }

      // Sort endpoints: activities first, then queries, then alphabetically within each type
      uniqueList.sort((a, b) => {
        // First sort by type: activities before queries
        if (a.type === "activity" && b.type === "query") return -1;
        if (a.type === "query" && b.type === "activity") return 1;
        
        // If same type, sort alphabetically by name
        return a.name.localeCompare(b.name);
      });

      const outPath = options.listEndpointsTags;
      // Ensure target directories exist
      const outDir = path.dirname(outPath);
      fs.mkdirSync(outDir, { recursive: true });
      if (path.extname(outPath).toLowerCase() === ".mdx") {
        // Build endpoints export
        const endpointsStr = JSON.stringify(uniqueList, null, 2);
        // Collect unique tags
        const tagMap = new Map<string, string>();
        uniqueList.forEach(item =>
          item.tags.forEach(tag => tagMap.set(tag.id, tag.label))
        );
        const uniqueTagsArray = Array.from(tagMap.entries()).map(
          ([id, label]) => ({ id, label })
        );
        const tagsStr = JSON.stringify(uniqueTagsArray, null, 2);
        // Construct MDX content with endpoints and tags
        const mdxContent = `export const endpoints = ${endpointsStr};

export const tags = ${tagsStr};`;
        fs.writeFileSync(outPath, mdxContent, "utf-8");
      } else {
        // Default JSON output
        fs.writeFileSync(outPath, JSON.stringify(uniqueList, null, 2), "utf-8");
      }
      console.log(`Endpoint names and tags written to ${outPath}`);
      return;
    }

    // --- Determine Output Mode ---

    if (options.generateMdx) {
      // --- MDX Generation Mode ---
      if (!endpointResult) {
        throw new Error(
          "Endpoint data is required for MDX generation (--endpoints flag might be needed)."
        );
      }
      if (!options.authProxy) {
        validatePublicOperationCategories(api);
      }
      console.log(`--- Starting MDX Generation ---`);

      // Calculate project root (assuming script is in <project_root>/scripts/openapi-gen)
      const projectRoot = path.resolve(__dirname, "..", "..");

      // Resolve output dir relative to project root
      const mdxOutputDirName = options.mdxOutputDir || "api-reference";
      const absoluteMdxOutputDir = path.resolve(projectRoot, mdxOutputDirName);
      const relativeMdxBaseDir = path.relative(
        projectRoot,
        absoluteMdxOutputDir
      );

      console.log(`Output directory: ${absoluteMdxOutputDir}`);
      fs.mkdirSync(absoluteMdxOutputDir, { recursive: true });
      console.log(`Endpoint count: ${endpointResult.endpoints.length}`);

      // In auth-proxy mode, build a set of endpoint paths to skip — those for which
      // a higher-versioned sibling exists (e.g. skip /v1/otp_init when /v1/otp_init_v2 is present).
      const skipEndpointPaths = new Set<string>();
      if (options.authProxy) {
        const versionSuffix = /_v(\d+)$/;
        const allPaths = endpointResult.endpoints.map((e) => e.path);
        for (const p of allPaths) {
          const base = p.replace(versionSuffix, "");
          if (base !== p) {
            // This is a versioned path — mark the unversioned base (v1) for skipping
            skipEndpointPaths.add(base);
          }
        }
      }

      // Collect generated MDX paths for docs.json update. Within each category,
      // queries sort before activities, then operations sort by title.
      const categorizedPaths = new Map<
        ApiCategory,
        { path: string; title: string; type: "activity" | "query" }[]
      >(API_CATEGORIES.map((category) => [category, []]));
      const authProxyPaths: string[] = [];

      for (const endpoint of endpointResult.endpoints) {
        if (
          skipEndpointPaths.has(endpoint.path) ||
          (!options.authProxy && endpoint.path === NOOP_CODEGEN_ANCHOR_PATH)
        ) {
          continue;
        }
        // Use the auth-proxy generator when --auth-proxy is set, main generator otherwise
        const generatedPath = options.authProxy
          ? generateAuthProxyMdxFile(endpoint, absoluteMdxOutputDir, options.mdxAddOnly)
          : generateMdxFile(endpoint, absoluteMdxOutputDir, options.mdxAddOnly);

        if (generatedPath) {
          // Construct the full path needed for docs.json
          const fullDocsPath = path.join(relativeMdxBaseDir, generatedPath);

          if (options.authProxy) {
            authProxyPaths.push(fullDocsPath);
          } else {
            const category = getApiCategory(endpoint);
            if (!category) {
              throw new Error(
                `API navigation category mapping is missing for operationId: ${
                  endpoint.operationId || endpoint.path
                }`
              );
            }
            categorizedPaths.get(category)!.push({
              path: fullDocsPath,
              title: endpoint.title,
              type: endpoint.type,
            });
          }
        }
      }
      console.log(`--- Finished MDX Generation ---`);

      // --- Update docs.json ---
      console.log(`--- Updating docs.json ---`);
      const docsJsonPath = path.resolve(projectRoot, "docs.json");
      try {
        const docsJsonContent = fs.readFileSync(docsJsonPath, "utf-8");

        const docsConfig = JSON.parse(docsJsonContent);

        const uniqueAuthProxyPaths = [...new Set(authProxyPaths)].sort();
        for (const manualPage of MANUAL_QUERY_PATHS) {
          categorizedPaths.get(manualPage.category)!.push(manualPage);
        }

        const categoryGroups = API_CATEGORIES.map((category) => {
          const pagesByPath = new Map(
            categorizedPaths
              .get(category)!
              .map((operation) => [operation.path, operation])
          );
          const operations = [...pagesByPath.values()].sort((a, b) => {
            if (a.type !== b.type) return a.type === "query" ? -1 : 1;
            return (
              a.title.localeCompare(b.title) || a.path.localeCompare(b.path)
            );
          });
          return {
            group: category,
            pages: operations.map((operation) => operation.path),
          };
        });

        // --- Find and Update Navigation ---
        // Check if docsConfig.navigation is an array before proceeding
        if (!docsConfig || !docsConfig.navigation) {
          console.error(
            `Error: Expected 'docs.json' to have a top-level 'navigation' array.`
          );
          throw new Error("'docs.json' structure is not as expected.");
        }

        // Find the API & SDK reference tab
        const apiRefTab = docsConfig.navigation.tabs.find(
          (item: any) => item.tab === "API & SDK reference"
        );

        // Activities and Queries live inside the "REST API" group within the tab
        const restApiGroup = apiRefTab?.pages?.find(
          (item: any) => typeof item === "object" && item.group === "REST API"
        );

        if (restApiGroup && Array.isArray(restApiGroup.pages)) {
          if (options.authProxy && options.navGroup) {
            // Auth-proxy mode: find or create the named nav group and set its pages
            let navGroup = restApiGroup.pages.find(
              (item: any) => typeof item === "object" && item.group === options.navGroup
            );
            if (!navGroup) {
              navGroup = { group: options.navGroup, pages: [] };
              restApiGroup.pages.push(navGroup);
              console.log(`Created new nav group '${options.navGroup}' in docs.json`);
            }
            navGroup.pages = uniqueAuthProxyPaths;
            console.log(`Updated '${options.navGroup}' paths in docs.json`);
          } else {
            const generatedGroupNames = new Set([
              "Activities",
              "Queries",
              ...API_CATEGORIES,
            ]);
            const overviewPaths = new Set([
              "api-reference/activities/overview",
              "api-reference/queries/overview",
            ]);
            const firstGeneratedGroupIndex = restApiGroup.pages.findIndex(
              (item: any) =>
                typeof item === "object" && generatedGroupNames.has(item.group)
            );
            const insertionIndex = restApiGroup.pages
              .slice(0, Math.max(firstGeneratedGroupIndex, 0))
              .filter(
                (item: any) =>
                  !overviewPaths.has(item) &&
                  !(
                    typeof item === "object" &&
                    generatedGroupNames.has(item.group)
                  )
              ).length;
            const preservedPages = restApiGroup.pages.filter(
              (item: any) =>
                !overviewPaths.has(item) &&
                !(
                  typeof item === "object" &&
                  generatedGroupNames.has(item.group)
                )
            );

            // These describe API-wide request modes, so keep them as standalone
            // primers before the mixed query/activity category groups.
            preservedPages.splice(
              insertionIndex,
              0,
              "api-reference/activities/overview",
              "api-reference/queries/overview",
              ...categoryGroups
            );
            restApiGroup.pages = preservedPages;
            console.log(`Updated tag-based REST API categories in docs.json`);
          }
        } else {
          console.warn(
            `Could not find 'REST API' group in 'API & SDK reference' tab in docs.json navigation`
          );
        }

        // Write updated config back to docs.json
        fs.writeFileSync(
          docsJsonPath,
          JSON.stringify(docsConfig, null, 2) + "\n"
        );
        console.log(`Successfully updated ${docsJsonPath}`);
      } catch (error: any) {
        console.error(
          `Error processing or updating docs.json: ${error.message}`
        );
      }
      console.log(`--- Finished updating docs.json ---`);

      // If --output is ALSO specified, write the formatted endpoints to that file.
      // Resolve this output path relative to the project root as well.
      if (options.output) {
        const absoluteFormattedOutputPath = path.resolve(
          projectRoot,
          options.output
        );
        console.log(
          `Additionally writing formatted endpoints to ${absoluteFormattedOutputPath}`
        );
        const endpointFormat =
          options.format === "yaml" ? "json" : options.format; // Default to json if yaml requested

        formatApiEndpoints(endpointResult, {
          format: endpointFormat,
          outputFile: absoluteFormattedOutputPath, // Use absolute path
          prettyPrint: true,
        });
      }
    } else if (options.endpoints) {
      // --- Formatted Endpoints Mode (JSON/TypeScript) ---
      if (!endpointResult) {
        throw new Error("Endpoint data parsing failed.");
      }
      const endpointFormat =
        options.format === "yaml" ? "json" : options.format; // Default to json if yaml requested

      // Resolve output path relative to project root if specified
      const absoluteFormattedOutputPath = options.output
        ? path.resolve(path.resolve(__dirname, "..", ".."), options.output)
        : undefined;

      const formattedOutput = formatApiEndpoints(endpointResult, {
        format: endpointFormat,
        outputFile: absoluteFormattedOutputPath, // Pass absolute path if provided
        prettyPrint: true,
      });

      // Only write to stdout if no output file was specified
      if (!absoluteFormattedOutputPath) {
        process.stdout.write(formattedOutput);
      } else {
        // Log the absolute path if writing to file
        console.log(`Output written to ${absoluteFormattedOutputPath}`);
      }
    } else {
      // --- Raw OpenAPI Spec Mode (JSON/YAML) ---
      if (options.format === "typescript") {
        throw new Error(
          "TypeScript format is only supported when using the --endpoints or --generate-mdx flags."
        );
      }
      // Resolve output path relative to project root if specified
      const absoluteRawOutputPath = options.output
        ? path.resolve(path.resolve(__dirname, "..", ".."), options.output)
        : undefined;

      outputResults(api, {
        outputFile: absoluteRawOutputPath, // Use absolute path if provided
        jsonPath: options.path,
        format: options.format,
      });
      // Log if written to file
      if (absoluteRawOutputPath) {
        console.log(`Output written to ${absoluteRawOutputPath}`);
      }
    }
  } catch (error) {
    handleError(error);
  }
}

main().catch(handleError);
