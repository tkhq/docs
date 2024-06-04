---
sidebar_position: 5
description: Use Turnkey to power Account Abstraction wallets
slug: /reference/aa-wallets
---

# Account Abstraction Wallets

Turnkey offers flexible infrastructure to create and manage keys. These keys can be used as a signer inside of an [Account Abstraction wallet](https://www.erc4337.io/), and we've partnered with [Alchemy](https://www.alchemy.com/) and [ZeroDev](https://zerodev.app/) to integrate in a few lines of code.

## Alchemy's Account Kit

You can use Turnkey with Alchemy's Account Kit via the [aa-signers](https://accountkit.alchemy.com/packages/aa-signers/turnkey/introduction.html) package to generate embedded wallets, and leverage [aa-alchemy](https://accountkit.alchemy.com/packages/aa-alchemy/index.html) to create smart accounts for your users.

Visit [the Alchemy Account Kit documentation](https://accountkit.alchemy.com/smart-accounts/signers/guides/turnkey.html) for more information.

## ZeroDev Wallets

By combining Turnkey with ZeroDev you can create AA wallets with powerful functionalities such as sponsoring gas, batching transactions, and more.

Visit [the ZeroDev documentation](https://docs-v4.zerodev.app/create-wallets/integrations/turnkey) for more information.

## Biconomy Smart Accounts

Create a Biconomy Smart Account and add a Turnkey signer to manage your private key and authentication methods by using Turnkey's API.

For detailed code snippets and an integration guide, refer to the [Biconomy documentation](https://docs.biconomy.io/Account/signers/turnkey).

## permissionless.js Accounts 

permissionless.js is a TypeScript library built on viem for building with ERC-4337 smart accounts, bundlers, paymasters, and user operations. 

permissionless.js defines the `SmartAccountSigner` interface which supports Turnkey as a signer. You can find a detailed example for integrating a Turnkey signer with permissionless.js in the [Pimlico documentation](https://docs.pimlico.io/permissionless/how-to/signers/turnkey).