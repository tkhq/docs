#!/usr/bin/env bash
#
# step1-move-files.sh
# Phase 3 file moves -- 187 total (Generated from url-mapping-draft.md)
#
# Usage:  cd /Users/graham/Documents/DocsRepo/docs && bash step1-move-files.sh
#
set -euo pipefail

cd /Users/graham/Documents/DocsRepo/docs/

# =============================================================================
# Solutions  (96 moves)
# =============================================================================

# --- Embedded Wallets overview / top-level pages ---
mkdir -p "solutions/embedded-wallets"
git mv "embedded-wallets/overview.mdx" "solutions/embedded-wallets/overview.mdx"
git mv "embedded-wallets/code-examples/embedded-consumer-wallet.mdx" "solutions/embedded-wallets/embedded-consumer-wallet.mdx"
git mv "products/embedded-business-wallets/overview.mdx" "solutions/embedded-wallets/embedded-business-wallets.mdx"
git mv "embedded-wallets/embedded-waas.mdx" "solutions/embedded-wallets/embedded-waas.mdx"
git mv "getting-started/embedded-wallet-quickstart.mdx" "solutions/embedded-wallets/quickstart.mdx"

# --- Embedded Wallets integration guide overview ---
mkdir -p "solutions/embedded-wallets/integration-guide"
git mv "embedded-wallets/integration-guide/overview.mdx" "solutions/embedded-wallets/integration-guide/overview.mdx"

# --- React SDK -> solutions/embedded-wallets/integration-guide/react ---
mkdir -p "solutions/embedded-wallets/integration-guide/react/using-external-wallets"
git mv "sdks/react/index.mdx" "solutions/embedded-wallets/integration-guide/react/index.mdx"
git mv "sdks/react/getting-started.mdx" "solutions/embedded-wallets/integration-guide/react/getting-started.mdx"
git mv "sdks/react/auth.mdx" "solutions/embedded-wallets/integration-guide/react/auth.mdx"
git mv "sdks/react/using-embedded-wallets.mdx" "solutions/embedded-wallets/integration-guide/react/using-embedded-wallets.mdx"
git mv "sdks/react/using-external-wallets/overview.mdx" "solutions/embedded-wallets/integration-guide/react/using-external-wallets/overview.mdx"
git mv "sdks/react/using-external-wallets/authentication.mdx" "solutions/embedded-wallets/integration-guide/react/using-external-wallets/authentication.mdx"
git mv "sdks/react/using-external-wallets/connecting.mdx" "solutions/embedded-wallets/integration-guide/react/using-external-wallets/connecting.mdx"
git mv "sdks/react/signing.mdx" "solutions/embedded-wallets/integration-guide/react/signing.mdx"
git mv "sdks/react/ui-customization.mdx" "solutions/embedded-wallets/integration-guide/react/ui-customization.mdx"
git mv "sdks/react/sub-organization-customization.mdx" "solutions/embedded-wallets/integration-guide/react/sub-organization-customization.mdx"
git mv "sdks/react/advanced-api-requests.mdx" "solutions/embedded-wallets/integration-guide/react/advanced-api-requests.mdx"
git mv "sdks/react/advanced-backend-authentication.mdx" "solutions/embedded-wallets/integration-guide/react/advanced-backend-authentication.mdx"
git mv "sdks/react/migrating-sdk-react.mdx" "solutions/embedded-wallets/integration-guide/react/migrating-sdk-react.mdx"
git mv "sdks/react/troubleshooting.mdx" "solutions/embedded-wallets/integration-guide/react/troubleshooting.mdx"
git mv "sdks/react/legacy.mdx" "solutions/embedded-wallets/integration-guide/react/legacy.mdx"

