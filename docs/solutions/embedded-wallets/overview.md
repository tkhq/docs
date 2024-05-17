---
sidebar_position: 1
description: Intro to embedded wallets on Turnkey
slug: /embedded-wallets/overview
sidebar_label: Introduction
---

# Embedded Wallets

## Seamless, secure wallet infrastructure

With embedded wallets on Turnkey, you can create custom wallet experiences that are seamlessly integrated into your product, without compromising on security. Whether you need custodial or non-custodial wallets, our infrastructure provides the foundation for building innovative, user-friendly crypto products.

### Why embedded wallets?

Embedded wallets give you the freedom to design and control the entire user experience, while offloading the complexity and risk of private key management to Turnkey. As one of our customers put it:

> "The ability for us to build our own stack and control the entire user experience without worrying about security has been one of the best things about Turnkey."

With Embedded wallets, you can:

- Create custom wallet flows that match your product's look and feel
- Choose between custodial or non-custodial models based on your use case
- Leverage advanced security and UX features like multi-sig and session keys
- Support various authentication methods, from passkeys to email-based flows
- Focus on building great products, not managing private keys

### How it works

Turnkey's Embedded Wallets are built on top of our [Sub-Organizations](/concepts/sub-organizations) primitive. Each wallet is represented by a sub-organization, which can be configured with different security settings and access controls.

##### Custodial vs non-custodial

- For custodial wallets, your application holds the master key and can initiate transactions on behalf of users.
- For non-custodial wallets, users hold their own private keys and must approve each transaction

##### Advanced features

- Multi-sig: Require multiple approvals for sensitive transactions
- Session Keys: Grant temporary, limited access to wallets for improved UX
- Flexible Authentication: Use passkeys, email auth, or other methods to secure user access

##### Getting started

To start building with embedded wallets, check out our detailed guides and API references:

- [Sub-Organizations as Wallets](/embedded-wallets/sub-organizations-as-wallets)
- [Sub-Organization Email Auth](/embedded-wallets/sub-organization-auth)
- [Sub-Organization Recovery](/embedded-wallets/sub-organization-recovery)
- [Turnkey API Reference](/api)

Or, if you’re looking to create smart wallets for your users, using Turnkey as a user-friendly, recoverable EOA, check out our [guide](/reference/aa-wallets) on integrating Account Abstraction (AA) wallets with Turnkey.
