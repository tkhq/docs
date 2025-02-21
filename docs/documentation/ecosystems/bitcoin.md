---
sidebar_position: 30
title: Bitcoin
description: "Bitcoin support on Turnkey"
slug: /ecosystems/bitcoin
---

# Bitcoin support on Turnkey

## BIP32 and BIP44: the basis for Turnkey wallets

[BIP32](https://en.bitcoin.it/wiki/BIP_0032) and [BIP44](https://en.bitcoin.it/wiki/BIP_0044) are standards developed in the Bitcoin ecosystem. Turnkey closely follows this to power [Wallets](../concepts/Wallets.md) since they're adopted within Bitcoin and outside, spanning many other ecosystems.

## BIP39: mnemonics

Turnkey supports importing and exporting keys in mnemonics form, following [BIP39](https://en.bitcoin.it/wiki/BIP_0039). This standard is now a de-facto standard across virtually all blockchains today.

## Address derivation

You can derive Bitcoin addresses when creating a Turnkey wallet or private key. The address types we support currently:

- P2PKH (Pay-To-Public-Key-Hash)
- P2SH (Pay-To-Script-Hash)
- P2WPKH (Pay-to-Witness-Public-Key-Hash) -- [segwit-enabled](https://learnmeabitcoin.com/technical/upgrades/segregated-witness/)
- P2WSH (Pay-to-Witness-Script-Hash) -- [segwit-enabled](https://learnmeabitcoin.com/technical/upgrades/segregated-witness/)
- P2TR (Pay-to-Taproot) -- [taproot-enabled](https://cointelegraph.com/learn/a-beginners-guide-to-the-bitcoin-taproot-upgrade)

Bitcoin addresses change depending on the network you're using (more precisely, their prefix!). When you derive an address the network will be part of the address format. We support the following networks:

- Mainnet (`MAINNET`)
- Testnet (`TESTNET`)
- Regtest (`REGTEST`)
- Signet (`SIGNET`)

For example:

- To derive a P2TR address on testnet, use `ADDRESS_FORMAT_BITCOIN_TESTNET_P2TR`.
- To derive a P2SH address on mainnet, use `ADDRESS_FORMAT_BITCOIN_MAINNET_P2SH`.

## Schnorr signatures and tweaks

The historical signature scheme for Bitcoin is [ECDSA](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm). Turnkey supports ECDSA of course, but we also support [Schnorr signatures](https://en.wikipedia.org/wiki/Schnorr_signature) for Taproot addresses.

To sign with Schnorr, pass a taproot (P2TR) address inside of your activity's `signWith` parameter. Turnkey's signer will switch to Schnorr and apply the correct cryptographic [tweak](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki#constructing-and-spending-taproot-outputs) before signing.

## SDK example

If you want to get started with Bitcoin we encourage you to look at the following SDK example: [`examples/with-bitcoin`](https://github.com/tkhq/sdk/tree/main/examples/with-bitcoin). It showcases transaction construction and signing with [`bitcoinjs-lib`](https://github.com/bitcoinjs/bitcoinjs-lib), a widely used JS library.

This demo contains a client-side [signer](https://github.com/tkhq/sdk/blob/main/examples/with-bitcoin/src/signer.ts) which seamlessly integrates Turnkey signing with this library for both taproot and non-taproot output signatures. Let us know if you're interested in using it. We have not yet published it as a standalone NPM package, but could do it if we hear enough interest!
