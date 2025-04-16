import fs from "fs";
import path from "path";
import { ApiEndpoint } from "../endpoint-parser/types";

/**
 * Converts a title string (e.g., "Get Org Details") to kebab-case.
 */
function titleToKebabCase(title: string): string {
  return title
    .replace(/([A-Z])/g, (match) => `-${match}`) // Add hyphen before caps
    .replace(/[\s_]+/g, "-") // Replace spaces/underscores with hyphen
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
    .toLowerCase(); // Ensure lowercase
}

/**
 * Generates an MDX file for a given API endpoint.
 */
export function generateMdxFile(
  endpoint: ApiEndpoint,
  baseOutputDir: string
): void {
  if (!endpoint.title) {
    console.warn(
      `Skipping MDX generation for endpoint with path ${endpoint.path} due to missing title.`
    );
    return;
  }

  try {
    // Determine filename and subdirectory
    const filename = `${titleToKebabCase(endpoint.title)}.mdx`;
    const subDir = endpoint.type === "query" ? "queries" : "activities";
    const outputDir = path.resolve(baseOutputDir, subDir);
    const outputPath = path.join(outputDir, filename);

    // Ensure the output directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    // Generate frontmatter content
    const frontmatter = `---
title: ${endpoint.title.replace(/:/g, "\\:")}
description: ${endpoint.description.replace(/:/g, "\\:")}
---\n\n`; // Add a newline after frontmatter

    // Write the file
    fs.writeFileSync(outputPath, frontmatter);
    // console.log(`Generated MDX file: ${outputPath}`);
  } catch (error: any) {
    console.error(
      `Error generating MDX file for endpoint \"${endpoint.title}\": ${error.message}`
    );
  }
}
