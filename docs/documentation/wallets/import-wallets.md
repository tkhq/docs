---
sidebar_position: 4
description: Learn about Wallet and Key Import on Turnkey
slug: /wallets/import-wallets
---

# Import Wallets and Keys

Turnkey's import functionality allows your end users to securely transfer a [Wallet](/concepts/Wallets) or a [Private Key](/concepts/Wallets#private-keys) onto the Turnkey platform via CLI or an embedded iframe. We engineered this feature to ensure that the user can import their mnemonic or private key into a Turnkey secure enclave without exposing it to Turnkey or your application.

The process of importing wallets or private keys into Turnkey is broken up into three primary steps:

1. Initialize the import process. This produces an import bundle, containing a public key and signature. These artifacts will be used in the next step to ensure that key material is only accessible by Turnkey, and cannot be extracted by any man-in-the-middle (MITM)
2. Encrypt the key material to the artifacts from the previous step
3. Import the encrypted bundle to Turnkey

See the [Enclave to end-user secure channel](../security/enclave-secure-channels.md) for more technical details.

# Implementation Guides

See [Code Examples](../../../embedded-wallets/code-examples/import) for more details.
