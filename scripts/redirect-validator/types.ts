/**
 * Type definitions for the redirect validation utility
 */

/**
 * Represents a redirect configuration in vercel.json
 */
export interface Redirect {
  source: string;
  destination: string;
  permanent: boolean;
}

/**
 * Maps source paths to their destination details
 */
export interface RedirectMap {
  [sourcePath: string]: {
    destination: string;
    permanent: boolean;
  };
}

/**
 * Represents a step in a redirect chain
 */
export interface RedirectStep {
  path: string;
  type: "source" | "intermediate" | "destination";
}

/**
 * Represents a complete chain of redirects from source to final destination
 */
export interface RedirectChain {
  sourcePath: string;
  steps: RedirectStep[];
  finalDestination: string;
}

/**
 * Status of a validation operation for a redirect
 */
export type ValidationStatus = "valid" | "invalid" | "warning";

/**
 * Results of validating a redirect
 */
export interface ValidationResult {
  sourcePath: string;
  status: ValidationStatus;
  chain: RedirectChain;
  issues?: string[];
}

/**
 * Complete validation report
 */
export interface ValidationReport {
  totalRedirects: number;
  validRedirects: number;
  invalidRedirects: number;
  warningRedirects: number;
  results: ValidationResult[];
}

/**
 * Configuration for the validation process
 */
export interface ValidationConfig {
  baseUrl?: string;
  checkDestinations?: boolean;
}

/**
 * Represents a navigation path in the docs.json structure
 */
export interface NavigationPath {
  path: string;
  type: 'page' | 'group';
}

/**
 * Partial representation of docs.json structure
 */
export interface DocsConfig {
  navigation: {
    tabs: Array<{
      tab: string;
      pages?: any[];
      groups?: Array<{
        group: string;
        pages: any[];
      }>;
    }>;
  };
  redirects?: Redirect[];
}

/**
 * Results of comparing redirects between vercel.json and docs.json
 */
export interface RedirectComparisonResult {
  missingInDocs: Redirect[];
  missingInVercel: Redirect[];
  mismatchedDestinations: { vercel: Redirect; docs: Redirect }[];
}

/**
 * Results of validating redirects against navigation paths
 */
export interface DestinationValidationResult {
  invalidDestinations: Redirect[];
  validDestinations: Redirect[];
}
