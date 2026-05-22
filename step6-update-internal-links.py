#!/usr/bin/env python3
"""
Step 6: Update internal links in .mdx files.

Scans all .mdx files recursively and replaces old internal link paths with
new paths. The mapping combines:
  - 187 nav page moves from Phase 3 (PATH_MAPPING from step2)
  - 70 orphan redirects from Phase 4 (ORPHAN_REDIRECTS from step4)

Nav page moves take precedence if the same old path appears in both.

Usage:
    python3 step6-update-internal-links.py          # dry-run (default)
    python3 step6-update-internal-links.py --write  # actually write changes
"""

import os
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Directory to scan
# ---------------------------------------------------------------------------
DOCS_ROOT = Path(__file__).resolve().parent

# ---------------------------------------------------------------------------
# Phase 3 mapping: 187 nav page moves (old path -> new path)
# Paths WITHOUT leading slashes, matching docs.json convention.
# ---------------------------------------------------------------------------
NAV_PAGE_MOVES: dict[str, str] = {
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

# ---------------------------------------------------------------------------
# Phase 4: 70 orphan redirects (source -> destination)
# Paths WITH leading slashes (redirect format).
# ---------------------------------------------------------------------------
ORPHAN_REDIRECTS_RAW: list[dict[str, str]] = [
    # ── Product Features (14) ─────────────────────────────────────────────
    {"source": "/products/company-wallets/features/dashboard", "destination": "/solutions/company-wallets/overview"},
    {"source": "/products/company-wallets/features/multi-chain-support", "destination": "/features/networks/overview"},
    {"source": "/products/company-wallets/features/off-chain-contracts", "destination": "/solutions/company-wallets/overview"},
    {"source": "/products/company-wallets/features/scoped-api-key", "destination": "/solutions/company-wallets/overview"},
    {"source": "/products/company-wallets/features/security/compliance", "destination": "/security/our-approach"},
    {"source": "/products/company-wallets/features/security/quorum-os", "destination": "/security/secure-enclaves"},
    {"source": "/products/company-wallets/features/security/secure-hardware", "destination": "/security/secure-enclaves"},
    {"source": "/products/company-wallets/policy-engine", "destination": "/features/policies/quickstart"},
    {"source": "/products/embedded-wallets/features/export-wallets", "destination": "/features/wallets/export-wallets"},
    {"source": "/products/embedded-wallets/features/fiat-on-ramp", "destination": "/features/transaction-management/fiat-on-ramp"},
    {"source": "/products/embedded-wallets/features/gas-sponsorship", "destination": "/features/transaction-management/broadcasting"},
    {"source": "/products/embedded-wallets/features/import-wallets", "destination": "/features/wallets/import-wallets"},
    {"source": "/products/embedded-wallets/features/multi-chain-support", "destination": "/features/networks/overview"},
    {"source": "/products/embedded-wallets/features/policy-engine", "destination": "/features/policies/quickstart"},
    # ── API Pages (8) ─────────────────────────────────────────────────────
    {"source": "/api-overview", "destination": "/api-reference/overview/intro"},
    {"source": "/api-reference/activities/submit-a-raw-transaction-for-broadcasting", "destination": "/api-reference/activities/overview"},
    {"source": "/api-reference/activities/submit-a-transaction-intent-for-broadcasting", "destination": "/api-reference/activities/overview"},
    {"source": "/api-reference/overview", "destination": "/api-reference/overview/intro"},
    {"source": "/api-reference/queries/get-gas-usage-and-limits", "destination": "/api-reference/queries/get-gas-usage"},
    {"source": "/api-reference/queries/get-nonces-for-an-address", "destination": "/api-reference/queries/get-nonces"},
    {"source": "/api-reference/queries/get-suborgs", "destination": "/api-reference/queries/get-sub-organizations"},
    {"source": "/api-reference/queries/get-verified-suborgs", "destination": "/api-reference/queries/get-verified-sub-organizations"},
    # ── Code Examples (16) ────────────────────────────────────────────────
    {"source": "/company-wallets/code-examples/balance-sweeper", "destination": "/solutions/company-wallets/overview"},
    {"source": "/company-wallets/code-examples/sending-sponsored-transactions", "destination": "/features/transaction-management/broadcasting"},
    {"source": "/company-wallets/code-examples/signing-transactions", "destination": "/solutions/company-wallets/overview"},
    {"source": "/embedded-wallets/code-examples/add-credential", "destination": "/solutions/embedded-wallets/integration-guide/react/index"},
    {"source": "/embedded-wallets/code-examples/authenticate-user-email", "destination": "/solutions/embedded-wallets/integration-guide/react/auth"},
    {"source": "/embedded-wallets/code-examples/authenticate-user-passkey", "destination": "/solutions/embedded-wallets/integration-guide/react/sub-organization-customization"},
    {"source": "/embedded-wallets/code-examples/create-passkey-session", "destination": "/solutions/embedded-wallets/integration-guide/react/auth"},
    {"source": "/embedded-wallets/code-examples/create-sub-org-passkey", "destination": "/solutions/embedded-wallets/integration-guide/react/sub-organization-customization"},
    {"source": "/embedded-wallets/code-examples/create-user-email", "destination": "/solutions/embedded-wallets/integration-guide/react/sub-organization-customization"},
    {"source": "/embedded-wallets/code-examples/email-recovery", "destination": "/features/authentication/email"},
    {"source": "/embedded-wallets/code-examples/export", "destination": "/solutions/embedded-wallets/integration-guide/react/using-embedded-wallets"},
    {"source": "/embedded-wallets/code-examples/fiat-on-ramp", "destination": "/features/transaction-management/fiat-on-ramp"},
    {"source": "/embedded-wallets/code-examples/import", "destination": "/solutions/embedded-wallets/integration-guide/react/using-embedded-wallets"},
    {"source": "/embedded-wallets/code-examples/signing-transactions", "destination": "/solutions/embedded-wallets/integration-guide/react/signing"},
    {"source": "/embedded-wallets/code-examples/social-linking", "destination": "/solutions/embedded-wallets/integration-guide/react/auth"},
    {"source": "/embedded-wallets/code-examples/wallet-auth", "destination": "/solutions/embedded-wallets/integration-guide/react/using-external-wallets/overview"},
    # ── Overview/Landing Pages (7) ────────────────────────────────────────
    {"source": "/category/code-examples", "destination": "/solutions/embedded-wallets/overview"},
    {"source": "/category/code-examples-1", "destination": "/solutions/company-wallets/overview"},
    {"source": "/concepts/overview", "destination": "/get-started/about-turnkey"},
    {"source": "/embedded-wallets/demos", "destination": "/solutions/embedded-wallets/quickstart"},
    {"source": "/embedded-wallets/features/overview", "destination": "/solutions/embedded-wallets/overview"},
    {"source": "/products/key-management/examples/overview", "destination": "/solutions/key-management/overview"},
    {"source": "/products/verifiable-cloud/lifecycle", "destination": "/features/verifiable-cloud/overview"},
    # ── Auth/Getting-Started/Misc (9) ─────────────────────────────────────
    {"source": "/authentication/credentials", "destination": "/features/users/credentials"},
    {"source": "/authentication/otp-migration-guide", "destination": "/features/authentication/overview"},
    {"source": "/cookbook/gelato", "destination": "/sdks/web3/gas-station"},
    {"source": "/developer-reference/api-overview/queries", "destination": "/api-reference/queries/overview"},
    {"source": "/developer-reference/api-overview/submissions", "destination": "/api-reference/activities/overview"},
    {"source": "/embedded-wallets/sub-organization-auth", "destination": "/features/authentication/email"},
    {"source": "/embedded-wallets/sub-organization-recovery", "destination": "/features/authentication/email"},
    {"source": "/getting-started", "destination": "/get-started/about-turnkey"},
    {"source": "/getting-started/launch-checklist", "destination": "/get-started/production-checklist"},
    # ── Production Checklists (2) ─────────────────────────────────────────
    {"source": "/production-checklist/company-wallet", "destination": "/solutions/company-wallets/integration-guide/overview"},
    {"source": "/production-checklist/embedded-wallet", "destination": "/solutions/embedded-wallets/integration-guide/overview"},
    # ── SDK Pages (11) ────────────────────────────────────────────────────
    {"source": "/reference/embedded-wallet-kit", "destination": "/solutions/embedded-wallets/integration-guide/react/getting-started"},
    {"source": "/reference/solana-gasless-transactions", "destination": "/features/transaction-management"},
    {"source": "/sdks/cli", "destination": "/sdks/introduction"},
    {"source": "/sdks/flutter/landing", "destination": "/solutions/embedded-wallets/integration-guide/flutter/getting-started"},
    {"source": "/sdks/kotlin", "destination": "/solutions/embedded-wallets/integration-guide/kotlin/overview"},
    {"source": "/sdks/kotlin/landing", "destination": "/solutions/embedded-wallets/integration-guide/kotlin/getting-started"},
    {"source": "/sdks/react-native", "destination": "/solutions/embedded-wallets/integration-guide/react-native/getting-started"},
    {"source": "/sdks/react/landing", "destination": "/solutions/embedded-wallets/integration-guide/react/getting-started"},
    {"source": "/sdks/swift", "destination": "/solutions/embedded-wallets/integration-guide/swift/overview"},
    {"source": "/sdks/swift/landing", "destination": "/solutions/embedded-wallets/integration-guide/swift/getting-started"},
    {"source": "/sdks/typescript-frontend/landing", "destination": "/solutions/embedded-wallets/integration-guide/typescript/getting-started"},
    # ── Wallet Pages (2) ──────────────────────────────────────────────────
    {"source": "/wallets/export-wallets", "destination": "/features/wallets/export-wallets"},
    {"source": "/wallets/import-wallets", "destination": "/features/wallets/import-wallets"},
    # ── Additional (1) ────────────────────────────────────────────────────
    {"source": "/home", "destination": "/welcome"},
]


# ---------------------------------------------------------------------------
# Image / asset path prefixes to skip
# ---------------------------------------------------------------------------
SKIP_PREFIXES = (
    "/images/",
    "/image/",
    "/img/",
    "/logo/",
    "/logos/",
    "/assets/",
    "/static/",
    "/favicon",
    "/api/",          # skip raw API endpoint URLs
)


def build_combined_mapping() -> dict[str, str]:
    """
    Build a single mapping of /old-path -> /new-path (with leading slashes).

    Nav page moves (187) take precedence over orphan redirects (70).
    """
    combined: dict[str, str] = {}

    # 1. Add orphan redirects first (lower precedence).
    #    They already have leading slashes.
    for entry in ORPHAN_REDIRECTS_RAW:
        old = entry["source"]   # e.g. "/products/company-wallets/features/dashboard"
        new = entry["destination"]  # e.g. "/solutions/company-wallets/overview"
        combined[old] = new

    # 2. Add nav page moves (higher precedence, overwrites orphan entries).
    #    These do NOT have leading slashes, so we add them.
    for old_no_slash, new_no_slash in NAV_PAGE_MOVES.items():
        old = "/" + old_no_slash
        new = "/" + new_no_slash
        combined[old] = new

    return combined


def build_regex(mapping: dict[str, str]) -> re.Pattern:
    """
    Build a compiled regex that matches any old path in the mapping
    within markdown links or JSX href attributes.

    The regex matches these contexts:
      - Markdown:  ](/old-path)  ](/old-path#anchor)  ](/old-path "title")
      - JSX:       href="/old-path"  href="/old-path#anchor"

    It uses a negative lookbehind to avoid matching inside longer paths.
    For example, /networks/overview should NOT match the "/networks/overview"
    portion of /features/networks/overview.

    Strategy:
      - Sort paths longest-first so longer paths match before shorter ones.
      - Use a lookbehind for ( or " (the characters that precede paths in
        markdown links and JSX attributes).
      - Use a lookahead to ensure the path ends at a boundary: ) # " space
        or end-of-string.
      - Require that the character before the / is ( or " — this prevents
        partial matches like /features/networks/overview matching as
        /networks/overview because the char before /networks would be "s"
        not ( or ".
    """
    # Sort longest first to prevent shorter paths from matching first
    sorted_paths = sorted(mapping.keys(), key=len, reverse=True)

    # Escape each path for regex
    escaped_paths = [re.escape(p) for p in sorted_paths]

    # Join with alternation
    alternation = "|".join(escaped_paths)

    # The pattern:
    #   (?<=[\("])  — preceded by ( or "
    #   (one of the old paths)
    #   (?=[)#" \n]|$)  — followed by ) # " space newline or end
    pattern = rf'(?<=[\("])({alternation})(?=[)#" \n]|$)'

    return re.compile(pattern)


def should_skip_line(line: str) -> bool:
    """Return True if this line should not be modified."""
    stripped = line.lstrip()
    # Skip import statements (snippet imports)
    if stripped.startswith("import "):
        return True
    return False


def process_file(
    filepath: Path,
    regex: re.Pattern,
    mapping: dict[str, str],
    dry_run: bool,
) -> int:
    """
    Process a single .mdx file. Returns the number of replacements made.
    """
    try:
        content = filepath.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError) as e:
        print(f"  WARNING: Could not read {filepath}: {e}")
        return 0

    lines = content.split("\n")
    total_replacements = 0
    new_lines = []

    for line in lines:
        if should_skip_line(line):
            new_lines.append(line)
            continue

        def replace_match(m: re.Match) -> str:
            old_path = m.group(1)
            new_path = mapping.get(old_path)
            if new_path is None:
                return m.group(0)

            # Extra safety: check that the old_path is not an image/asset path
            for prefix in SKIP_PREFIXES:
                if old_path.startswith(prefix):
                    return m.group(0)

            return new_path

        new_line, count = regex.subn(replace_match, line)
        total_replacements += count
        new_lines.append(new_line)

    if total_replacements > 0 and not dry_run:
        filepath.write_text("\n".join(new_lines), encoding="utf-8")

    return total_replacements


