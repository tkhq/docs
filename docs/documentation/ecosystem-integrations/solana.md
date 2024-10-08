---
sidebar_position: 20
title: Solana (SVM)
slug: /ecosystems/solana
---

## Address derivation

Turnkey supports Solana address derivation with `ADDRESS_TYPE_SOLANA`. Solana addresses are a simple encoding of the ed25519 public key.

## Transaction construction and signing

To construct and sign a Solana transaction we offer a `@turnkey/solana` NPM package. It offers a `TurnkeySigner` which integrates our remote signer with the official Solana [`web3js`](https://solana-labs.github.io/solana-web3.js/) library.

## Transaction parsing, policies, and signing

Turnkey has built a Solana parser which runs in a secure enclave, to parse unsigned transactions and extract metadata. Solana transactions are a list of instructions. We offer details about program keys, accounts, signers, and more. See the `SolanaTransaction` struct in our [policy langugage](../concepts/policy-management/Policy-language.md) page for a full list.

As a bonus, Turnkey also takes care of combining the signature with the original payload if you use the `SIGN_TRANSACTION` activity types: the input is the unsigned payload, and the output is the signed Solana transaction, ready to be broadcast onchain.

## Import and export formats

Turnkey offers wallet or private key imports and export functionality. To be compatible with the Solana ecosystem, we support imports in mnemonics form (for wallet seeds, this is most common) or in base58 format (for single private key import or export).

## Wallet signer

Did you know? Turnkey activities can be signed with an API key, a passkey...or a Solana wallet if you use our [`@turnkey/wallet-stamper`](https://www.npmjs.com/package/@turnkey/wallet-stamper) package!

## Examples and demos

You can find an example of Solana transaction construction and broadcasting using `@turnkey/with-solana` in [`examples/with-solana`](https://github.com/tkhq/sdk/tree/main/examples/with-solana).

If you want to see [`@turnkey/wallet-stamper`](https://www.npmjs.com/package/@turnkey/wallet-stamper) in action, head to [`examples/with-wallet-stamper`](https://github.com/tkhq/sdk/tree/main/examples/with-wallet-stamper).
