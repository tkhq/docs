#!/usr/bin/env python3
"""
Step 3: Add redirect entries to docs.json for the 187 moved nav pages.

This script reads docs.json, finds the existing "redirects" array, and
APPENDS 187 new redirect entries corresponding to the Phase 3 URL mapping.
Existing redirects are left untouched.

Each new redirect entry has the form:
    {
      "source": "/OLD_PATH",
      "destination": "/NEW_PATH",
      "permanent": true
    }

Usage:
    python step3-add-nav-redirects.py
"""

import json
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Phase 3 mapping: old path -> new path (only rows where Changed = Yes)
# Same 187 entries used by step2-update-docsjson.py.
# Paths here are bare (no leading slash, no .mdx).  The script will add
# a leading "/" when building redirect source/destination values.
# ---------------------------------------------------------------------------
PATH_MAPPING: dict[str, str] = {
    # === Solutions (96 changed) ===
    "embedded-wallets/overview": "solutions/embedded-wallets/overview",
    "embedded-wallets/code-examples/embedded-consumer-wallet": "solutions/embedded-wallets/embedded-consumer-wallet",
    "products/embedded-business-wallets/overview": "solutions/embedded-wallets/embedded-business-wallets",
    "embedded-wallets/embedded-waas": "solutions/embedded-wallets/embedded-waas",
    "getting-started/embedded-wallet-quickstart": "solutions/embedded-wallets/quickstart",
    "embedded-wallets/integration-guide/overview": "solutions/embedded-wallets/integration-guide/overview",
    # React (13)
    "sdks/react/index": "solutions/embedded-wallets/integration-guide/react/index",
    "sdks/react/getting-started": "solutions/embedded-wallets/integration-guide/react/getting-started",
    "sdks/react/auth": "solutions/embedded-wallets/integration-guide/react/auth",
    "sdks/react/using-embedded-wallets": "solutions/embedded-wallets/integration-guide/react/using-embedded-wallets",
    "sdks/react/using-external-wallets/overview": "solutions/embedded-wallets/integration-guide/react/using-external-wallets/overview",
    "sdks/react/using-external-wallets/authentication": "solutions/embedded-wallets/integration-guide/react/using-external-wallets/authentication",
    "sdks/react/using-external-wallets/connecting": "solutions/embedded-wallets/integration-guide/react/using-external-wallets/connecting",
    "sdks/react/signing": "solutions/embedded-wallets/integration-guide/react/signing",
    "sdks/react/ui-customization": "solutions/embedded-wallets/integration-guide/react/ui-customization",
    "sdks/react/sub-organization-customization": "solutions/embedded-wallets/integration-guide/react/sub-organization-customization",
    "sdks/react/advanced-api-requests": "solutions/embedded-wallets/integration-guide/react/advanced-api-requests",
    "sdks/react/advanced-backend-authentication": "solutions/embedded-wallets/integration-guide/react/advanced-backend-authentication",
    "sdks/react/migrating-sdk-react": "solutions/embedded-wallets/integration-guide/react/migrating-sdk-react",
    "sdks/react/troubleshooting": "solutions/embedded-wallets/integration-guide/react/troubleshooting",
    "sdks/react/legacy": "solutions/embedded-wallets/integration-guide/react/legacy",
    # React Native (10)
    "sdks/react-native/overview": "solutions/embedded-wallets/integration-guide/react-native/overview",
    "sdks/react-native/getting-started": "solutions/embedded-wallets/integration-guide/react-native/getting-started",
    "sdks/react-native/authentication/overview": "solutions/embedded-wallets/integration-guide/react-native/authentication/overview",
    "sdks/react-native/authentication/email-sms": "solutions/embedded-wallets/integration-guide/react-native/authentication/email-sms",
    "sdks/react-native/authentication/passkey": "solutions/embedded-wallets/integration-guide/react-native/authentication/passkey",
    "sdks/react-native/authentication/social-logins": "solutions/embedded-wallets/integration-guide/react-native/authentication/social-logins",
    "sdks/react-native/sub-organization-customization": "solutions/embedded-wallets/integration-guide/react-native/sub-organization-customization",
    "sdks/react-native/using-embedded-wallets": "solutions/embedded-wallets/integration-guide/react-native/using-embedded-wallets",
    "sdks/react-native/signing": "solutions/embedded-wallets/integration-guide/react-native/signing",
    "sdks/react-native/advanced-api-requests": "solutions/embedded-wallets/integration-guide/react-native/advanced-api-requests",
    # TypeScript (6)
    "sdks/typescript-frontend/index": "solutions/embedded-wallets/integration-guide/typescript/index",
    "sdks/typescript-frontend/getting-started": "solutions/embedded-wallets/integration-guide/typescript/getting-started",
    "sdks/typescript-frontend/auth": "solutions/embedded-wallets/integration-guide/typescript/auth",
    "sdks/typescript-frontend/advanced-backend-authentication": "solutions/embedded-wallets/integration-guide/typescript/advanced-backend-authentication",
    "sdks/typescript-frontend/advanced-api-requests": "solutions/embedded-wallets/integration-guide/typescript/advanced-api-requests",
    "sdks/typescript-frontend/legacy": "solutions/embedded-wallets/integration-guide/typescript/legacy",
    # Flutter (10)
    "sdks/flutter/index": "solutions/embedded-wallets/integration-guide/flutter/index",
    "sdks/flutter/getting-started": "solutions/embedded-wallets/integration-guide/flutter/getting-started",
    "sdks/flutter/authentication/overview": "solutions/embedded-wallets/integration-guide/flutter/authentication/overview",
    "sdks/flutter/authentication/email-sms": "solutions/embedded-wallets/integration-guide/flutter/authentication/email-sms",
    "sdks/flutter/authentication/passkey": "solutions/embedded-wallets/integration-guide/flutter/authentication/passkey",
    "sdks/flutter/authentication/social-logins": "solutions/embedded-wallets/integration-guide/flutter/authentication/social-logins",
    "sdks/flutter/sub-organization-customization": "solutions/embedded-wallets/integration-guide/flutter/sub-organization-customization",
    "sdks/flutter/using-embedded-wallets": "solutions/embedded-wallets/integration-guide/flutter/using-embedded-wallets",
    "sdks/flutter/signing": "solutions/embedded-wallets/integration-guide/flutter/signing",
    "sdks/flutter/advanced-api-requests": "solutions/embedded-wallets/integration-guide/flutter/advanced-api-requests",
    # Swift (11)
    "sdks/swift/overview": "solutions/embedded-wallets/integration-guide/swift/overview",
    "sdks/swift/getting-started": "solutions/embedded-wallets/integration-guide/swift/getting-started",
    "sdks/swift/authentication/overview": "solutions/embedded-wallets/integration-guide/swift/authentication/overview",
    "sdks/swift/authentication/email-sms": "solutions/embedded-wallets/integration-guide/swift/authentication/email-sms",
    "sdks/swift/authentication/passkey": "solutions/embedded-wallets/integration-guide/swift/authentication/passkey",
    "sdks/swift/authentication/social-logins": "solutions/embedded-wallets/integration-guide/swift/authentication/social-logins",
    "sdks/swift/signing": "solutions/embedded-wallets/integration-guide/swift/signing",
    "sdks/swift/sub-organization-customization": "solutions/embedded-wallets/integration-guide/swift/sub-organization-customization",
    "sdks/swift/advanced-api-requests": "solutions/embedded-wallets/integration-guide/swift/advanced-api-requests",
    "sdks/swift/using-embedded-wallets": "solutions/embedded-wallets/integration-guide/swift/using-embedded-wallets",
    "sdks/swift/advanced-backend-authentication": "solutions/embedded-wallets/integration-guide/swift/advanced-backend-authentication",
    # Kotlin (11)
    "sdks/kotlin/overview": "solutions/embedded-wallets/integration-guide/kotlin/overview",
    "sdks/kotlin/getting-started": "solutions/embedded-wallets/integration-guide/kotlin/getting-started",
    "sdks/kotlin/authentication/overview": "solutions/embedded-wallets/integration-guide/kotlin/authentication/overview",
    "sdks/kotlin/authentication/email-sms": "solutions/embedded-wallets/integration-guide/kotlin/authentication/email-sms",
    "sdks/kotlin/authentication/passkey": "solutions/embedded-wallets/integration-guide/kotlin/authentication/passkey",
    "sdks/kotlin/authentication/social-logins": "solutions/embedded-wallets/integration-guide/kotlin/authentication/social-logins",
    "sdks/kotlin/authentication/rp-id-setup": "solutions/embedded-wallets/integration-guide/kotlin/authentication/rp-id-setup",
    "sdks/kotlin/sub-organization-customization": "solutions/embedded-wallets/integration-guide/kotlin/sub-organization-customization",
    "sdks/kotlin/using-embedded-wallets": "solutions/embedded-wallets/integration-guide/kotlin/using-embedded-wallets",
    "sdks/kotlin/signing": "solutions/embedded-wallets/integration-guide/kotlin/signing",
    "sdks/kotlin/advanced-api-requests": "solutions/embedded-wallets/integration-guide/kotlin/advanced-api-requests",
    # Company Wallets (10)
    "company-wallets/overview": "solutions/company-wallets/overview",
    "company-wallets/code-examples/payment-orchestration": "solutions/company-wallets/payment-orchestration",
    "company-wallets/code-examples/smart-contract-management": "solutions/company-wallets/smart-contract-management",
    "company-wallets/use-cases/agentic-wallets": "solutions/company-wallets/agentic-wallets",
    "getting-started/company-wallets-quickstart": "solutions/company-wallets/quickstart",
    "company-wallets/integration-guide/overview": "solutions/company-wallets/integration-guide/overview",
    "sdks/javascript-server": "solutions/company-wallets/integration-guide/javascript-server",
    "sdks/golang": "solutions/company-wallets/integration-guide/golang",
    "sdks/ruby": "solutions/company-wallets/integration-guide/ruby",
    "sdks/rust": "solutions/company-wallets/integration-guide/rust",
    "sdks/python": "solutions/company-wallets/integration-guide/python",
    # Key Management (3)
    "products/key-management/overview": "solutions/key-management/overview",
    "products/key-management/examples/encryption-key-storage": "solutions/key-management/encryption-key-storage",
    "products/key-management/examples/enterprise-disaster-recovery": "solutions/key-management/enterprise-disaster-recovery",
    # Cookbooks (14)
    "cookbook/landing": "solutions/cookbooks/landing",
    "cookbook/morpho": "solutions/cookbooks/morpho",
    "cookbook/aave": "solutions/cookbooks/aave",
    "cookbook/breeze": "solutions/cookbooks/breeze",
    "cookbook/yieldxyz": "solutions/cookbooks/yieldxyz",
    "cookbook/jupiter": "solutions/cookbooks/jupiter",
    "cookbook/lifi": "solutions/cookbooks/lifi",
    "cookbook/0x": "solutions/cookbooks/0x",
    "cookbook/relay": "solutions/cookbooks/relay",
    "cookbook/polymarket-builders": "solutions/cookbooks/polymarket-builders",
    "cookbook/base-builder-codes": "solutions/cookbooks/base-builder-codes",
    "cookbook/brale": "solutions/cookbooks/brale",
    "reference/tron-gasless-transactions": "solutions/cookbooks/tron-gasless-transactions",

    # === Get started (7 changed) ===
    "home": "get-started/about-turnkey",
    "getting-started/quickstart": "get-started/quickstart",
    "developer-reference/using-llms": "get-started/using-llms",
    "ai/skills": "get-started/ai-skills",
    "getting-started/examples": "get-started/examples",
    "production-checklist/production-checklist": "get-started/production-checklist",
    "production-checklist/backup-recovery": "get-started/backup-recovery",

    # === Features (71 changed) ===
    # Organizations (2)
    "concepts/organizations": "features/organizations",
    "concepts/sub-organizations": "features/sub-organizations",
    # Users (4)
    "concepts/users/introduction": "features/users/introduction",
    "concepts/users/credentials": "features/users/credentials",
    "concepts/users/root-quorum": "features/users/root-quorum",
    "concepts/users/best-practices": "features/users/best-practices",
    # Authentication (14)
    "authentication/overview": "features/authentication/overview",
    "authentication/email": "features/authentication/email",
    "authentication/social-logins": "features/authentication/social-logins",
    "authentication/sms": "features/authentication/sms",
    "authentication/passkeys/introduction": "features/authentication/passkeys/introduction",
    "authentication/passkeys/integration": "features/authentication/passkeys/integration",
    "authentication/passkeys/options": "features/authentication/passkeys/options",
    "authentication/passkeys/native": "features/authentication/passkeys/native",
    "authentication/passkeys/discoverable-vs-non-discoverable": "features/authentication/passkeys/discoverable-vs-non-discoverable",
    "authentication/backend-setup": "features/authentication/backend-setup",
    "authentication/bring-your-own-auth": "features/authentication/bring-your-own-auth",
    "reference/auth-proxy": "features/authentication/auth-proxy",
    "authentication/sessions": "features/authentication/sessions",
    "authentication/proxying-signed-requests": "features/authentication/proxying-signed-requests",
    # Wallet and key management (7)
    "concepts/wallets": "features/wallets",
    "products/company-wallets/features/import-wallets": "features/wallets/import-wallets",
    "products/company-wallets/features/export-wallets": "features/wallets/export-wallets",
    "wallets/pregenerated-wallets": "features/wallets/pregenerated-wallets",
    "wallets/claim-links": "features/wallets/claim-links",
    "embedded-wallets/send-crypto-via-url": "features/wallets/send-crypto-via-url",
    "reference/aa-wallets": "features/wallets/aa-wallets",
    # Chain support / Networks (19)
    "networks/overview": "features/networks/overview",
    "networks/ethereum": "features/networks/ethereum",
    "networks/solana": "features/networks/solana",
    "networks/solana-transaction-construction": "features/networks/solana-transaction-construction",
    "networks/solana-rent-refunds": "features/networks/solana-rent-refunds",
    "networks/bitcoin": "features/networks/bitcoin",
    "networks/spark": "features/networks/spark",
    "networks/hyperliquid": "features/networks/hyperliquid",
    "networks/cosmos": "features/networks/cosmos",
    "networks/tron": "features/networks/tron",
    "networks/sui": "features/networks/sui",
    "networks/sei": "features/networks/sei",
    "networks/stacks": "features/networks/stacks",
    "networks/aptos": "features/networks/aptos",
    "networks/tempo": "features/networks/tempo",
    "networks/movement": "features/networks/movement",
    "networks/iota": "features/networks/iota",
    "networks/doge": "features/networks/doge",
    "networks/others": "features/networks/others",
    # Policies (13)
    "concepts/policies/overview": "features/policies/overview",
    "concepts/policies/quickstart": "features/policies/quickstart",
    "concepts/policies/language": "features/policies/language",
    "concepts/policies/smart-contract-interfaces": "features/policies/smart-contract-interfaces",
    "concepts/policies/examples/access-control": "features/policies/examples/access-control",
    "company-wallets/co-signing-transactions": "features/policies/examples/co-signing-transactions",
    "concepts/policies/examples/signing-control": "features/policies/examples/signing-control",
    "concepts/policies/examples/ethereum": "features/policies/examples/ethereum",
    "concepts/policies/examples/solana": "features/policies/examples/solana",
    "concepts/policies/examples/tron": "features/policies/examples/tron",
    "concepts/policies/examples/bitcoin": "features/policies/examples/bitcoin",
    "concepts/policies/examples/tempo": "features/policies/examples/tempo",
    # Delegated access (4)
    "concepts/policies/delegated-access-overview": "features/policies/delegated-access/overview",
    "concepts/policies/delegated-access-frontend": "features/policies/delegated-access/frontend",
    "concepts/policies/delegated-access-backend": "features/policies/delegated-access/backend",
    "products/embedded-wallets/features/agentic-wallets": "features/policies/delegated-access/agentic-wallets",
    # Transaction management (5)
    "concepts/transaction-management": "features/transaction-management",
    "concepts/broadcasting": "features/transaction-management/broadcasting",
    "embedded-wallets/code-examples/sending-sponsored-transactions": "features/transaction-management/sending-sponsored-transactions",
    "embedded-wallets/code-examples/sending-sponsored-solana-transactions": "features/transaction-management/sending-sponsored-solana-transactions",
    "concepts/balances": "features/transaction-management/balances",
    "wallets/fiat-on-ramp": "features/transaction-management/fiat-on-ramp",
    # Verifiable Cloud (3)
    "products/verifiable-cloud/overview": "features/verifiable-cloud/overview",
    "products/verifiable-cloud/onboarding": "features/verifiable-cloud/onboarding",
    "getting-started/verifiable-cloud-quickstart": "features/verifiable-cloud/quickstart",

    # === Reference (4 changed) ===
    "concepts/resource-limits": "reference/resource-limits",
    "developer-reference/webhooks": "reference/webhooks",
    "getting-started/migration-guide": "reference/migration-guide",
    "faq": "reference/faq",

    # === API reference (3 changed) ===
    "developer-reference/api-overview/intro": "api-reference/overview/intro",
    "developer-reference/api-overview/stamps": "api-reference/overview/stamps",
    "developer-reference/api-overview/errors": "api-reference/overview/errors",

    # === SDK reference (4 changed) ===
    "category/web3-libraries": "sdks/web3/overview",
    "wallets/wagmi": "sdks/web3/wagmi",
    "category/advanced": "sdks/advanced/overview",
    "embedded-wallets/code-examples/client-side-signing": "sdks/advanced/client-side-signing",

    # === Security (2 changed) ===
    "category/security": "security/overview",
    "products/company-wallets/features/security/remote-attestation": "security/remote-attestation",
}

