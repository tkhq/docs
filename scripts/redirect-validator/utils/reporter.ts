/**
 * Reporter utilities for generating validation reports
 */

import fs from "fs";
import path from "path";
import { ValidationResult, ValidationReport, RedirectComparisonResult, DestinationValidationResult } from "../types";

/**
 * Formats a validation result for display
 * @param result The validation result to format
 * @returns A formatted string representation of the result
 */
export function formatValidationResult(result: ValidationResult): string {
  const statusEmoji = result.status === "valid" 
    ? "✅" 
    : result.status === "warning" ? "⚠️" : "❌";
  
  let output = `${statusEmoji} ${result.sourcePath} → ${result.chain.finalDestination}\n`;
  
  // Add chain steps if more than 2 (source and destination)
  if (result.chain.steps.length > 2) {
    output += "   Chain: ";
    output += result.chain.steps
      .map((step, index) => {
        const prefix = index === 0 
          ? "" 
          : " → ";
        return `${prefix}${step.path}`;
      })
      .join("");
    output += "\n";
  }
  
  // Add issues if any
  if (result.issues && result.issues.length > 0) {
    output += "   Issues:\n";
    for (const issue of result.issues) {
      output += `   - ${issue}\n`;
    }
  }
  
  return output;
}

/**
 * Generates a validation report from results
 * @param results Array of validation results
 * @returns A complete validation report
 */
export function generateValidationReport(
  results: ValidationResult[]
): ValidationReport {
  const validRedirects = results.filter(r => r.status === "valid").length;
  const invalidRedirects = results.filter(r => r.status === "invalid").length;
  const warningRedirects = results.filter(r => r.status === "warning").length;
  
  return {
    totalRedirects: results.length,
    validRedirects,
    invalidRedirects,
    warningRedirects,
    results
  };
}

/**
 * Formats a complete validation report for display
 * @param report The validation report to format
 * @returns A formatted string representation of the report
 */
export function formatValidationReport(report: ValidationReport): string {
  let output = "# Redirect Validation Report\n\n";
  
  // Summary section
  output += "## Summary\n\n";
  output += `Total redirects: ${report.totalRedirects}\n`;
  output += `Valid redirects: ${report.validRedirects}\n`;
  output += `Warning redirects: ${report.warningRedirects}\n`;
  output += `Invalid redirects: ${report.invalidRedirects}\n\n`;
  
  // Results by status
  if (report.invalidRedirects > 0) {
    output += "## Invalid Redirects\n\n";
    for (const result of report.results.filter(r => r.status === "invalid")) {
      output += formatValidationResult(result) + "\n";
    }
  }
  
  if (report.warningRedirects > 0) {
    output += "## Redirects with Warnings\n\n";
    for (const result of report.results.filter(r => r.status === "warning")) {
      output += formatValidationResult(result) + "\n";
    }
  }
  
  if (report.validRedirects > 0) {
    output += "## Valid Redirects\n\n";
    for (const result of report.results.filter(r => r.status === "valid")) {
      output += formatValidationResult(result) + "\n";
    }
  }
  
  return output;
}

/**
 * Saves a validation report to a file
 * @param report The validation report to save
 * @param filePath The file path to save to
 */
export function saveValidationReport(
  report: ValidationReport,
  filePath: string = "redirect-validation-report.md"
): void {
  const formattedReport = formatValidationReport(report);
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
  
  fs.writeFileSync(absolutePath, formattedReport, "utf-8");
  console.log(`Report saved to ${absolutePath}`);
}

/**
 * Prints a summary of validation results to the console
 * @param report The validation report to summarize
 */
