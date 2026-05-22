#!/usr/bin/env python3
"""
Step 5: Fix 36 existing redirect destinations in docs.json.

For each redirect entry in docs.json's "redirects" array, if its "source"
matches one of the 36 sources below, update its "destination" to the
corrected value. Does NOT add new entries -- only modifies existing ones.
"""

import json
import sys

DOCS_JSON_PATH = "docs.json"

# ─── The 36 fixes: source → corrected destination ───────────────────────────

FIXES = {
    # Phase 5 table (32)
    "/api-introduction": "/api-reference/overview/intro",
    "/integration-guides/aa-wallets": "/features/wallets/aa-wallets",
    "/getting-started/resource-limits": "/reference/resource-limits",
    "/passkeys/discoverable-vs-non-discoverable": "/features/authentication/passkeys/discoverable-vs-non-discoverable",
    "/passkeys/integration": "/features/authentication/passkeys/integration",
    "/passkeys/introduction": "/features/authentication/passkeys/introduction",
    "/passkeys/native": "/features/authentication/passkeys/native",
    "/passkeys/options": "/features/authentication/passkeys/options",
    "/features/oauth": "/features/authentication/social-logins",
    "/features/email-auth": "/features/authentication/email",
    "/features/email-recovery": "/features/authentication/email",
    "/getting-started/signing-automation-quickstart": "/solutions/company-wallets/quickstart",
    "/signing-automation/overview": "/solutions/company-wallets/overview",
    "/signing-automation/code-examples/smart-contract-management": "/solutions/company-wallets/smart-contract-management",
    "/signing-automation/code-examples/payment-orchestration": "/solutions/company-wallets/payment-orchestration",
    "/users/sessions": "/features/authentication/sessions",
    "/getting-started/email-auth": "/features/authentication/email",
    "/concepts/email-auth": "/features/authentication/email",
    "/concepts/email-recovery": "/features/authentication/email",
    "/integration-guides/export-wallets": "/features/wallets/export-wallets",
    "/integration-guides/import-wallets": "/features/wallets/import-wallets",
    "/integration-guides/webhooks": "/reference/webhooks",
    "/users/:slug*": "/features/users/:slug*",
    "/managing-policies/:slug*": "/features/policies/:slug*",
    "/managing-users/:slug*": "/features/users/:slug*",
    "/api-design/:slug*": "/api-reference/overview/:slug*",
    "/api-overview/:slug*": "/api-reference/overview/:slug*",
    "/ecosystems/:slug*": "/features/networks/:slug*",
    "/ecosystem-integrations/ethereum": "/features/networks/ethereum",
    "/ecosystem-integrations/solana": "/features/networks/solana",
    "/ecosystem-integrations/bitcoin": "/features/networks/bitcoin",
    "/ecosystem-integrations/index": "/features/networks/overview",

    # Newly broken by orphan deletions (4)
    "/integration-guides/sub-organization-auth": "/features/authentication/email",
    "/integration-guides/sub-organization-recovery": "/features/authentication/email",
    "/reference/react-components": "/solutions/embedded-wallets/integration-guide/react/getting-started",
    "/concepts/introduction": "/get-started/about-turnkey",
}

# ─── The 2 OK-as-is redirects to verify are still present and unchanged ─────

OK_AS_IS = {
    "/sdks/react/sdk-reference": "/generated-docs/formatted/react-wallet-kit/client-context-type-add-oauth-provider",
    "/sdks/typescript-frontend/sdk-reference": "/generated-docs/formatted/core/turnkey-client-add-oauth-provider",
}


def main():
    # 1. Read docs.json
    with open(DOCS_JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    redirects = data.get("redirects", [])
    if not redirects:
        print("ERROR: No 'redirects' array found in docs.json.")
        sys.exit(1)

    # Build a lookup: source -> index in redirects list
    source_to_index = {}
    for i, entry in enumerate(redirects):
        source_to_index[entry["source"]] = i

    # 2-4. For each of the 36 fixes, find the matching redirect and update it
    changes_made = 0
    sources_not_found = []

    print("=" * 72)
    print("STEP 5: Fixing 36 existing redirect destinations")
    print("=" * 72)
    print()

    for source, new_dest in FIXES.items():
        if source not in source_to_index:
            sources_not_found.append(source)
            continue

        idx = source_to_index[source]
        old_dest = redirects[idx]["destination"]

        if old_dest == new_dest:
            print(f"  SKIP (already correct): {source}")
            print(f"         destination = {new_dest}")
            print()
            changes_made += 1  # Count as "handled" even if already correct
            continue

        # Update the destination
        redirects[idx]["destination"] = new_dest
        changes_made += 1

        print(f"  FIXED: {source}")
        print(f"    OLD: {old_dest}")
        print(f"    NEW: {new_dest}")
        print()

    # 5. Flag any of the 36 sources not found in docs.json
    if sources_not_found:
        print("-" * 72)
        print(f"WARNING: {len(sources_not_found)} source(s) NOT FOUND in docs.json:")
        for s in sources_not_found:
            print(f"  - {s}")
        print()

    # 6. Verify the 2 OK-as-is redirects are still present and unchanged
    print("-" * 72)
    print("Verifying 2 OK-as-is redirects:")
    print()
    ok_count = 0
    for source, expected_dest in OK_AS_IS.items():
        if source not in source_to_index:
            print(f"  MISSING: {source}")
            print(f"    Expected destination: {expected_dest}")
            print()
        else:
            idx = source_to_index[source]
            actual_dest = redirects[idx]["destination"]
            if actual_dest == expected_dest:
                print(f"  OK: {source}")
                print(f"      destination = {actual_dest}")
                ok_count += 1
            else:
                print(f"  MISMATCH: {source}")
                print(f"    Expected: {expected_dest}")
                print(f"    Actual:   {actual_dest}")
        print()

    # 7. Write back with 2-space indent + trailing newline
    with open(DOCS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

    # 8. Print summary
    print("=" * 72)
    print("SUMMARY")
    print("=" * 72)
    print(f"  Total fixes expected:      36")
    print(f"  Redirects updated/verified: {changes_made}")
    print(f"  Sources not found:          {len(sources_not_found)}")
    print(f"  OK-as-is verified:          {ok_count}/2")
    print(f"  docs.json written:          {DOCS_JSON_PATH}")
    print("=" * 72)

    if sources_not_found:
        print()
        print("NOTE: Some sources were not found. Review the warnings above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
