#!/usr/bin/env ts-node

/**
 * Docs Redirect Validation Utility
 *
 * This script validates the redirect configurations between vercel.json and docs.json,
 * and verifies that all destinations map to valid paths in the navigation structure.
 */

import {
  readVercelConfig,
  readDocsConfig,
  extractNavigationPaths,
  compareRedirects,
  validateRedirectDestinations,
} from "./utils/parser";
import {
  saveComparisonReport,
  saveDestinationValidationReport,
} from "./utils/reporter";
import { Redirect, DestinationValidationResult } from "./types";
import fs from "fs";
import path from "path";

/**
 * Command line configuration options
 */
interface CommandLineOptions {
  checkDestinations: boolean;
  checkConsistency: boolean;
  fixMode: boolean;
}

/**
 * Parse command line arguments
 */
function parseCommandLineArgs(): CommandLineOptions {
  const args = process.argv.slice(2);
  const options: CommandLineOptions = {
    checkDestinations: true,
    checkConsistency: true,
    fixMode: false,
  };

  for (const arg of args) {
    if (arg === "--no-destinations") {
      options.checkDestinations = false;
    } else if (arg === "--no-consistency") {
      options.checkConsistency = false;
    } else if (arg === "--fix") {
      options.fixMode = true;
    }
  }

  return options;
}

/**
 * Main function to run the docs redirect validation
 */
