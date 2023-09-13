---
sidebar_position: 3
description: Check out some of our example apps and use cases
slug: /getting-started/examples
---
# Examples

Turnkey infrastructure is flexible by default. We intentionally prioritize low-level primitives in our product to avoid creating blockers for developers building new kinds of applications on Turnkey.

That said, we have built out several example services and applications to help illustrate the types of functionality that Turnkey can enable.

## SDK code examples

Clone the Turnkey SDK repo [here](https://github.com/tkhq/sdk) to explore a few “turnkey” examples:

| Example                                                                                                | Description                                                                                                                 |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| [`with-ethers`](https://github.com/tkhq/sdk/tree/main/examples/with-ethers/)                           | Create a new Ethereum address, then sign and broadcast a transaction using the Ethers signer with Infura                    |
| [`with-viem`](https://github.com/tkhq/sdk/tree/main/examples/with-viem/)                               | Sign and broadcast a transaction using the Turnkey Custom Account and Infura                                                |
| [`with-ethers-and-passkeys`](https://github.com/tkhq/sdk/tree/main/examples/with-ethers-and-passkeys/) | A NextJS app that demonstrates how to use `@turnkey/ethers` to build a passkey-powered application                          |
| [`with-viem-and-passkeys`](https://github.com/tkhq/sdk/tree/main/examples/with-viem-and-passkeys/)     | A NextJS app that demonstrates how to use `@turnkey/viem` to build a passkey-powered application                            |
| [`with-cosmjs`](https://github.com/tkhq/sdk/tree/main/examples/with-cosmjs/)                           | Create a new Cosmos address, then sign and broadcast a transaction on Celestia testnet using the CosmJS signer              |
| [`with-solana`](https://github.com/tkhq/sdk/tree/main/examples/with-solana/)                           | Create a new Solana address, then sign and broadcast a transaction on Solana's devnet                                       |
| [`with-gnosis`](https://github.com/tkhq/sdk/tree/main/examples/with-gnosis/)                           | Create new Ethereum addresses, configure a 3/3 Gnosis safe, and create + execute a transaction from it                      |
| [`with-uniswap`](https://github.com/tkhq/sdk/tree/main/examples/with-uniswap/)                         | Sign and broadcast a Uniswap v3 trade using the Ethers signer with Infura                                                   |
| [`with-nonce-manager`](https://github.com/tkhq/sdk/tree/main/examples/with-nonce-manager/)             | Create a new Ethereum address, then sign and broadcast multiple transactions in a sequential or optimistic manner           |
| [`with-offline`](https://github.com/tkhq/sdk/tree/main/examples/with-offline/)                         | Sign a Turnkey request in offline context                                                                                   |
| [`with-federated-passkeys`](https://github.com/tkhq/sdk/tree/main/examples/with-federated-passkeys/)   | A NextJS app that demonstrates how to use Turnkey to build a federated, webauthn powered authentication flow                |
| [`sweeper`](https://github.com/tkhq/sdk/tree/main/examples/sweeper/)                                   | Sweep funds from one address to a different address                                                                         |
| [`deployer`](https://github.com/tkhq/sdk/tree/main/examples/deployer/)                                 | Compile and deploy a smart contract                                                                                         |
| [`rebalancer`](https://github.com/tkhq/sdk/tree/main/examples/rebalancer)                              | A demo application which showcases an example of how to use Turnkey for managing multiple types of keys & users             |
| [`trading-runner`](https://github.com/tkhq/sdk/tree/main/examples/trading-runner)                      | A sample application demonstrating a trading operation, using various private keys, users, and policies, powered by Uniswap |

## Demos built with Turnkey

### Demo Consumer Wallet ([code](https://github.com/tkhq/demo-consumer-wallet))

A minimal consumer wallet app powered by Turnkey. Behind the scenes, it uses [`@turnkey/ethers`](https://www.npmjs.com/package/@turnkey/ethers) for signing and WalletConnect (v1) for accessing dapps.

<video controls width="800px">
  <source src="https://github.com/tkhq/demo-consumer-wallet/assets/127255904/2c3409df-2d7c-4ec3-9aa8-e2944a0b0e0a"/>
</video>


See https://github.com/tkhq/demo-consumer-wallet for the code.

### Demo Passkey Wallet ([code](https://github.com/tkhq/demo-passkey-wallet), [live link](https://wallet.tx.xyz))

A wallet application showing how users can register and authenticate using passkeys.
This demo uses the Turnkey API to create a new [Turnkey Sub-Organization](/getting-started/sub-organizations) for each user, create a testnet Ethereum address and send a transaction on Sepolia (ETH testnet).

<img src="/demo-passkey-wallet.png" alt="homepage screenshot" width="800px"/>
