#!/usr/bin/env ts-node

/**
 * Redirect Validation Utility
 *
 * This script validates the redirect configurations in the vercel.json file
 * by ensuring that each source path correctly leads to its final destination.
 */

import { readVercelConfig, createRedirectMap } from "./utils/parser";
import { buildAllRedirectChains } from "./utils/chain-builder";
import { validateAllRedirectChains } from "./utils/validator";
import { generateValidationReport, printValidationSummary, saveValidationReport } from "./utils/reporter";
import { Redirect, RedirectMap, ValidationConfig } from "./types";

/**
 * Parse command line arguments
 * @returns The parsed command line arguments
 */
function parseCommandLineArgs(): ValidationConfig {
  const args = process.argv.slice(2);
  const config: ValidationConfig = {
    baseUrl: "https://docs.turnkey.com",
    checkDestinations: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === "--check-destinations") {
      if (i + 1 < args.length) {
        const value = args[i + 1].toLowerCase();
        config.checkDestinations = value === "true";
        i++; // Skip the next argument since we've processed it
      }
    } else if (arg.startsWith("--check-destinations=")) {
      const value = arg.split("=")[1].toLowerCase();
      config.checkDestinations = value === "true";
    } else if (arg === "--base-url") {
      if (i + 1 < args.length) {
        config.baseUrl = args[i + 1];
        i++; // Skip the next argument since we've processed it
      }
    } else if (arg.startsWith("--base-url=")) {
      config.baseUrl = arg.split("=")[1];
    }
  }

  return config;
}

/**
 * Main function to run the redirect validation
 */
async function main() {
  try {
    console.log("🔍 Redirect Validation Utility");
    console.log("==============================\n");

    // Parse command line arguments
    const config = parseCommandLineArgs();
    console.log(`Configuration:`);
    console.log(`- Base URL: ${config.baseUrl}`);
    console.log(`- Check destinations: ${config.checkDestinations}\n`);

    // Step 1: Parse the vercel.json file
    console.log("Step 1: Reading vercel.json configuration...");
    const { redirects } = readVercelConfig();
    console.log(`Found ${redirects.length} redirects in vercel.json\n`);

    // Step 2: Create a map of source paths to destinations
    console.log("Step 2: Creating redirect map...");
    const redirectMap = createRedirectMap(redirects);
    console.log(
      `Created mapping for ${Object.keys(redirectMap).length} redirect sources\n`
    );

    // Log basic information about the redirects
    console.log("Redirect Summary:");
    console.log("----------------");
    console.log(`Total redirects: ${redirects.length}`);

    const permanentRedirects = redirects.filter((r) => r.permanent).length;
    const temporaryRedirects = redirects.length - permanentRedirects;
    console.log(`Permanent redirects (301): ${permanentRedirects}`);
    console.log(`Temporary redirects (302): ${temporaryRedirects}`);

    const pathParamRedirects = redirects.filter((r) =>
      r.source.includes(":")
    ).length;
    console.log(`Redirects with path parameters: ${pathParamRedirects}\n`);

    // Step 3: Build redirect chains
    console.log("Step 3: Building redirect chains...");
    const redirectChains = buildAllRedirectChains(redirectMap);
    console.log(`Built ${redirectChains.length} redirect chains\n`);

    // Step 4: Validate redirect chains
    console.log("Step 4: Validating redirect chains...");
    if (config.checkDestinations) {
      console.log("This may take a moment as we're checking destination endpoints...");
    }
    const validationResults = await validateAllRedirectChains(
      redirectChains,
      config
    );
    console.log(`Completed validation of ${validationResults.length} redirect chains\n`);

    // Step 5: Generate and display validation report
    console.log("Step 5: Generating validation report...");
    const validationReport = generateValidationReport(validationResults);
    
    // Print summary to console
    printValidationSummary(validationReport);
    
    // Save detailed report to file
    const reportPath = "redirect-validation-report.md";
    saveValidationReport(validationReport, reportPath);
    
    if (validationReport.invalidRedirects > 0) {
      process.exit(1); // Exit with error if invalid redirects found
    }
    
    console.log("\n✅ Validation completed successfully");
  } catch (error) {
    console.error("❌ Error during redirect validation:");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

// Run the main function
main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
