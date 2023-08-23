---
sidebar_position: 2
description: Learn how Turnkey handles private keys
slug: /security/non-custodial-key-mgmt
---
# Non-custodial key management

## Turnkey's non-custodial infrastructure

Turnkey has built a new model for private key management that utilizes secure enclaves — highly constrained compute environments that can cryptographically attest to the code running inside. All private key material is only decrypted within an enclave, and transaction signing happens according to customer-defined policies. 

This novel security architecture means raw private keys themselves are never exposed to Turnkey, your software, or your team. Specifically, Turnkey stores encrypted private keys that are only decrypted when you authenticate to an auditable, tamper-proof secure enclave with your secret (e.g., API key or Passkey credentials). You (and/or your end users, depending on your implementation) remain the owner of your private keys and the funds controlled by those private keys at all times. See [quorum deployments](/security/quorum-deployments) for more details on how we provision secure enclaves to ensure you’re always in control of your private keys.

Although we’re not a bank, by analogy to physical security, Turnkey’s role is similar to that of a safety deposit box operator. Turnkey secures, and facilitates access to, the safety deposit boxes (wallets), but only the customer can unlock the safety deposit box and access the the contents (digital assets) inside.


## Private key storage

Turnkey does not store unencrypted private keys, but rather persists encrypted private key ciphertext inside of our primary and disaster recovery databases. This ciphertext is only be decrypted from within the bounds of a secure enclave running verified Turnkey applications. Our [security overview](/security/our-approach) goes in-depth with how the process works. 

## Non-custodial wallets for end users

In a wallet-as-a-service implementation model, it is possible for you, as a Turnkey customer, to configure your organization in a way that limits access to your end users’ funds and private keys. When a new end user signs up to your app, you will need to create a separate Turnkey sub-organization, user, and private key for that end user, accessible only by the end user’s secret (e.g., API key or Passkey credentials). With this implementation, only your end user will be able to authorize Turnkey to process a signature request by providing their secret. Use of the private key is limited to the end user via their secret. When a signature request is initiated by the end user’s secret, Turnkey’s functionality is limited to processing the request based on any policy rules that have been set, and returning the signed transaction to you for broadcast on chain.