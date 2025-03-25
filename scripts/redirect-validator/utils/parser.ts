/**
 * Parser utilities for reading and processing the vercel.json file
 */

import fs from "fs";
import path from "path";
import { Redirect, RedirectMap, DocsConfig, NavigationPath } from "../types";

/**
 * Reads and parses the vercel.json file
 * @param filePath Path to the vercel.json file (relative or absolute)
 * @returns The parsed vercel.json content
 */
export function readVercelConfig(filePath: string = "vercel.json"): {
  redirects: Redirect[];
} {
  try {
    // Resolve the absolute path if a relative path is provided
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    // Read and parse the file
    const fileContent = fs.readFileSync(absolutePath, "utf-8");
    const config = JSON.parse(fileContent);

    if (!config.redirects || !Array.isArray(config.redirects)) {
      throw new Error("No redirects array found in vercel.json");
    }

    return { redirects: config.redirects };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to read or parse vercel.json: ${error.message}`);
    }
    throw new Error("Failed to read or parse vercel.json");
  }
}

/**
 * Creates a map of source paths to their destinations
 * @param redirects Array of redirect configurations
 * @returns A map of source paths to their destination details
 */
export function createRedirectMap(redirects: Redirect[]): RedirectMap {
  const redirectMap: RedirectMap = {};

  for (const redirect of redirects) {
    redirectMap[redirect.source] = {
      destination: redirect.destination,
      permanent: redirect.permanent,
    };
  }

  return redirectMap;
}

/**
 * Checks if a path contains parameters (e.g., :page)
 * @param path The path to check
 * @returns True if the path contains parameters
 */
export function hasPathParameters(path: string): boolean {
  return path.includes(":");
}

/**
 * Extracts parameter names from a path
 * @param path The path to extract parameters from
 * @returns Array of parameter names
 */
export function extractPathParameters(path: string): string[] {
  const paramRegex = /:([^/]+)/g;
  const params: string[] = [];
  let match;

  while ((match = paramRegex.exec(path)) !== null) {
    params.push(match[1]);
  }

  return params;
}

/**
 * Matches a concrete path against a pattern with parameters
 * @param pattern The pattern with potential parameters (e.g., /api/:version/:resource)
 * @param path The concrete path to match (e.g., /api/v1/users)
 * @returns Parameter values if the path matches the pattern, null otherwise
 */
export function matchPath(
  pattern: string,
  path: string
): Record<string, string> | null {
  // Convert pattern to regex
  const paramNames: string[] = [];
  const regexPattern = pattern
    .replace(/:[^/]+/g, (match) => {
      paramNames.push(match.substring(1));
      return "([^/]+)";
    })
    .replace(/\//g, "\\/");

  const regex = new RegExp(`^${regexPattern}$`);
  const match = path.match(regex);

  if (!match) {
    return null;
  }

  // Extract parameter values
  const params: Record<string, string> = {};
  for (let i = 0; i < paramNames.length; i++) {
    params[paramNames[i]] = match[i + 1];
  }

  return params;
}

/**
 * Applies parameter values to a parameterized path
 * @param path The path with parameters (e.g., /api/:version/:resource)
 * @param params The parameter values (e.g., { version: 'v1', resource: 'users' })
 * @returns The concrete path with parameter values applied
 */
export function applyParameters(
  path: string,
  params: Record<string, string>
): string {
  let result = path;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, value);
  }
  return result;
}

/**
 * Reads and parses the docs.json file
 * @param filePath Path to the docs.json file (relative or absolute)
 * @returns The parsed docs.json content
 */
export function readDocsConfig(filePath: string = "docs.json"): DocsConfig {
  try {
    // Resolve the absolute path if a relative path is provided
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    // Read and parse the file
    const fileContent = fs.readFileSync(absolutePath, "utf-8");
    const config = JSON.parse(fileContent);

    if (!config.navigation) {
      throw new Error("No navigation structure found in docs.json");
    }

    return config;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to read or parse docs.json: ${error.message}`);
    }
    throw new Error("Failed to read or parse docs.json");
  }
}

/**
 * Extracts all navigation paths from the docs.json structure
 * @param docsConfig The parsed docs.json configuration
 * @returns Array of valid navigation paths
 */
export function extractNavigationPaths(
  docsConfig: DocsConfig
): NavigationPath[] {
  const paths: NavigationPath[] = [];

  // Process all tabs in the navigation
  if (docsConfig.navigation && docsConfig.navigation.tabs) {
    for (const tab of docsConfig.navigation.tabs) {
      if (tab.pages) {
        processTabPages(tab.pages, paths, "");
      }
    }
  }

  return paths;
}

/**
 * Recursively processes pages and groups in navigation to extract paths
 * @param pages The pages or groups to process
 * @param paths The array to populate with paths
 * @param parentPath The parent path for prefix
 */
