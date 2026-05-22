#!/usr/bin/env python3
"""
Step 4: Add redirect entries for orphaned pages.

Adds 70 redirect entries to docs.json for pages that were removed from
navigation (orphaned) during the docs restructure. Each orphan is redirected
to the most relevant replacement page.

These redirects were derived from the Phase 2 tables in url-mapping-draft.md,
with destination paths resolved through the Phase 3 mapping to final URLs.

Usage:
    python3 step4-add-orphan-redirects.py
"""

import json
import sys
from pathlib import Path

DOCS_JSON = Path(__file__).parent / "docs.json"

# ---------------------------------------------------------------------------
# 70 orphan redirect entries (source -> destination), fully resolved.
#
# Organized by category matching the Phase 2 tables:
#   - Product Features (14)
#   - API Pages (8)
#   - Code Examples (16)
#   - Overview/Landing Pages (7)
#   - Auth/Getting-Started/Misc (9)
#   - Production Checklists (2)
#   - SDK Pages (11)
#   - Wallet Pages (2)
#   - Additional (1)
# ---------------------------------------------------------------------------

ORPHAN_REDIRECTS = [
    # ── Product Features (14) ─────────────────────────────────────────────
    {
        "source": "/products/company-wallets/features/dashboard",
        "destination": "/solutions/company-wallets/overview",
        "permanent": True,
    },
    {
        "source": "/products/company-wallets/features/multi-chain-support",
        "destination": "/features/networks/overview",
        "permanent": True,
    },
    {
        "source": "/products/company-wallets/features/off-chain-contracts",
        "destination": "/solutions/company-wallets/overview",
        "permanent": True,
    },
    {
        "source": "/products/company-wallets/features/scoped-api-key",
        "destination": "/solutions/company-wallets/overview",
        "permanent": True,
    },
    {
        "source": "/products/company-wallets/features/security/compliance",
        "destination": "/security/our-approach",
        "permanent": True,
    },
    {
        "source": "/products/company-wallets/features/security/quorum-os",
        "destination": "/security/secure-enclaves",
        "permanent": True,
    },
    {
        "source": "/products/company-wallets/features/security/secure-hardware",
        "destination": "/security/secure-enclaves",
        "permanent": True,
    },
    {
        "source": "/products/company-wallets/policy-engine",
        "destination": "/features/policies/quickstart",
        "permanent": True,
    },
    {
        "source": "/products/embedded-wallets/features/export-wallets",
        "destination": "/features/wallets/export-wallets",
        "permanent": True,
    },
    {
        "source": "/products/embedded-wallets/features/fiat-on-ramp",
        "destination": "/features/transaction-management/fiat-on-ramp",
        "permanent": True,
    },
    {
        "source": "/products/embedded-wallets/features/gas-sponsorship",
        "destination": "/features/transaction-management/broadcasting",
        "permanent": True,
    },
    {
        "source": "/products/embedded-wallets/features/import-wallets",
        "destination": "/features/wallets/import-wallets",
        "permanent": True,
    },
    {
        "source": "/products/embedded-wallets/features/multi-chain-support",
        "destination": "/features/networks/overview",
        "permanent": True,
    },
    {
        "source": "/products/embedded-wallets/features/policy-engine",
        "destination": "/features/policies/quickstart",
        "permanent": True,
    },
    # ── API Pages (8) ─────────────────────────────────────────────────────
    {
        "source": "/api-overview",
        "destination": "/api-reference/overview/intro",
        "permanent": True,
    },
    {
        "source": "/api-reference/activities/submit-a-raw-transaction-for-broadcasting",
        "destination": "/api-reference/activities/overview",
        "permanent": True,
    },
    {
        "source": "/api-reference/activities/submit-a-transaction-intent-for-broadcasting",
        "destination": "/api-reference/activities/overview",
        "permanent": True,
    },
    {
        "source": "/api-reference/overview",
        "destination": "/api-reference/overview/intro",
        "permanent": True,
    },
    {
        "source": "/api-reference/queries/get-gas-usage-and-limits",
        "destination": "/api-reference/queries/get-gas-usage",
        "permanent": True,
    },
    {
        "source": "/api-reference/queries/get-nonces-for-an-address",
        "destination": "/api-reference/queries/get-nonces",
        "permanent": True,
    },
    {
        "source": "/api-reference/queries/get-suborgs",
        "destination": "/api-reference/queries/get-sub-organizations",
        "permanent": True,
    },
    {
        "source": "/api-reference/queries/get-verified-suborgs",
        "destination": "/api-reference/queries/get-verified-sub-organizations",
        "permanent": True,
    },
    # ── Code Examples (16) ────────────────────────────────────────────────
    {
        "source": "/company-wallets/code-examples/balance-sweeper",
        "destination": "/solutions/company-wallets/overview",
        "permanent": True,
    },
    {
        "source": "/company-wallets/code-examples/sending-sponsored-transactions",
        "destination": "/features/transaction-management/broadcasting",
        "permanent": True,
    },
    {
        "source": "/company-wallets/code-examples/signing-transactions",
        "destination": "/solutions/company-wallets/overview",
        "permanent": True,
    },
    {
        "source": "/embedded-wallets/code-examples/add-credential",
        "destination": "/solutions/embedded-wallets/integration-guide/react/index",
        "permanent": True,
    },
    {
        "source": "/embedded-wallets/code-examples/authenticate-user-email",
        "destination": "/solutions/embedded-wallets/integration-guide/react/auth",
        "permanent": True,
    },
    {
        "source": "/embedded-wallets/code-examples/authenticate-user-passkey",
        "destination": "/solutions/embedded-wallets/integration-guide/react/sub-organization-customization",
        "permanent": True,
    },
    {
        "source": "/embedded-wallets/code-examples/create-passkey-session",
        "destination": "/solutions/embedded-wallets/integration-guide/react/auth",
        "permanent": True,
    },
    {
        "source": "/embedded-wallets/code-examples/create-sub-org-passkey",
        "destination": "/solutions/embedded-wallets/integration-guide/react/sub-organization-customization",
        "permanent": True,
    },
    {
        "source": "/embedded-wallets/code-examples/create-user-email",
        "destination": "/solutions/embedded-wallets/integration-guide/react/sub-organization-customization",
        "permanent": True,
    },
    {
        "source": "/embedded-wallets/code-examples/email-recovery",
        "destination": "/features/authentication/email",
        "permanent": True,
    },
    {
        "source": "/embedded-wallets/code-examples/export",
        "destination": "/solutions/embedded-wallets/integration-guide/react/using-embedded-wallets",
        "permanent": True,
    },
    {
        "source": "/embedded-wallets/code-examples/fiat-on-ramp",
        "destination": "/features/transaction-management/fiat-on-ramp",
        "permanent": True,
    },
    {
        "source": "/embedded-wallets/code-examples/import",
        "destination": "/solutions/embedded-wallets/integration-guide/react/using-embedded-wallets",
        "permanent": True,
    },
    {
        "source": "/embedded-wallets/code-examples/signing-transactions",
        "destination": "/solutions/embedded-wallets/integration-guide/react/signing",
        "permanent": True,
    },
    {
        "source": "/embedded-wallets/code-examples/social-linking",
        "destination": "/solutions/embedded-wallets/integration-guide/react/auth",
        "permanent": True,
    },
    {
        "source": "/embedded-wallets/code-examples/wallet-auth",
        "destination": "/solutions/embedded-wallets/integration-guide/react/using-external-wallets/overview",
        "permanent": True,
    },
    # ── Overview/Landing Pages (7) ────────────────────────────────────────
    {
        "source": "/category/code-examples",
        "destination": "/solutions/embedded-wallets/overview",
        "permanent": True,
    },
    {
        "source": "/category/code-examples-1",
        "destination": "/solutions/company-wallets/overview",
        "permanent": True,
    },
    {
        "source": "/concepts/overview",
        "destination": "/get-started/about-turnkey",
        "permanent": True,
    },
    {
        "source": "/embedded-wallets/demos",
        "destination": "/solutions/embedded-wallets/quickstart",
        "permanent": True,
    },
    {
        "source": "/embedded-wallets/features/overview",
        "destination": "/solutions/embedded-wallets/overview",
        "permanent": True,
    },
    {
        "source": "/products/key-management/examples/overview",
        "destination": "/solutions/key-management/overview",
        "permanent": True,
    },
    {
        "source": "/products/verifiable-cloud/lifecycle",
        "destination": "/features/verifiable-cloud/overview",
        "permanent": True,
    },
    # ── Auth/Getting-Started/Misc (9) ─────────────────────────────────────
    {
        "source": "/authentication/credentials",
        "destination": "/features/users/credentials",
        "permanent": True,
    },
    {
        "source": "/authentication/otp-migration-guide",
        "destination": "/features/authentication/overview",
        "permanent": True,
    },
    {
        "source": "/cookbook/gelato",
        "destination": "/sdks/web3/gas-station",
        "permanent": True,
    },
    {
        "source": "/developer-reference/api-overview/queries",
        "destination": "/api-reference/queries/overview",
        "permanent": True,
    },
    {
        "source": "/developer-reference/api-overview/submissions",
        "destination": "/api-reference/activities/overview",
        "permanent": True,
    },
    {
        "source": "/embedded-wallets/sub-organization-auth",
        "destination": "/features/authentication/email",
        "permanent": True,
    },
    {
        "source": "/embedded-wallets/sub-organization-recovery",
        "destination": "/features/authentication/email",
        "permanent": True,
    },
    {
        "source": "/getting-started",
        "destination": "/get-started/about-turnkey",
        "permanent": True,
    },
    {
        "source": "/getting-started/launch-checklist",
        "destination": "/get-started/production-checklist",
        "permanent": True,
    },
    # ── Production Checklists (2) ─────────────────────────────────────────
    {
        "source": "/production-checklist/company-wallet",
        "destination": "/solutions/company-wallets/integration-guide/overview",
        "permanent": True,
    },
    {
        "source": "/production-checklist/embedded-wallet",
        "destination": "/solutions/embedded-wallets/integration-guide/overview",
        "permanent": True,
    },
    # ── SDK Pages (11) ────────────────────────────────────────────────────
    {
        "source": "/reference/embedded-wallet-kit",
        "destination": "/solutions/embedded-wallets/integration-guide/react/getting-started",
        "permanent": True,
    },
    {
        "source": "/reference/solana-gasless-transactions",
        "destination": "/features/transaction-management",
        "permanent": True,
    },
    {
        "source": "/sdks/cli",
        "destination": "/sdks/introduction",
        "permanent": True,
    },
    {
        "source": "/sdks/flutter/landing",
        "destination": "/solutions/embedded-wallets/integration-guide/flutter/getting-started",
        "permanent": True,
    },
    {
        "source": "/sdks/kotlin",
        "destination": "/solutions/embedded-wallets/integration-guide/kotlin/overview",
        "permanent": True,
    },
    {
        "source": "/sdks/kotlin/landing",
        "destination": "/solutions/embedded-wallets/integration-guide/kotlin/getting-started",
        "permanent": True,
    },
    {
        "source": "/sdks/react-native",
        "destination": "/solutions/embedded-wallets/integration-guide/react-native/getting-started",
        "permanent": True,
    },
    {
        "source": "/sdks/react/landing",
        "destination": "/solutions/embedded-wallets/integration-guide/react/getting-started",
        "permanent": True,
    },
    {
        "source": "/sdks/swift",
        "destination": "/solutions/embedded-wallets/integration-guide/swift/overview",
        "permanent": True,
    },
    {
        "source": "/sdks/swift/landing",
        "destination": "/solutions/embedded-wallets/integration-guide/swift/getting-started",
        "permanent": True,
    },
    {
        "source": "/sdks/typescript-frontend/landing",
        "destination": "/solutions/embedded-wallets/integration-guide/typescript/getting-started",
        "permanent": True,
    },
    # ── Wallet Pages (2) ──────────────────────────────────────────────────
    {
        "source": "/wallets/export-wallets",
        "destination": "/features/wallets/export-wallets",
        "permanent": True,
    },
    {
        "source": "/wallets/import-wallets",
        "destination": "/features/wallets/import-wallets",
        "permanent": True,
    },
    # ── Additional (1) ────────────────────────────────────────────────────
    {
        "source": "/home",
        "destination": "/welcome",
        "permanent": True,
    },
]