EXPECTED_COUNT = 187

DOCS_JSON_PATH = Path(__file__).resolve().parent / "docs.json"


def main() -> None:
    # --- Verify mapping count ---
    actual_count = len(PATH_MAPPING)
    if actual_count != EXPECTED_COUNT:
        print(
            f"ERROR: Expected {EXPECTED_COUNT} entries in PATH_MAPPING, "
            f"but found {actual_count}.",
            file=sys.stderr,
        )
        sys.exit(1)
    print(f"Mapping contains {actual_count} entries (verified).")

    # --- Read docs.json ---
    if not DOCS_JSON_PATH.exists():
        print(f"ERROR: {DOCS_JSON_PATH} not found.", file=sys.stderr)
        sys.exit(1)

    with open(DOCS_JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    # --- Validate that "redirects" key exists and is a list ---
    if "redirects" not in data:
        print("ERROR: No 'redirects' key found in docs.json.", file=sys.stderr)
        sys.exit(1)

    if not isinstance(data["redirects"], list):
        print("ERROR: 'redirects' is not an array in docs.json.", file=sys.stderr)
        sys.exit(1)

    existing_redirects = data["redirects"]
    existing_count = len(existing_redirects)
    print(f"Existing redirects: {existing_count}")

    # --- Build a set of existing source paths to detect duplicates ---
    existing_sources = set()
    for r in existing_redirects:
        if isinstance(r, dict) and "source" in r:
            existing_sources.add(r["source"])

    # --- Build new redirect entries ---
    new_redirects: list[dict] = []
    skipped_duplicates: list[str] = []

    for old_path, new_path in PATH_MAPPING.items():
        source = f"/{old_path}"
        destination = f"/{new_path}"

        # Skip if this source already exists in the redirects array
        if source in existing_sources:
            skipped_duplicates.append(source)
            continue

        new_redirects.append({
            "source": source,
            "destination": destination,
            "permanent": True,
        })

    # --- Verify we are adding exactly 187 new redirects ---
    new_count = len(new_redirects)
    skipped_count = len(skipped_duplicates)

    if skipped_count > 0:
        print(f"\nWARNING: Skipped {skipped_count} duplicate source(s) already in redirects:")
        for s in sorted(skipped_duplicates):
            print(f"  - {s}")
        print()

    total_new = new_count + skipped_count
    if total_new != EXPECTED_COUNT:
        print(
            f"ERROR: Expected {EXPECTED_COUNT} redirect mappings, "
            f"but found {new_count} new + {skipped_count} duplicates = {total_new}.",
            file=sys.stderr,
        )
        sys.exit(1)

    if new_count != EXPECTED_COUNT and skipped_count == 0:
        print(
            f"ERROR: Expected to add exactly {EXPECTED_COUNT} redirects, "
            f"but built {new_count}.",
            file=sys.stderr,
        )
        sys.exit(1)

    # --- Append new redirects (do NOT modify existing ones) ---
    data["redirects"].extend(new_redirects)

    final_count = len(data["redirects"])

    # --- Write back with 2-space indent ---
    with open(DOCS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")  # trailing newline

    # --- Summary ---
    print(f"New redirects added: {new_count}")
    print(f"Total redirects before: {existing_count}")
    print(f"Total redirects after:  {final_count}")
    print(f"Net change: +{final_count - existing_count}")
    print("\nDone. docs.json updated successfully.")


if __name__ == "__main__":
    main()
