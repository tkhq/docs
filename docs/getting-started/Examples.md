---
sidebar_position: 3
description: Check out some of our example apps and use cases
slug: /getting-started/examples
---
# Examples

Turnkey infrastructure is flexible by default. We intentionally prioritize low-level primitives in our product to avoid creating blockers for developers that want to build new kinds of applications on Turnkey.

That said, we have built out several example services and applications to help illustrate the types of functionality that Turnkey can enable.

Clone the Turnkey sdk repo [here](https://github.com/tkhq/sdk) to explore a few “turnkey” examples:

| Example                                                                | Description                                                                                                        |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| [`with-ethers`](https://github.com/tkhq/sdk/tree/main/examples/with-ethers/)                                | Create a new Ethereum address, then sign and broadcast a transaction using the Ethers signer with Infura           |
| [`with-cosmjs`](https://github.com/tkhq/sdk/tree/main/examples/with-cosmjs/)                                | Create a new Cosmos address, then sign and broadcast a transaction on Celestia testnet using the CosmJS signer     |
| [`with-solana`](https://github.com/tkhq/sdk/tree/main/examples/with-solana/)                                | Create a new Solana address, then sign and broadcast a transaction on Solana's devnet                              |
| [`with-gnosis`](https://github.com/tkhq/sdk/tree/main/examples/with-gnosis/)                                | Create new Ethereum addresses, configure a 3/3 Gnosis safe, and create + execute a transaction from it             |
| [`with-uniswap`](https://github.com/tkhq/sdk/tree/main/examples/with-uniswap/)                              | Sign and broadcast a Uniswap v3 trade using the Ethers signer with Infura                                          |
| [`with-nonce-manager`](https://github.com/tkhq/sdk/tree/main/examples/with-nonce-manager/)                  | Create a new Ethereum address, then sign and broadcast multiple transactions in a sequential or optimistic manner. |
| [`sweeper`](https://github.com/tkhq/sdk/tree/main/examples/sweeper/)                                        | Sweep funds from one address to a different address                                                                |
| [`deployer`](https://github.com/tkhq/sdk/tree/main/examples/deployer/)                                      | Compile and deploy a smart contract                                                                                |
| [`with-offline`](https://github.com/tkhq/sdk/tree/main/examples/with-offline/)                              | Sign a Turnkey request in offline context                                                                          |
| [`demo-consumer-wallet`](https://github.com/tkhq/demo-consumer-wallet) | A minimal consumer wallet app powered by Turnkey and WalletConnect                                                 |
| [`with-federated-passkeys`](https://github.com/tkhq/sdk/tree/main/examples/with-federated-passkeys/)        | A nextjs app that demonstrates how to use Turnkey to build a federated, webauthn powered authentication flow       |