# --- React Native SDK -> solutions/embedded-wallets/integration-guide/react-native ---
mkdir -p "solutions/embedded-wallets/integration-guide/react-native/authentication"
git mv "sdks/react-native/overview.mdx" "solutions/embedded-wallets/integration-guide/react-native/overview.mdx"
git mv "sdks/react-native/getting-started.mdx" "solutions/embedded-wallets/integration-guide/react-native/getting-started.mdx"
git mv "sdks/react-native/authentication/overview.mdx" "solutions/embedded-wallets/integration-guide/react-native/authentication/overview.mdx"
git mv "sdks/react-native/authentication/email-sms.mdx" "solutions/embedded-wallets/integration-guide/react-native/authentication/email-sms.mdx"
git mv "sdks/react-native/authentication/passkey.mdx" "solutions/embedded-wallets/integration-guide/react-native/authentication/passkey.mdx"
git mv "sdks/react-native/authentication/social-logins.mdx" "solutions/embedded-wallets/integration-guide/react-native/authentication/social-logins.mdx"
git mv "sdks/react-native/sub-organization-customization.mdx" "solutions/embedded-wallets/integration-guide/react-native/sub-organization-customization.mdx"
git mv "sdks/react-native/using-embedded-wallets.mdx" "solutions/embedded-wallets/integration-guide/react-native/using-embedded-wallets.mdx"
git mv "sdks/react-native/signing.mdx" "solutions/embedded-wallets/integration-guide/react-native/signing.mdx"
git mv "sdks/react-native/advanced-api-requests.mdx" "solutions/embedded-wallets/integration-guide/react-native/advanced-api-requests.mdx"

# --- TypeScript Frontend SDK -> solutions/embedded-wallets/integration-guide/typescript ---
mkdir -p "solutions/embedded-wallets/integration-guide/typescript"
git mv "sdks/typescript-frontend/index.mdx" "solutions/embedded-wallets/integration-guide/typescript/index.mdx"
git mv "sdks/typescript-frontend/getting-started.mdx" "solutions/embedded-wallets/integration-guide/typescript/getting-started.mdx"
git mv "sdks/typescript-frontend/auth.mdx" "solutions/embedded-wallets/integration-guide/typescript/auth.mdx"
git mv "sdks/typescript-frontend/advanced-backend-authentication.mdx" "solutions/embedded-wallets/integration-guide/typescript/advanced-backend-authentication.mdx"
git mv "sdks/typescript-frontend/advanced-api-requests.mdx" "solutions/embedded-wallets/integration-guide/typescript/advanced-api-requests.mdx"
git mv "sdks/typescript-frontend/legacy.mdx" "solutions/embedded-wallets/integration-guide/typescript/legacy.mdx"

# --- Flutter SDK -> solutions/embedded-wallets/integration-guide/flutter ---
mkdir -p "solutions/embedded-wallets/integration-guide/flutter/authentication"
git mv "sdks/flutter/index.mdx" "solutions/embedded-wallets/integration-guide/flutter/index.mdx"
git mv "sdks/flutter/getting-started.mdx" "solutions/embedded-wallets/integration-guide/flutter/getting-started.mdx"
git mv "sdks/flutter/authentication/overview.mdx" "solutions/embedded-wallets/integration-guide/flutter/authentication/overview.mdx"
git mv "sdks/flutter/authentication/email-sms.mdx" "solutions/embedded-wallets/integration-guide/flutter/authentication/email-sms.mdx"
git mv "sdks/flutter/authentication/passkey.mdx" "solutions/embedded-wallets/integration-guide/flutter/authentication/passkey.mdx"
git mv "sdks/flutter/authentication/social-logins.mdx" "solutions/embedded-wallets/integration-guide/flutter/authentication/social-logins.mdx"
git mv "sdks/flutter/sub-organization-customization.mdx" "solutions/embedded-wallets/integration-guide/flutter/sub-organization-customization.mdx"
git mv "sdks/flutter/using-embedded-wallets.mdx" "solutions/embedded-wallets/integration-guide/flutter/using-embedded-wallets.mdx"
git mv "sdks/flutter/signing.mdx" "solutions/embedded-wallets/integration-guide/flutter/signing.mdx"
git mv "sdks/flutter/advanced-api-requests.mdx" "solutions/embedded-wallets/integration-guide/flutter/advanced-api-requests.mdx"