def main():
    # Validate hardcoded count
    assert len(ORPHAN_REDIRECTS) == 70, (
        f"Expected 70 orphan redirects, got {len(ORPHAN_REDIRECTS)}"
    )

    # ── Read docs.json ────────────────────────────────────────────────────
    print(f"Reading {DOCS_JSON} ...")
    with open(DOCS_JSON, "r") as f:
        data = json.load(f)

    existing_redirects = data.get("redirects", [])
    before_count = len(existing_redirects)
    print(f"Existing redirects: {before_count}")

    # Build lookup sets for conflict detection
    existing_sources = {}
    for r in existing_redirects:
        existing_sources[r["source"]] = r["destination"]

    existing_destinations = set(r["destination"] for r in existing_redirects)

    # ── Check for conflicts ───────────────────────────────────────────────
    duplicates = []
    chains = []
    added = []
    skipped = []

    for entry in ORPHAN_REDIRECTS:
        src = entry["source"]
        dst = entry["destination"]

        # Check 1: Source already exists as a source (duplicate)
        if src in existing_sources:
            existing_dst = existing_sources[src]
            if existing_dst == dst:
                print(
                    f"  DUPLICATE (same dest, skipping): {src} -> {dst}"
                )
            else:
                print(
                    f"  DUPLICATE (different dest, skipping): "
                    f"{src} -> {existing_dst} (existing) vs {dst} (new)"
                )
            duplicates.append(entry)
            skipped.append(entry)
            continue

        # Check 2: Source path is an existing destination (creates a chain)
        if src in existing_destinations:
            # Find which existing redirect(s) point to this source
            upstream = [
                r for r in existing_redirects if r["destination"] == src
            ]
            for u in upstream:
                print(
                    f"  CHAIN WARNING: {u['source']} -> {src} (existing) "
                    f"-> {dst} (new). Will create redirect chain."
                )
            chains.append(entry)
            # Still add it -- chains will be fixed in Step 5

        # Check 3: Flag /api-overview specifically (user requested)
        if src == "/api-overview":
            # Check if a wildcard variant exists
            wildcard = "/api-overview/:slug*"
            if wildcard in existing_sources:
                print(
                    f"  NOTE: Adding exact /api-overview redirect. "
                    f"Existing wildcard {wildcard} -> "
                    f"{existing_sources[wildcard]} also present."
                )

        added.append(entry)

    # ── Append new redirects ──────────────────────────────────────────────
    existing_redirects.extend(added)
    data["redirects"] = existing_redirects
    after_count = len(existing_redirects)

    # ── Write back ────────────────────────────────────────────────────────
    print(f"\nWriting {DOCS_JSON} ...")
    with open(DOCS_JSON, "w") as f:
        json.dump(data, f, indent=2)
        f.write("\n")  # trailing newline

    # ── Summary ───────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Redirects before:        {before_count}")
    print(f"  New entries to add:      {len(ORPHAN_REDIRECTS)}")
    print(f"  Duplicates (skipped):    {len(duplicates)}")
    print(f"  Chain warnings:          {len(chains)}")
    print(f"  Actually added:          {len(added)}")
    print(f"  Redirects after:         {after_count}")
    print()

    if duplicates:
        print("Skipped duplicates (source already exists):")
        for d in duplicates:
            print(f"  {d['source']} -> {d['destination']}")
        print()

    if chains:
        print("Chain warnings (source is an existing destination):")
        print("  These will create redirect chains -- fix in Step 5.")
        for c in chains:
            print(f"  {c['source']} -> {c['destination']}")
        print()

    expected_added = 70 - len(duplicates)
    if len(added) == expected_added:
        print(f"OK: Added {len(added)} redirects (70 - {len(duplicates)} duplicates).")
    else:
        print(
            f"WARNING: Expected to add {expected_added} but added {len(added)}."
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
