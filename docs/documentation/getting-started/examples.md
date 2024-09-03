---
sidebar_position: 3
description: Check out some of our example apps and use cases
slug: /getting-started/examples
---

# Examples

Turnkey infrastructure is flexible by default. We intentionally prioritize low-level primitives in our product to avoid creating blockers for developers building new kinds of applications on Turnkey.

That said, we have built out several example services and applications to help illustrate the types of functionality that Turnkey can enable.

## Code Examples

| Example                                                                                              | Description                                                                                                                 |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [`demo-consumer-wallet`](https://github.com/tkhq/demo-consumer-wallet)                               | A minimal consumer wallet app powered by Turnkey and WalletConnect                                                          |
| [`demo-passkey-wallet`](https://github.com/tkhq/demo-passkey-wallet)                                 | A minimal consumer wallet app powered by Turnkey and passkeys                                                               |
| [`demo-ethers-passkeys`](https://github.com/tkhq/demo-ethers-passkeys)                               | A NextJS app that demonstrates how to use `@turnkey/ethers` to build a passkey-powered application                          |
| [`demo-viem-passkeys`](https://github.com/tkhq/demo-viem-passkeys)                                   | A NextJS app that demonstrates how to use `@turnkey/viem` to build a passkey-powered application                            |
| [`passkeyapp`](https://github.com/tkhq/passkeyapp)                                                   | A React Native + Expo app powered by Turnkey and passkeys                                                                   |
| [`deployer`](https://github.com/tkhq/sdk/tree/main/examples/deployer/)                               | Compile and deploy a smart contract                                                                                         |
| [`email-recovery`](https://github.com/tkhq/sdk/tree/main/examples/email-recovery/)                   | A NextJS app that demonstrates how to use `@turnkey/iframe-stamper` to perform email recovery                               |
| [`rebalancer`](https://github.com/tkhq/sdk/tree/main/examples/rebalancer/)                           | A demo application which showcases an example of how to use Turnkey for managing multiple types of keys & users             |
| [`sweeper`](https://github.com/tkhq/sdk/tree/main/examples/sweeper/)                                 | Sweep funds from one address to a different address                                                                         |
| [`trading-runner`](https://github.com/tkhq/sdk/tree/main/examples/trading-runner/)                   | A sample application demonstrating a trading operation, using various private keys, users, and policies, powered by Uniswap |
| [`wallet-export`](https://github.com/tkhq/sdk/tree/main/examples/wallet-export/)                     | A NextJS app that demonstrates how to use `@turnkey/iframe-stamper` to export a wallet as a mnemonic                        |
| [`with-bitcoin`](https://github.com/tkhq/sdk/tree/main/examples/with-bitcoin)                        | Construct, sign, and broadcast a Bitcoin transaction using Turnkey                                                          |
| [`with-ethers`](https://github.com/tkhq/sdk/tree/main/examples/with-ethers/)                         | Create a new Ethereum address, then sign and broadcast a transaction using the Ethers signer with Infura                    |
| [`with-viem`](https://github.com/tkhq/sdk/tree/main/examples/with-viem/)                             | Sign and broadcast a transaction using the Turnkey Custom Account and Infura                                                |
| [`with-cosmjs`](https://github.com/tkhq/sdk/tree/main/examples/with-cosmjs/)                         | Create a new Cosmos address, then sign and broadcast a transaction on Celestia testnet using the CosmJS signer              |
| [`with-eip-1193-provider`](https://github.com/tkhq/sdk/tree/main/examples/with-eip-1193-provider/)   | Example using a Turnkey-compatible Ethereum provider that adheres to the EIP-1193 standards                                 |
| [`with-solana`](https://github.com/tkhq/sdk/tree/main/examples/with-solana/)                         | Create a new Solana address, then sign and broadcast a transaction on Solana’s devnet. Also includes SPL token creation + transfer, and Jupiter swaps |
| [`with-gnosis`](https://github.com/tkhq/sdk/tree/main/examples/with-gnosis/)                         | Create new Ethereum addresses, configure a 3/3 Gnosis safe, and create + execute a transaction from it                      |
| [`with-uniswap`](https://github.com/tkhq/sdk/tree/main/examples/with-uniswap/)                       | Sign and broadcast a Uniswap v3 trade using the Ethers signer with Infura                                                   |
| [`with-nonce-manager`](https://github.com/tkhq/sdk/tree/main/examples/with-nonce-manager/)           | Create a new Ethereum address, then sign and broadcast multiple transactions in a sequential or optimistic manner           |
| [`with-offline`](https://github.com/tkhq/sdk/tree/main/examples/with-offline/)                       | Sign a Turnkey request in offline context                                                                                   |
| [`with-federated-passkeys`](https://github.com/tkhq/sdk/tree/main/examples/with-federated-passkeys/) | A NextJS app that demonstrates how to use Turnkey to build a federated, webauthn powered authentication flow                |

## Demos built with Turnkey

### Demo Consumer Wallet ([code](https://github.com/tkhq/demo-consumer-wallet))

A minimal consumer wallet app powered by Turnkey. Behind the scenes, it uses [`@turnkey/ethers`](https://www.npmjs.com/package/@turnkey/ethers) for signing and WalletConnect (v1) for accessing dapps.

<p style={{ textAlign: "center" }}>
  <video controls width="800px">
    <source src="https://github.com/tkhq/demo-consumer-wallet/assets/127255904/2c3409df-2d7c-4ec3-9aa8-e2944a0b0e0a"/>
  </video>
</p>

See https://github.com/tkhq/demo-consumer-wallet for the code.

### Demo Passkey Wallet ([code](https://github.com/tkhq/demo-passkey-wallet), [live link](https://wallet.tx.xyz))

A wallet application showing how users can register and authenticate using passkeys.
This demo uses the Turnkey API to create a new [Turnkey Sub-Organization](/concepts/sub-organizations) for each user, create a testnet Ethereum address and send a transaction on Sepolia (ETH testnet).

<p style={{ textAlign: "center" }}>
  <img
    src="/demo-passkey-wallet.png"
    alt="demo passkey wallet screenshot"
    style={{ width: 800 }}
  />
</p>

See https://wallet.tx.xyz (and https://github.com/tkhq/demo-passkey-wallet for the code).

### Demo Ethers Passkeys ([code](https://github.com/tkhq/demo-ethers-passkeys))

A simple application demonstrating how to create sub-organizations, create private keys, and sign with the [`@turnkey/ethers`](https://github.com/tkhq/sdk/tree/main/packages/ethers) signer, using passkeys.

<p style={{ textAlign: "center" }}>
  <img
    src="/ethers-ui-screenshot.png"
    alt="ethers ui screenshot"
    style={{ width: 800 }}
  />
</p>

See https://github.com/tkhq/demo-ethers-passkeys for the code.

### Demo Viem Passkeys ([code](https://github.com/tkhq/demo-viem-passkeys))

A similar, simple application demonstrating how to create sub-organizations, create private keys, and sign with the [`@turnkey/viem`](https://github.com/tkhq/sdk/tree/main/packages/viem) signer, using passkeys.

<p style={{ textAlign: "center" }}>
  <img
    src="/viem-ui-screenshot.png"
    alt="viem ui screenshot"
    style={{ width: 800 }}
  />
</p>

See https://github.com/tkhq/demo-viem-passkeys for the code.

### React Native Passkey App ([code](https://github.com/tkhq/passkeyapp))

A simple React Native app that demonstrates sign up and sign in with passkeys, as well as Email Auth support.

<p style={{ textAlign: "center" }}>
  <video controls width="800px">
    <source src="https://github.com/r-n-o/passkeyapp/assets/104520680/9fabf71c-d88a-4631-8bfa-14b55c72967b"/>
  </video>
</p>

See https://github.com/tkhq/passkeyapp for the code.