# --- Swift SDK -> solutions/embedded-wallets/integration-guide/swift ---
mkdir -p "solutions/embedded-wallets/integration-guide/swift/authentication"
git mv "sdks/swift/overview.mdx" "solutions/embedded-wallets/integration-guide/swift/overview.mdx"
git mv "sdks/swift/getting-started.mdx" "solutions/embedded-wallets/integration-guide/swift/getting-started.mdx"
git mv "sdks/swift/authentication/overview.mdx" "solutions/embedded-wallets/integration-guide/swift/authentication/overview.mdx"
git mv "sdks/swift/authentication/email-sms.mdx" "solutions/embedded-wallets/integration-guide/swift/authentication/email-sms.mdx"
git mv "sdks/swift/authentication/passkey.mdx" "solutions/embedded-wallets/integration-guide/swift/authentication/passkey.mdx"
git mv "sdks/swift/authentication/social-logins.mdx" "solutions/embedded-wallets/integration-guide/swift/authentication/social-logins.mdx"
git mv "sdks/swift/signing.mdx" "solutions/embedded-wallets/integration-guide/swift/signing.mdx"
git mv "sdks/swift/sub-organization-customization.mdx" "solutions/embedded-wallets/integration-guide/swift/sub-organization-customization.mdx"
git mv "sdks/swift/advanced-api-requests.mdx" "solutions/embedded-wallets/integration-guide/swift/advanced-api-requests.mdx"
git mv "sdks/swift/using-embedded-wallets.mdx" "solutions/embedded-wallets/integration-guide/swift/using-embedded-wallets.mdx"
git mv "sdks/swift/advanced-backend-authentication.mdx" "solutions/embedded-wallets/integration-guide/swift/advanced-backend-authentication.mdx"

# --- Kotlin SDK -> solutions/embedded-wallets/integration-guide/kotlin ---
mkdir -p "solutions/embedded-wallets/integration-guide/kotlin/authentication"
git mv "sdks/kotlin/overview.mdx" "solutions/embedded-wallets/integration-guide/kotlin/overview.mdx"
git mv "sdks/kotlin/getting-started.mdx" "solutions/embedded-wallets/integration-guide/kotlin/getting-started.mdx"
git mv "sdks/kotlin/authentication/overview.mdx" "solutions/embedded-wallets/integration-guide/kotlin/authentication/overview.mdx"
git mv "sdks/kotlin/authentication/email-sms.mdx" "solutions/embedded-wallets/integration-guide/kotlin/authentication/email-sms.mdx"
git mv "sdks/kotlin/authentication/passkey.mdx" "solutions/embedded-wallets/integration-guide/kotlin/authentication/passkey.mdx"
git mv "sdks/kotlin/authentication/social-logins.mdx" "solutions/embedded-wallets/integration-guide/kotlin/authentication/social-logins.mdx"
git mv "sdks/kotlin/authentication/rp-id-setup.mdx" "solutions/embedded-wallets/integration-guide/kotlin/authentication/rp-id-setup.mdx"
git mv "sdks/kotlin/sub-organization-customization.mdx" "solutions/embedded-wallets/integration-guide/kotlin/sub-organization-customization.mdx"
git mv "sdks/kotlin/using-embedded-wallets.mdx" "solutions/embedded-wallets/integration-guide/kotlin/using-embedded-wallets.mdx"
git mv "sdks/kotlin/signing.mdx" "solutions/embedded-wallets/integration-guide/kotlin/signing.mdx"
git mv "sdks/kotlin/advanced-api-requests.mdx" "solutions/embedded-wallets/integration-guide/kotlin/advanced-api-requests.mdx"