async function main() {
  try {
    console.log("🔍 Docs Redirect Validation Utility");
    console.log("===================================\n");

    // Parse command line args
    const options = parseCommandLineArgs();
    console.log("Options:");
    console.log(`- Check destinations: ${options.checkDestinations}`);
    console.log(`- Check consistency: ${options.checkConsistency}`);
    console.log(`- Fix mode: ${options.fixMode}\n`);

    // Step 1: Read both config files
    console.log("Step 1: Reading configuration files...");
    const { redirects: vercelRedirects } = readVercelConfig();
    const docsConfig = readDocsConfig();
    const docsRedirects = docsConfig.redirects || [];

    console.log(`Found ${vercelRedirects.length} redirects in vercel.json`);
    console.log(`Found ${docsRedirects.length} redirects in docs.json\n`);

    let hasErrors = false;

    // Step 2: Compare redirects between files (if enabled)
    let comparisonResults;
    if (options.checkConsistency || options.fixMode) {
      console.log("Step 2: Comparing redirects between files...");
      comparisonResults = compareRedirects(vercelRedirects, docsRedirects);

      if (options.checkConsistency) {
        console.log(
          `Missing in docs.json: ${comparisonResults.missingInDocs.length}`
        );
        console.log(
          `Missing in vercel.json: ${comparisonResults.missingInVercel.length}`
        );
        console.log(
          `Mismatched destinations: ${comparisonResults.mismatchedDestinations.length}\n`
        );

        // Save the comparison report
        saveComparisonReport(
          comparisonResults,
          "redirect-comparison-report.md"
        );

        // Update error status
        if (
          comparisonResults.missingInDocs.length > 0 ||
          comparisonResults.missingInVercel.length > 0 ||
          comparisonResults.mismatchedDestinations.length > 0
        ) {
          hasErrors = true;
        }
      }
    }

    // Step 3: Validate destinations (if enabled)
    if (options.checkDestinations) {
      console.log("Step 3: Extracting navigation paths from docs.json...");
      const navigationPaths = extractNavigationPaths(docsConfig);
      console.log(`Found ${navigationPaths.length} valid navigation paths\n`);

      console.log("Step 4: Validating redirect destinations...");

      // Validate docs.json redirects
      const docsDestinationResults = validateDestinations(
        docsRedirects,
        navigationPaths
      );
      console.log(
        `docs.json: ${docsDestinationResults.invalidDestinations.length} invalid destinations out of ${docsRedirects.length} redirects`
      );

      // Validate vercel.json redirects
      const vercelDestinationResults = validateDestinations(
        vercelRedirects,
        navigationPaths
      );
      console.log(
        `vercel.json: ${vercelDestinationResults.invalidDestinations.length} invalid destinations out of ${vercelRedirects.length} redirects\n`
      );

      // Save destination validation reports
      saveDestinationValidationReport(
        docsDestinationResults,
        "docs-redirect-validation-report.md"
      );
      saveDestinationValidationReport(
        vercelDestinationResults,
        "vercel-redirect-validation-report.md"
      );

      // Update error status
      if (
        docsDestinationResults.invalidDestinations.length > 0 ||
        vercelDestinationResults.invalidDestinations.length > 0
      ) {
        hasErrors = true;
      }
    }

    // Fix inconsistencies between vercel.json and docs.json
    if (options.fixMode && comparisonResults) {
      fixRedirectInconsistencies(
        vercelRedirects,
        docsRedirects,
        comparisonResults
      );
    }

    // Output final result
    if (hasErrors) {
      console.log(
        "\n❌ Validation found issues with the redirects. See reports for details."
      );
      process.exit(1);
    } else {
      console.log(
        "\n✅ Validation completed successfully - all redirects are valid."
      );
    }
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

/**
 * Helper function to validate destinations
 */
function validateDestinations(
  redirects: Redirect[],
  navigationPaths: any[]
): DestinationValidationResult {
  const invalidDestinations = validateRedirectDestinations(
    redirects,
    navigationPaths
  );
  const validDestinations = redirects.filter(
    (r) => !invalidDestinations.some((ir) => ir.source === r.source)
  );

  return {
    invalidDestinations,
    validDestinations,
  };
}

/**
 * Fix inconsistencies between vercel.json and docs.json
 * @param vercelRedirects Redirects from vercel.json
 * @param docsRedirects Redirects from docs.json
 * @param comparisonResults Comparison results
 */
function fixRedirectInconsistencies(
  vercelRedirects: Redirect[],
  docsRedirects: Redirect[],
  comparisonResults: {
    missingInDocs: Redirect[];
    missingInVercel: Redirect[];
    mismatchedDestinations: { vercel: Redirect; docs: Redirect }[];
  }
): void {
  console.log("\n📝 Fix Mode: Generating suggestions to fix inconsistencies\n");

  // Create fixes folder if it doesn't exist
  const fixesDir = path.join(process.cwd(), "fixes");
  if (!fs.existsSync(fixesDir)) {
    fs.mkdirSync(fixesDir);
  }

  // Create suggested docs.json updates
  if (comparisonResults.missingInDocs.length > 0) {
    const suggestedDocsRedirects = [...docsRedirects];

    // Add missing redirects from vercel.json
    for (const redirect of comparisonResults.missingInDocs) {
      suggestedDocsRedirects.push(redirect);
    }

    // Fix mismatched destinations
    for (const mismatch of comparisonResults.mismatchedDestinations) {
      const index = suggestedDocsRedirects.findIndex(
        (r) => r.source === mismatch.docs.source
      );
      if (index >= 0) {
        suggestedDocsRedirects[index] = mismatch.vercel;
      }
    }

    // Sort redirects by source for readability
    suggestedDocsRedirects.sort((a, b) => a.source.localeCompare(b.source));

    // Save the suggested redirects
    const suggestedDocsRedirectsPath = path.join(
      fixesDir,
      "suggested-docs-redirects.json"
    );
    fs.writeFileSync(
      suggestedDocsRedirectsPath,
      JSON.stringify(suggestedDocsRedirects, null, 2),
      "utf-8"
    );
    console.log(
      `Created suggested docs.json redirects at ${suggestedDocsRedirectsPath}`
    );
  }

  // Create suggested vercel.json updates
  if (comparisonResults.missingInVercel.length > 0) {
    const suggestedVercelRedirects = [...vercelRedirects];

    // Add missing redirects from docs.json
    for (const redirect of comparisonResults.missingInVercel) {
      suggestedVercelRedirects.push(redirect);
    }

    // Fix mismatched destinations (using docs.json as source of truth)
    for (const mismatch of comparisonResults.mismatchedDestinations) {
      const index = suggestedVercelRedirects.findIndex(
        (r) => r.source === mismatch.vercel.source
      );
      if (index >= 0) {
        suggestedVercelRedirects[index] = mismatch.docs;
      }
    }

    // Sort redirects by source for readability
    suggestedVercelRedirects.sort((a, b) => a.source.localeCompare(b.source));

    // Save the suggested redirects
    const suggestedVercelRedirectsPath = path.join(
      fixesDir,
      "suggested-vercel-redirects.json"
    );
    fs.writeFileSync(
      suggestedVercelRedirectsPath,
      JSON.stringify(suggestedVercelRedirects, null, 2),
      "utf-8"
    );
    console.log(
      `Created suggested vercel.json redirects at ${suggestedVercelRedirectsPath}`
    );
  }

  // Generate instructions for applying the fixes
  const instructionsPath = path.join(fixesDir, "fix-instructions.md");
  let instructions = "# Redirect Fix Instructions\n\n";

  instructions += "## Summary of Issues\n\n";
  instructions += `- Redirects missing in docs.json: ${comparisonResults.missingInDocs.length}\n`;
  instructions += `- Redirects missing in vercel.json: ${comparisonResults.missingInVercel.length}\n`;
  instructions += `- Redirects with mismatched destinations: ${comparisonResults.mismatchedDestinations.length}\n\n`;

  instructions += "## How to Apply Fixes\n\n";

  instructions += "### Option 1: Update docs.json\n\n";
  instructions +=
    "Replace the `redirects` array in `docs.json` with the contents of `suggested-docs-redirects.json`.\n\n";

  instructions += "### Option 2: Update vercel.json\n\n";
  instructions +=
    "Replace the `redirects` array in `vercel.json` with the contents of `suggested-vercel-redirects.json`.\n\n";

  instructions += "## Decision Required\n\n";
  instructions +=
    "You need to decide which file to use as the source of truth:\n\n";
  instructions +=
    "- If `docs.json` should be the source of truth, apply Option 2\n";
  instructions +=
    "- If `vercel.json` should be the source of truth, apply Option 1\n\n";

  instructions +=
    "Note: The recommended approach is to use **docs.json as the source of truth**, as it defines the site structure.";

  fs.writeFileSync(instructionsPath, instructions, "utf-8");
  console.log(`Created fix instructions at ${instructionsPath}`);
}

// Run the main function
main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
