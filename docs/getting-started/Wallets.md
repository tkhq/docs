---
sidebar_position: 6
description: Learn about Wallets on Turnkey
slug: /getting-started/wallets
---
# Wallets

A hierarchical deterministic (HD) Wallet is a collection of cryptographic private/public key pairs that share a common seed. Wallets offer several advantages over raw private keys:
- They can be used across various cryptographic curves
- They can generate millions of addresses for various digital assets
- They can be represented by a checksummed, mnemonic phrase making them easier to backup and recover

```json
{
   "walletId": "eb98ae4c-07eb-4117-9b2d-8a453c0e1e64",
   "walletName": "default"
}
```

## Accounts

An account contains the directions for deriving a cryptographic key pair and correspoding address from a Wallet. In practice, this looks like:
- The Wallet seed and Account curve are used to create a root key pair
- The Account path format and path are used to derive an extended key pair from the root key pair
- The Account address format is used to derive the address from the extended public key

```json
{
   "address": "0x7aAE6F67798D1Ea0b8bFB5b64231B2f12049DB5e",
   "addressFormat": "ADDRESS_FORMAT_ETHEREUM",
   "curve": "CURVE_SECP256K1",
   "path": "m/44'/60'/0'/0/0",
   "pathFormat": "PATH_FORMAT_BIP32",
   "walletId": "eb98ae4c-07eb-4117-9b2d-8a453c0e1e64"
}
```

The account address is used to sign with the underlying extended private key.

#### Configuration

Certain address formats can only be used with particular curves. See the table below:

| Type           | Address Format               | Curve           | Path Format       | Path              |
| -------------- | ---------------------------- | --------------- | ----------------- | ----------------- |
| **Public Key** | ADDRESS_FORMAT_COMPRESSED    | all             | PATH_FORMAT_BIP32 |                   |
|                | ADDRESS_FORMAT_UNCOMPRESSED  | CURVE_SECP256K1 | PATH_FORMAT_BIP32 |                   |
| **Ethereum**   | ADDRESS_FORMAT_ETHEREUM      | CURVE_SECP256K1 | PATH_FORMAT_BIP32 | m/44'/60'/0'/0/0  |
| **Cosmos**     | ADDRESS_FORMAT_COSMOS        | CURVE_SECP256K1 | PATH_FORMAT_BIP32 | m/44'/118'/0'/0/0 |
| **Solana**     | ADDRESS_FORMAT_SOLANA        | CURVE_ED25519   | PATH_FORMAT_BIP32 | m/44'/501'/0'/0'  |

#### What if I don't see the address format for my network?
You can use `ADDRESS_FORMAT_COMPRESSED` to generate a public key which can be used to sign with.

#### What if I don't see the curve for my network?
Contact us!