# --- Company Wallets ---
mkdir -p "solutions/company-wallets/integration-guide"
git mv "company-wallets/overview.mdx" "solutions/company-wallets/overview.mdx"
git mv "company-wallets/code-examples/payment-orchestration.mdx" "solutions/company-wallets/payment-orchestration.mdx"
git mv "company-wallets/code-examples/smart-contract-management.mdx" "solutions/company-wallets/smart-contract-management.mdx"
git mv "company-wallets/use-cases/agentic-wallets.mdx" "solutions/company-wallets/agentic-wallets.mdx"
git mv "getting-started/company-wallets-quickstart.mdx" "solutions/company-wallets/quickstart.mdx"
git mv "company-wallets/integration-guide/overview.mdx" "solutions/company-wallets/integration-guide/overview.mdx"
git mv "sdks/javascript-server.mdx" "solutions/company-wallets/integration-guide/javascript-server.mdx"
git mv "sdks/golang.mdx" "solutions/company-wallets/integration-guide/golang.mdx"
git mv "sdks/ruby.mdx" "solutions/company-wallets/integration-guide/ruby.mdx"
git mv "sdks/rust.mdx" "solutions/company-wallets/integration-guide/rust.mdx"
git mv "sdks/python.mdx" "solutions/company-wallets/integration-guide/python.mdx"

# --- Key Management ---
mkdir -p "solutions/key-management"
git mv "products/key-management/overview.mdx" "solutions/key-management/overview.mdx"
git mv "products/key-management/examples/encryption-key-storage.mdx" "solutions/key-management/encryption-key-storage.mdx"
git mv "products/key-management/examples/enterprise-disaster-recovery.mdx" "solutions/key-management/enterprise-disaster-recovery.mdx"

# --- Cookbooks ---
mkdir -p "solutions/cookbooks"
git mv "cookbook/landing.mdx" "solutions/cookbooks/landing.mdx"
git mv "cookbook/morpho.mdx" "solutions/cookbooks/morpho.mdx"
git mv "cookbook/aave.mdx" "solutions/cookbooks/aave.mdx"
git mv "cookbook/breeze.mdx" "solutions/cookbooks/breeze.mdx"
git mv "cookbook/yieldxyz.mdx" "solutions/cookbooks/yieldxyz.mdx"
git mv "cookbook/jupiter.mdx" "solutions/cookbooks/jupiter.mdx"
git mv "cookbook/lifi.mdx" "solutions/cookbooks/lifi.mdx"
git mv "cookbook/0x.mdx" "solutions/cookbooks/0x.mdx"
git mv "cookbook/relay.mdx" "solutions/cookbooks/relay.mdx"
git mv "cookbook/polymarket-builders.mdx" "solutions/cookbooks/polymarket-builders.mdx"
git mv "cookbook/base-builder-codes.mdx" "solutions/cookbooks/base-builder-codes.mdx"
git mv "cookbook/brale.mdx" "solutions/cookbooks/brale.mdx"
git mv "reference/tron-gasless-transactions.mdx" "solutions/cookbooks/tron-gasless-transactions.mdx"

# =============================================================================
# Get started  (7 moves)
# =============================================================================

mkdir -p "get-started"
git mv "home.mdx" "get-started/about-turnkey.mdx"
git mv "getting-started/quickstart.mdx" "get-started/quickstart.mdx"
git mv "developer-reference/using-llms.mdx" "get-started/using-llms.mdx"
git mv "ai/skills.mdx" "get-started/ai-skills.mdx"
git mv "getting-started/examples.mdx" "get-started/examples.mdx"
git mv "production-checklist/production-checklist.mdx" "get-started/production-checklist.mdx"
git mv "production-checklist/backup-recovery.mdx" "get-started/backup-recovery.mdx"

# =============================================================================
# Features  (71 moves)
# =============================================================================

# --- Organizations & Sub-organizations ---
mkdir -p "features"
git mv "concepts/organizations.mdx" "features/organizations.mdx"
git mv "concepts/sub-organizations.mdx" "features/sub-organizations.mdx"

# --- Users ---
mkdir -p "features/users"
git mv "concepts/users/introduction.mdx" "features/users/introduction.mdx"
git mv "concepts/users/credentials.mdx" "features/users/credentials.mdx"
git mv "concepts/users/root-quorum.mdx" "features/users/root-quorum.mdx"
git mv "concepts/users/best-practices.mdx" "features/users/best-practices.mdx"

