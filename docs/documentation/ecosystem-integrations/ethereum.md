---
sidebar_position: 10
title: Ethereum (EVM)
slug: /ecosystems/ethereum
---

# Integration with the Ethereum (EVM) ecosystem

## Address derivation

Turnkey supports EVM address derivation with `ADDRESS_TYPE_ETHEREUM`. This address format is valid across all EVM chains and L2s.

## Transaction construction and signing

To construct and sign an EVM transaction with Turnkey, we offer:
* [`@turnkey/viem`](https://npmjs.com/package/@turnkey/viem): contains a `createAccount` method to create a Turnkey-powered [custom account](https://viem.sh/docs/accounts/local) which [Viem](https://viem.sh/) can use seamlessly.
* [`@turnkey/ethers`](https://npmjs.com/package/@turnkey/ethers): contains a `TurnkeySigner` which implements Ethers' `AbstractSigner` interface. See [Ethers docs](https://docs.ethers.org/v6/api/providers/abstract-signer/#AbstractSigner).

## Transaction parsing, policies, and signing

Turnkey has built an EVM parser which runs in a secure enclave, to parse unsigned EVM transactions and extract useful metadata: transaction source, destination, amount, chain ID, and more. See the `EthereumTransaction` struct in our [policy langugage](../concepts/policy-management/Policy-language.md) page for a full list.

As a bonus, Turnkey also takes care of combining the signature with the original payload if you use the `SIGN_TRANSACTION` activity types: the input is the unsigned payload (RLP encoded), and the output is the signed RLP encoded transaction, ready to be broadcast!

## Account abstraction

Turnkey is built to be flexible: a lot of our customers use Turnkey as a smart contract signer, alongside other types of signers.

This is so common that AA wallet providers have integrated Turnkey as a default solution in their documentation. Refer to our [AA Wallet](../../solutions/embedded-wallets/account-abstraction.md) documentation for further information.

## EIP-1193 provider

We've published an experimental [`@turnkey/eip-1193-provider`](https://www.npmjs.com/package/@turnkey/eip-1193-provider) package, which adheres to the [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) standard. It's built to integrate seamlessly with a broad spectrum of EVM-compatible chains, offering capabilities like account management, transaction signing, and blockchain interaction.

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



