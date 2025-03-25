/**
 * Validator utilities for validating redirect chains
 */

import {
  RedirectChain,
  ValidationResult,
  ValidationStatus,
  ValidationConfig,
} from "../types";
import { hasCircularReference } from "./chain-builder";
import { fetch } from "undici";

/**
 * Default validation configuration
 */
const DEFAULT_CONFIG: ValidationConfig = {
  baseUrl: "https://localhost",
  checkDestinations: false,
};

/**
 * Validates a single redirect chain
 * @param chain The redirect chain to validate
 * @param config Validation configuration options
 * @returns Validation result for the chain
 */
export async function validateRedirectChain(
  chain: RedirectChain,
  config: ValidationConfig = DEFAULT_CONFIG
): Promise<ValidationResult> {
  const issues: string[] = [];
  let status: ValidationStatus = "valid";

  // Check for circular references
  if (hasCircularReference(chain)) {
    issues.push(`Circular reference detected in redirect chain`);
    status = "invalid";
  }

  // Check for excessive chain length
  if (chain.steps.length > 10) {
    issues.push(`Redirect chain is too long (${chain.steps.length} steps)`);
    status = "warning";
  }

  // Check if the final destination is defined
  if (!chain.finalDestination) {
    issues.push("No final destination found in redirect chain");
    status = "invalid";
  }

  // Check if destination actually exists by making a request (if enabled)
  if (config.checkDestinations && chain.finalDestination) {
    try {
      const destinationUrl = new URL(
        chain.finalDestination,
        config.baseUrl
      ).toString();

      const response = await fetch(destinationUrl, {
        method: "HEAD",
        redirect: "manual",
      });

      // Consider 2xx and 3xx as valid responses
      if (response.status >= 400) {
        issues.push(`Final destination returns HTTP status ${response.status}`);
        status = status === "valid" ? "warning" : status;
      }
    } catch (error) {
      issues.push(
        `Error checking final destination: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      status = status === "valid" ? "warning" : status;
    }
  }

  return {
    sourcePath: chain.sourcePath,
    status,
    chain,
    issues: issues.length > 0 ? issues : undefined,
  };
}

/**
 * Validates all redirect chains
 * @param chains Array of redirect chains to validate
 * @param config Validation configuration options
 * @returns Array of validation results
 */
export async function validateAllRedirectChains(
  chains: RedirectChain[],
  config: ValidationConfig = DEFAULT_CONFIG
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  for (const chain of chains) {
    const result = await validateRedirectChain(chain, config);
    results.push(result);
  }

  return results;
}

/**
 * Simulates following a redirect chain to verify it matches the expected sequence
 * @param chain The redirect chain to simulate
 * @param config Validation configuration
 * @returns Validation result with any deviations noted
 */
export async function simulateRedirectChain(
  chain: RedirectChain,
  config: ValidationConfig = DEFAULT_CONFIG
): Promise<ValidationResult> {
  const issues: string[] = [];
  let status: ValidationStatus = "valid";

  if (chain.steps.length <= 1) {
    issues.push("Chain has no redirect steps");
    return {
      sourcePath: chain.sourcePath,
      status: "warning",
      chain,
      issues,
    };
  }

  try {
    const sourceUrl = new URL(chain.sourcePath, config.baseUrl).toString();

    // Fetch with `redirect: manual` to handle redirects ourselves
    const response = await fetch(sourceUrl, {
      method: "HEAD",
      redirect: "manual",
    });

    // Check if we got a redirect
    if (response.status !== 301 && response.status !== 302) {
      issues.push(
        `Expected redirect (301/302) but got status ${response.status}`
      );
      status = "invalid";
    } else {
      // Compare the actual redirect with our expected chain
      const actualLocation = response.headers.get("location");
      const expectedNext = chain.steps[1].path;

      if (!actualLocation) {
        issues.push("Redirect has no Location header");
        status = "invalid";
      } else if (!actualLocation.endsWith(expectedNext)) {
        issues.push(
          `Redirect goes to ${actualLocation} instead of expected ${expectedNext}`
        );
        status = "invalid";
      }
    }
  } catch (error) {
    issues.push(
      `Error simulating redirect: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    status = "warning";
  }

  return {
    sourcePath: chain.sourcePath,
    status,
    chain,
    issues: issues.length > 0 ? issues : undefined,
  };
}
