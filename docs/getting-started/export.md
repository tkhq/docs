---
sidebar_position: 8
description: Learn about Export on Turnkey
slug: /getting-started/export
---
# Export

Exporting a [Wallet](./wallets.md) or [Private Key](./wallets.md#private-keys) lets a user securely view their wallet as a mnemonic. This can be helpful for backup or transfer purposes.

## Cryptographic details

Turnkey's export functionality ensures that neither your application nor Turnkey can view the wallet mnemonic or private key. The following diagram summarizes the flow:

<img src="/img/wallet_export_cryptography.png" />

Our export flow works by anchoring export in a **target encryption key** (TEK). This target encryption key is a standard P-256 key pair and can be created in many ways: completely offline, or online inside of script using the web crypto APIs.

The public part of this key pair is passed as a parameter inside of a signed `EXPORT_WALLET` or `EXPORT_PRIVATE_KEY` activity.

Our enclave encrypts the wallet's mnemonic or raw private key to the user's TEK using the **Hybrid Public Key Encryption standard**, also known as **HPKE** or [RFC 9180](https://datatracker.ietf.org/doc/rfc9180/).

Once the activity succeeds, the encrypted mnemonic or private key can be decrypted by the target public key offline or in an online script.