export function printValidationSummary(report: ValidationReport): void {
  const totalWidth = 60;
  const fillChar = "=";
  
  console.log("\n" + fillChar.repeat(totalWidth));
  console.log(" Redirect Validation Summary ".padStart((totalWidth + " Redirect Validation Summary ".length) / 2, fillChar).padEnd(totalWidth, fillChar));
  console.log(fillChar.repeat(totalWidth));
  
  // Status counts and percentages
  const validPercentage = (report.validRedirects / report.totalRedirects * 100).toFixed(1);
  const warningPercentage = (report.warningRedirects / report.totalRedirects * 100).toFixed(1);
  const invalidPercentage = (report.invalidRedirects / report.totalRedirects * 100).toFixed(1);
  
  console.log(`Total redirects: ${report.totalRedirects}`);
  console.log(`✅ Valid: ${report.validRedirects} (${validPercentage}%)`);
  console.log(`⚠️ Warnings: ${report.warningRedirects} (${warningPercentage}%)`);
  console.log(`❌ Invalid: ${report.invalidRedirects} (${invalidPercentage}%)`);
  
  // Summary of issues if any
  if (report.invalidRedirects > 0 || report.warningRedirects > 0) {
    console.log("\nIssues summary:");
    
    // Count issue types
    const issueTypeCounts: Record<string, number> = {};
    for (const result of report.results) {
      if (result.issues) {
        for (const issue of result.issues) {
          // Extract the main issue type (first few words)
          const issueType = issue.split(" ").slice(0, 3).join(" ") + "...";
          issueTypeCounts[issueType] = (issueTypeCounts[issueType] || 0) + 1;
        }
      }
    }
    
    // Display top issues
    Object.entries(issueTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([issue, count]) => {
        console.log(`- ${issue}: ${count} occurrences`);
      });
  }
  
  console.log(fillChar.repeat(totalWidth));
  
  // Actionable next steps
  if (report.invalidRedirects > 0) {
    console.log("\n❗ Action required: Please fix the invalid redirects.");
    console.log("   See the full report for details.");
  } else if (report.warningRedirects > 0) {
    console.log("\n⚠️ Consider reviewing the redirects with warnings.");
    console.log("   See the full report for details.");
  } else {
    console.log("\n✅ All redirects are valid. No action required.");
  }
}

/**
 * Generates a report comparing vercel.json and docs.json redirects
 * @param results The comparison results
 * @returns Formatted report string
 */
export function formatRedirectComparisonReport(results: RedirectComparisonResult): string {
  let output = "# Redirect Comparison Report\n\n";
  
  // Summary section
  output += "## Summary\n\n";
  output += `Redirects missing in docs.json: ${results.missingInDocs.length}\n`;
  output += `Redirects missing in vercel.json: ${results.missingInVercel.length}\n`;
  output += `Redirects with mismatched destinations: ${results.mismatchedDestinations.length}\n\n`;
  
  // Missing in docs section
  if (results.missingInDocs.length > 0) {
    output += "## Redirects in vercel.json but missing in docs.json\n\n";
    for (const redirect of results.missingInDocs) {
      output += `- \`${redirect.source}\` → \`${redirect.destination}\`\n`;
    }
    output += "\n";
  }
  
  // Missing in vercel section
  if (results.missingInVercel.length > 0) {
    output += "## Redirects in docs.json but missing in vercel.json\n\n";
    for (const redirect of results.missingInVercel) {
      output += `- \`${redirect.source}\` → \`${redirect.destination}\`\n`;
    }
    output += "\n";
  }
  
  // Mismatched destinations section
  if (results.mismatchedDestinations.length > 0) {
    output += "## Redirects with mismatched destinations\n\n";
    for (const mismatch of results.mismatchedDestinations) {
      output += `- \`${mismatch.vercel.source}\`:\n`;
      output += `  - vercel.json: \`${mismatch.vercel.destination}\`\n`;
      output += `  - docs.json: \`${mismatch.docs.destination}\`\n`;
    }
    output += "\n";
  }
  
  return output;
}

/**
 * Generates a report validating redirect destinations against navigation paths
 * @param results The destination validation results
 * @returns Formatted report string
 */
export function formatDestinationValidationReport(results: DestinationValidationResult): string {
  let output = "# Redirect Destination Validation Report\n\n";
  
  // Summary section
  output += "## Summary\n\n";
  output += `Total redirects: ${results.validDestinations.length + results.invalidDestinations.length}\n`;
  output += `Valid destinations: ${results.validDestinations.length}\n`;
  output += `Invalid destinations: ${results.invalidDestinations.length}\n\n`;
  
  // Invalid destinations section
  if (results.invalidDestinations.length > 0) {
    output += "## Redirects with invalid destinations\n\n";
    for (const redirect of results.invalidDestinations) {
      output += `- \`${redirect.source}\` → \`${redirect.destination}\`\n`;
    }
    output += "\n";
  }
  
  return output;
}

/**
 * Saves a comparison report to a file
 * @param results The comparison results
 * @param filePath The file path to save to
 */
export function saveComparisonReport(
  results: RedirectComparisonResult,
  filePath: string = "redirect-comparison-report.md"
): void {
  const formattedReport = formatRedirectComparisonReport(results);
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
  
  fs.writeFileSync(absolutePath, formattedReport, "utf-8");
  console.log(`Comparison report saved to ${absolutePath}`);
}

/**
 * Saves a destination validation report to a file
 * @param results The destination validation results
 * @param filePath The file path to save to
 */
export function saveDestinationValidationReport(
  results: DestinationValidationResult,
  filePath: string = "redirect-destination-validation-report.md"
): void {
  const formattedReport = formatDestinationValidationReport(results);
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
  
  fs.writeFileSync(absolutePath, formattedReport, "utf-8");
  console.log(`Destination validation report saved to ${absolutePath}`);
} 