# --- Authentication ---
mkdir -p "features/authentication/passkeys"
git mv "authentication/overview.mdx" "features/authentication/overview.mdx"
git mv "authentication/email.mdx" "features/authentication/email.mdx"
git mv "authentication/social-logins.mdx" "features/authentication/social-logins.mdx"
git mv "authentication/sms.mdx" "features/authentication/sms.mdx"
git mv "authentication/passkeys/introduction.mdx" "features/authentication/passkeys/introduction.mdx"
git mv "authentication/passkeys/integration.mdx" "features/authentication/passkeys/integration.mdx"
git mv "authentication/passkeys/options.mdx" "features/authentication/passkeys/options.mdx"
git mv "authentication/passkeys/native.mdx" "features/authentication/passkeys/native.mdx"
git mv "authentication/passkeys/discoverable-vs-non-discoverable.mdx" "features/authentication/passkeys/discoverable-vs-non-discoverable.mdx"
git mv "authentication/backend-setup.mdx" "features/authentication/backend-setup.mdx"
git mv "authentication/bring-your-own-auth.mdx" "features/authentication/bring-your-own-auth.mdx"
git mv "reference/auth-proxy.mdx" "features/authentication/auth-proxy.mdx"
git mv "authentication/sessions.mdx" "features/authentication/sessions.mdx"
git mv "authentication/proxying-signed-requests.mdx" "features/authentication/proxying-signed-requests.mdx"

# --- Wallets ---
mkdir -p "features/wallets"
git mv "concepts/wallets.mdx" "features/wallets.mdx"
git mv "products/company-wallets/features/import-wallets.mdx" "features/wallets/import-wallets.mdx"
git mv "products/company-wallets/features/export-wallets.mdx" "features/wallets/export-wallets.mdx"
git mv "wallets/pregenerated-wallets.mdx" "features/wallets/pregenerated-wallets.mdx"
git mv "wallets/claim-links.mdx" "features/wallets/claim-links.mdx"
git mv "embedded-wallets/send-crypto-via-url.mdx" "features/wallets/send-crypto-via-url.mdx"
git mv "reference/aa-wallets.mdx" "features/wallets/aa-wallets.mdx"

# --- Networks ---
mkdir -p "features/networks"
git mv "networks/overview.mdx" "features/networks/overview.mdx"
git mv "networks/ethereum.mdx" "features/networks/ethereum.mdx"
git mv "networks/solana.mdx" "features/networks/solana.mdx"
git mv "networks/solana-transaction-construction.mdx" "features/networks/solana-transaction-construction.mdx"
git mv "networks/solana-rent-refunds.mdx" "features/networks/solana-rent-refunds.mdx"
git mv "networks/bitcoin.mdx" "features/networks/bitcoin.mdx"
git mv "networks/spark.mdx" "features/networks/spark.mdx"
git mv "networks/hyperliquid.mdx" "features/networks/hyperliquid.mdx"
git mv "networks/cosmos.mdx" "features/networks/cosmos.mdx"
git mv "networks/tron.mdx" "features/networks/tron.mdx"
git mv "networks/sui.mdx" "features/networks/sui.mdx"
git mv "networks/sei.mdx" "features/networks/sei.mdx"
git mv "networks/stacks.mdx" "features/networks/stacks.mdx"
git mv "networks/aptos.mdx" "features/networks/aptos.mdx"
git mv "networks/tempo.mdx" "features/networks/tempo.mdx"
git mv "networks/movement.mdx" "features/networks/movement.mdx"
git mv "networks/iota.mdx" "features/networks/iota.mdx"
git mv "networks/doge.mdx" "features/networks/doge.mdx"
git mv "networks/others.mdx" "features/networks/others.mdx"

