/**
 * Chain builder utilities for constructing redirect chains
 */

import { Redirect, RedirectChain, RedirectMap, RedirectStep } from "../types";
import { hasPathParameters, matchPath, applyParameters } from "./parser";

/**
 * Maximum number of steps allowed in a redirect chain to prevent infinite loops
 */
const MAX_CHAIN_LENGTH = 10;

/**
 * Builds a chain of redirects for a given source path
 * @param sourcePath The starting source path
 * @param redirectMap Map of all redirects
 * @returns A redirect chain from source to final destination
 */
export function buildRedirectChain(
  sourcePath: string,
  redirectMap: RedirectMap
): RedirectChain {
  const visited = new Set<string>();
  const steps: RedirectStep[] = [];
  
  // Add the source as the first step
  steps.push({
    path: sourcePath,
    type: "source"
  });
  
  let currentPath = sourcePath;
  visited.add(currentPath);
  
  // Follow the redirect chain
  while (redirectMap[currentPath] && steps.length < MAX_CHAIN_LENGTH) {
    const nextPath = redirectMap[currentPath].destination;
    
    // If we've already seen this path, we have a circular redirect
    if (visited.has(nextPath)) {
      steps.push({
        path: nextPath,
        type: "intermediate" // Mark as intermediate even though it's circular
      });
      break;
    }
    
    // Add this step to the chain
    const isDestination = !redirectMap[nextPath];
    steps.push({
      path: nextPath,
      type: isDestination ? "destination" : "intermediate"
    });
    
    // Update for next iteration
    visited.add(nextPath);
    if (isDestination) {
      break;
    }
    currentPath = nextPath;
  }
  
  return {
    sourcePath,
    steps,
    finalDestination: steps[steps.length - 1].path
  };
}

/**
 * Builds chains for all redirects in the map
 * @param redirectMap Map of all redirects
 * @returns Array of redirect chains
 */
export function buildAllRedirectChains(
  redirectMap: RedirectMap
): RedirectChain[] {
  const chains: RedirectChain[] = [];
  
  for (const sourcePath in redirectMap) {
    chains.push(buildRedirectChain(sourcePath, redirectMap));
  }
  
  return chains;
}

/**
 * Resolves parametrized redirects by applying parameter values
 * @param sourcePath Concrete source path with actual values
 * @param pattern Source path pattern with parameters
 * @param destination Destination path with potential parameters
 * @returns Resolved destination with parameters applied
 */
export function resolveParametrizedRedirect(
  sourcePath: string,
  pattern: string,
  destination: string
): string | null {
  // If no parameters in pattern or destination, return as is
  if (!hasPathParameters(pattern) && !hasPathParameters(destination)) {
    return destination;
  }
  
  // Try to match the concrete path against the pattern
  const params = matchPath(pattern, sourcePath);
  if (!params) {
    return null; // No match
  }
  
  // Apply the parameters to the destination
  return applyParameters(destination, params);
}

/**
 * Detects if a redirect chain has a circular reference
 * @param chain The redirect chain to check
 * @returns True if a circular reference is detected
 */
export function hasCircularReference(chain: RedirectChain): boolean {
  const pathSet = new Set<string>();
  
  for (const step of chain.steps) {
    if (pathSet.has(step.path)) {
      return true;
    }
    pathSet.add(step.path);
  }
  
  return false;
} 