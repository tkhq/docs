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
import { generateMdxFile } from "./utils/mdx-generator";
import path from "path";
import fs from "fs";

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

      // Collect generated MDX paths for docs.json update
      const activityPaths: string[] = [];
      const queryPaths: string[] = [];

      for (const endpoint of endpointResult.endpoints) {
        // Pass the mdxAddOnly flag and capture the generated path
        const generatedPath = generateMdxFile(
          endpoint,
          absoluteMdxOutputDir,
          options.mdxAddOnly
        );

        if (generatedPath) {
          // Construct the full path needed for docs.json
          const fullDocsPath = path.join("api-reference", generatedPath);

          if (endpoint.type === "activity") {
            activityPaths.push(fullDocsPath);
          } else if (endpoint.type === "query") {
            queryPaths.push(fullDocsPath);
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
        // console.log("docsConfig", docsConfig.navigation);
        // Define overview paths
        const activityOverviewPath = path.join(
          relativeMdxBaseDir,
          "activities",
          "overview"
        );
        const queryOverviewPath = path.join(
          relativeMdxBaseDir,
          "queries",
          "overview"
        );

        // Remove duplicates before sorting
        const uniqueActivityPaths = [...new Set(activityPaths)];
        const uniqueQueryPaths = [...new Set(queryPaths)];

        // Sort generated paths alphabetically
        uniqueActivityPaths.sort();
        uniqueQueryPaths.sort();

        // --- Find and Update Navigation ---
        // Check if docsConfig.navigation is an array before proceeding
        if (!docsConfig || !docsConfig.navigation) {
          console.error(
            `Error: Expected 'docs.json' to have a top-level 'navigation' array.`
          );
          throw new Error("'docs.json' structure is not as expected."); // Or handle more gracefully
        }

        // Find the API Reference tab
        const apiRefTab = docsConfig.navigation.tabs.find(
          (item: any) => item.tab === "API Reference"
        );

        if (apiRefTab && Array.isArray(apiRefTab.pages)) {
          // Find and update Activities group
          const activitiesGroup = apiRefTab.pages.find(
            (item: any) =>
              typeof item === "object" && item.group === "Activities"
          );
          if (activitiesGroup) {
            activitiesGroup.pages = [
              activityOverviewPath,
              ...uniqueActivityPaths,
            ];
            console.log(`Updated Activities paths in docs.json`);
          } else {
            console.warn(
              `Could not find 'Activities' group in docs.json under 'API Reference'`
            );
          }

          // Find and update Queries group
          const queriesGroup = apiRefTab.pages.find(
            (item: any) => typeof item === "object" && item.group === "Queries"
          );
          if (queriesGroup) {
            queriesGroup.pages = [queryOverviewPath, ...uniqueQueryPaths];
            console.log(`Updated Queries paths in docs.json`);
          } else {
            console.warn(
              `Could not find 'Queries' group in docs.json under 'API Reference - V2'`
            );
          }
        } else {
          console.warn(
            `Could not find 'API Reference - V2' tab in docs.json navigation`
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