# --- Policies ---
mkdir -p "features/policies/examples"
mkdir -p "features/policies/delegated-access"
git mv "concepts/policies/overview.mdx" "features/policies/overview.mdx"
git mv "concepts/policies/quickstart.mdx" "features/policies/quickstart.mdx"
git mv "concepts/policies/language.mdx" "features/policies/language.mdx"
git mv "concepts/policies/smart-contract-interfaces.mdx" "features/policies/smart-contract-interfaces.mdx"
git mv "concepts/policies/examples/access-control.mdx" "features/policies/examples/access-control.mdx"
git mv "company-wallets/co-signing-transactions.mdx" "features/policies/examples/co-signing-transactions.mdx"
git mv "concepts/policies/examples/signing-control.mdx" "features/policies/examples/signing-control.mdx"
git mv "concepts/policies/examples/ethereum.mdx" "features/policies/examples/ethereum.mdx"
git mv "concepts/policies/examples/solana.mdx" "features/policies/examples/solana.mdx"
git mv "concepts/policies/examples/tron.mdx" "features/policies/examples/tron.mdx"
git mv "concepts/policies/examples/bitcoin.mdx" "features/policies/examples/bitcoin.mdx"
git mv "concepts/policies/examples/tempo.mdx" "features/policies/examples/tempo.mdx"
git mv "concepts/policies/delegated-access-overview.mdx" "features/policies/delegated-access/overview.mdx"
git mv "concepts/policies/delegated-access-frontend.mdx" "features/policies/delegated-access/frontend.mdx"
git mv "concepts/policies/delegated-access-backend.mdx" "features/policies/delegated-access/backend.mdx"
git mv "products/embedded-wallets/features/agentic-wallets.mdx" "features/policies/delegated-access/agentic-wallets.mdx"

# --- Transaction Management ---
mkdir -p "features/transaction-management"
git mv "concepts/transaction-management.mdx" "features/transaction-management.mdx"
git mv "concepts/broadcasting.mdx" "features/transaction-management/broadcasting.mdx"
git mv "embedded-wallets/code-examples/sending-sponsored-transactions.mdx" "features/transaction-management/sending-sponsored-transactions.mdx"
git mv "embedded-wallets/code-examples/sending-sponsored-solana-transactions.mdx" "features/transaction-management/sending-sponsored-solana-transactions.mdx"
git mv "concepts/balances.mdx" "features/transaction-management/balances.mdx"
git mv "wallets/fiat-on-ramp.mdx" "features/transaction-management/fiat-on-ramp.mdx"

# --- Verifiable Cloud ---
mkdir -p "features/verifiable-cloud"
git mv "products/verifiable-cloud/overview.mdx" "features/verifiable-cloud/overview.mdx"
git mv "products/verifiable-cloud/onboarding.mdx" "features/verifiable-cloud/onboarding.mdx"
git mv "getting-started/verifiable-cloud-quickstart.mdx" "features/verifiable-cloud/quickstart.mdx"

# =============================================================================
# Reference  (4 moves)
# =============================================================================

mkdir -p "reference"
git mv "concepts/resource-limits.mdx" "reference/resource-limits.mdx"
git mv "developer-reference/webhooks.mdx" "reference/webhooks.mdx"
git mv "getting-started/migration-guide.mdx" "reference/migration-guide.mdx"
git mv "faq.mdx" "reference/faq.mdx"

# =============================================================================
# API reference  (3 moves)
# =============================================================================

mkdir -p "api-reference/overview"
git mv "developer-reference/api-overview/intro.mdx" "api-reference/overview/intro.mdx"
git mv "developer-reference/api-overview/stamps.mdx" "api-reference/overview/stamps.mdx"
git mv "developer-reference/api-overview/errors.mdx" "api-reference/overview/errors.mdx"

# =============================================================================
# SDK reference  (4 moves)
# =============================================================================

mkdir -p "sdks/web3"
mkdir -p "sdks/advanced"
git mv "category/web3-libraries.mdx" "sdks/web3/overview.mdx"
git mv "wallets/wagmi.mdx" "sdks/web3/wagmi.mdx"
git mv "category/advanced.mdx" "sdks/advanced/overview.mdx"
git mv "embedded-wallets/code-examples/client-side-signing.mdx" "sdks/advanced/client-side-signing.mdx"

# =============================================================================
# Security  (2 moves)
# =============================================================================

mkdir -p "security"
git mv "category/security.mdx" "security/overview.mdx"
git mv "products/company-wallets/features/security/remote-attestation.mdx" "security/remote-attestation.mdx"

echo "Done. Moved 187 files."
