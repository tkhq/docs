---
sidebar_position: 10
title: Ethereum (EVM)
slug: /ecosystems/ethereum
---

# Integration with the Ethereum (EVM) ecosystem

## Address derivation

Turnkey supports EVM address derivation with `ADDRESS_TYPE_ETHEREUM`. This address format is valid across all EVM chains and L2s.

## Transaction construction and signing

To construct and sign a Solana transaction we offer a `@turnkey/solana` NPM package. It offers a `TurnkeySigner` which integrates our remote signer with the official Solana [`web3js`](https://solana-labs.github.io/solana-web3.js/) library.

## Transaction parsing, policies, and signing

Turnkey has built an EVM parser which runs in a secure enclave, to parse unsigned EVM transactions and extract useful metadata: transaction source, destination, amount, chain ID, and more. See the `EthereumTransaction` struct in our [policy langugage](../concepts/policy-management/Policy-language.md) page for a full list.

As a bonus, Turnkey also takes care of combining the signature with the original payload if you use the `SIGN_TRANSACTION` activity types: the input is the unsigned payload (RLP encoded), and the output is the signed RLP encoded transaction, ready to be broadcast!

## Wallet signer

Did you know? Turnkey activities can be signed with an API key, a passkey...or any Ethereum wallet if you use our [`@turnkey/wallet-stamper`](https://www.npmjs.com/package/@turnkey/wallet-stamper) package!

## Examples and demos

A lot of our demos use EVM chains and capabilities. The most complete demo is our **Demo Embedded wallet**, a fully-functional, hosted wallet which showcases (among other things) send and receive functionality on Sepolia.

Try it out at [wallet.tx.xyz](https://wallet.tx.xyz)!

The code behind this demo is open-source, available at https://github.com/tkhq/demo-embedded-wallet/ 

If you're looking for shorter, more focused examples, here are a few worth checking out:
* [`examples/with-eth-passkeys-galore`](https://github.com/tkhq/sdk/tree/main/examples/with-eth-passkeys-galore): shows both Ethers and Viem integrations.
* [`examples/with-gnosis`](https://github.com/tkhq/sdk/tree/main/examples/with-gnosis): shows how to use Turnkey with [Gnosis (Safe)](https://safe.global/).
* [`examples/with-uniswap`](https://github.com/tkhq/sdk/tree/main/examples/with-uniswap): shows how to use Turnkey with Uniswap, using Ethers.
* [`example/with-eip-1193-provider`](https://github.com/tkhq/sdk/tree/main/examples/with-eip-1193-provider): short example focused on EIP-1193 provider usage.
* [`example/with-wallet-stamper`](https://github.com/tkhq/sdk/tree/main/examples/with-wallet-stamper): see [`@turnkey/wallet-stamper`](https://www.npmjs.com/package/@turnkey/wallet-stamper) in action.