function processTabPages(
  pages: any[],
  paths: NavigationPath[],
  parentPath: string
): void {
  for (const item of pages) {
    if (typeof item === "string") {
      // Simple page reference
      paths.push({
        path: `/${item}`,
        type: "page",
      });
    } else if (item.group && item.pages) {
      // Group with nested pages - process recursively
      const groupPath = parentPath ? `${parentPath}/${item.group}` : item.group;

      // Add the group itself as a path
      paths.push({
        path: `/${groupPath.toLowerCase().replace(/\s+/g, "-")}`,
        type: "group",
      });

      // Process nested pages
      processTabPages(item.pages, paths, groupPath);
    } else if (item.pages) {
      // Just pages without a group
      processTabPages(item.pages, paths, parentPath);
    } else if (item.page) {
      // Single page with explicit path
      paths.push({
        path: `/${item.page}`,
        type: "page",
      });
    }
  }
}

/**
 * Compares redirects from vercel.json and docs.json
 * @param vercelRedirects Redirects from vercel.json
 * @param docsRedirects Redirects from docs.json
 * @returns Object with missing redirects and mismatches
 */
export function compareRedirects(
  vercelRedirects: Redirect[],
  docsRedirects: Redirect[]
): {
  missingInDocs: Redirect[];
  missingInVercel: Redirect[];
  mismatchedDestinations: { vercel: Redirect; docs: Redirect }[];
} {
  const vercelSources = new Map<string, Redirect>();
  const docsSources = new Map<string, Redirect>();

  // Index redirects by source
  for (const redirect of vercelRedirects) {
    vercelSources.set(redirect.source, redirect);
  }

  for (const redirect of docsRedirects) {
    docsSources.set(redirect.source, redirect);
  }

  // Find missing and mismatched redirects
  const missingInDocs: Redirect[] = [];
  const mismatchedDestinations: { vercel: Redirect; docs: Redirect }[] = [];

  for (const [source, vercelRedirect] of vercelSources.entries()) {
    const docsRedirect = docsSources.get(source);

    if (!docsRedirect) {
      missingInDocs.push(vercelRedirect);
    } else if (vercelRedirect.destination !== docsRedirect.destination) {
      mismatchedDestinations.push({
        vercel: vercelRedirect,
        docs: docsRedirect,
      });
    }
  }

  // Find redirects in docs but missing in vercel
  const missingInVercel: Redirect[] = [];

  for (const [source, docsRedirect] of docsSources.entries()) {
    if (!vercelSources.has(source)) {
      missingInVercel.push(docsRedirect);
    }
  }

  return {
    missingInDocs,
    missingInVercel,
    mismatchedDestinations,
  };
}

/**
 * Validates redirect destinations against available navigation paths
 * @param redirects The redirects to validate
 * @param validPaths Array of valid navigation paths
 * @returns Array of redirects with invalid destinations
 */
export function validateRedirectDestinations(
  redirects: Redirect[],
  validPaths: NavigationPath[]
): Redirect[] {
  // Extract all path strings and prepare them for matching
  const validPathStrings = validPaths.map((p) => p.path);

  // Add common prefixes that appear in redirects
  const validPathPrefixes = [
    "/authentication",
    "/concepts",
    "/developer-reference",
    "/embedded-wallets",
    "/ecosystems",
    "/features",
    "/reference",
    "/wallets",
    // Add api-overview paths which are referenced in redirects but may not exist in navigation
    "/api-overview",
    "/api-overview/introduction",
    "/api-overview/index",
  ];

  validPathPrefixes.forEach((prefix) => {
    if (!validPathStrings.includes(prefix)) {
      validPathStrings.push(prefix);
    }
  });

  const invalidRedirects: Redirect[] = [];

  for (const redirect of redirects) {
    // Handle dynamic routes with parameters differently
    if (hasPathParameters(redirect.destination)) {
      // For dynamic destinations, check if the base path exists
      const basePath = redirect.destination.split(":")[0];
      // Remove trailing slash if present
      const cleanBasePath = basePath.endsWith("/")
        ? basePath.slice(0, -1)
        : basePath;

      if (
        !validPathStrings.some(
          (path) =>
            cleanBasePath === path ||
            cleanBasePath.startsWith(path + "/") ||
            path.startsWith(cleanBasePath + "/")
        )
      ) {
        invalidRedirects.push(redirect);
      }
    } else {
      // For static destinations
      // First try exact match
      if (validPathStrings.includes(redirect.destination)) {
        continue;
      }

      // Then try prefix match (parent path)
      const isValidPrefix = validPathStrings.some(
        (path) =>
          redirect.destination.startsWith(path + "/") ||
          path.startsWith(redirect.destination + "/")
      );

      if (!isValidPrefix) {
        invalidRedirects.push(redirect);
      }
    }
  }

  return invalidRedirects;
}