def main() -> None:
    dry_run = "--write" not in sys.argv

    if dry_run:
        print("=" * 60)
        print("DRY RUN — no files will be modified.")
        print("Run with --write to apply changes.")
        print("=" * 60)
        print()

    # ── Build combined mapping ────────────────────────────────────────────
    mapping = build_combined_mapping()

    nav_count = len(NAV_PAGE_MOVES)
    orphan_count = len(ORPHAN_REDIRECTS_RAW)
    combined_count = len(mapping)

    print(f"Nav page moves:        {nav_count}")
    print(f"Orphan redirects:      {orphan_count}")
    print(f"Combined unique paths: {combined_count}")

    # Show any overlapping keys
    overlap_count = nav_count + orphan_count - combined_count
    if overlap_count > 0:
        print(f"Overlapping keys:      {overlap_count} (nav move takes precedence)")

    print()

    # ── Build regex ───────────────────────────────────────────────────────
    regex = build_regex(mapping)

    # ── Walk all .mdx files ───────────────────────────────────────────────
    mdx_files: list[Path] = []
    for root, dirs, files in os.walk(DOCS_ROOT):
        # Skip hidden directories and node_modules
        dirs[:] = [
            d for d in dirs
            if not d.startswith(".") and d != "node_modules"
        ]
        for fname in files:
            if fname.endswith(".mdx"):
                mdx_files.append(Path(root) / fname)

    mdx_files.sort()
    print(f"Found {len(mdx_files)} .mdx files to scan.\n")

    # ── Process each file ─────────────────────────────────────────────────
    files_modified = 0
    total_replacements = 0
    modified_details: list[tuple[str, int]] = []

    for filepath in mdx_files:
        count = process_file(filepath, regex, mapping, dry_run)
        if count > 0:
            files_modified += 1
            total_replacements += count
            rel_path = filepath.relative_to(DOCS_ROOT)
            modified_details.append((str(rel_path), count))

    # ── Summary ───────────────────────────────────────────────────────────
    print("=" * 60)
    print("RESULTS")
    print("=" * 60)

    if modified_details:
        print(f"\nFiles with link updates ({files_modified}):\n")
        for rel_path, count in modified_details:
            print(f"  {rel_path:70s}  {count:3d} replacement(s)")

    print()
    print(f"  Total .mdx files scanned:  {len(mdx_files)}")
    print(f"  Files modified:            {files_modified}")
    print(f"  Total replacements:        {total_replacements}")
    print()

    if dry_run:
        print("This was a DRY RUN. No files were changed.")
        print("Run with --write to apply changes.")
    else:
        print("Changes have been written to disk.")


if __name__ == "__main__":
    main()
