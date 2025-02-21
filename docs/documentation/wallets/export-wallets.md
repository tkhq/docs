---
sidebar_position: 5
description: Learn about Wallet and Key Export on Turnkey
slug: /wallets/export-wallets
---

# Export Wallets and Keys

Turnkey's export functionality allows your end users to backup or transfer a [Wallet](/concepts/Wallets) by securely viewing the wallet's [mnemonic phrase](https://learnmeabitcoin.com/technical/mnemonic). We engineered this feature to ensure that the user can export their mnemonic without exposing the mnemonic itself to Turnkey or your application.

The process of exporting wallets or private keys from Turnkey is broken up into two primary steps:

1. Export the wallet or private key via Turnkey. You must specify the wallet or private key ID, as well as a target public key, which the wallet or private key will be encrypted to. Encryption ensures that the key material is only accessible by the client, and cannot be extracted by any man-in-the-middle (MITM)
2. Decrypt the resulting bundle returned by Turnkey

See the [Enclave to end-user secure channel](../security/enclave-secure-channels.md) for more technical details.

# Implementation Guides

See [Code Examples](../../../embedded-wallets/code-examples/export) for more details.
