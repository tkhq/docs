---
title: Overview
sidebar_position: 1
slug: /
---

<img src="/img/diagrams/welcome_image.png" alt="welcome" />

### Welcome to the Turnkey docs!

Start here for a quick primer on our high-level product structure to orient you to the rest of the documentation. If you’d rather jump straight into the quickstart, head [here](./getting-started/Quickstart.md). Or, join our Slack group [here](https://join.slack.com/t/clubturnkey/shared_invite/zt-2837d2isy-gbH60kJ~XnXSSFHiqVOrqw) to get support with your integration, share product feedback, and connect with other crypto builders.

### About Turnkey

Turnkey is crypto private key infrastructure that lets developers securely generate private keys and sign transactions via simple APIs.

### How it works

At a structural level, a Turnkey Organization is comprised of a few core resources:

- <b>Users:</b> Humans or machines with access to an Organization
- <b>Policies:</b> Rules defining which users can take which actions within an Organization
- <b>Private Keys:</b> Crypto private keys, used to derive addresses and sign transactions
- <b>Wallets:</b> A collection of crypto private keys that share a common seed
- <b>Credentials:</b> Used to verify Users - WebAuthn authenticators for human Users and API keys for API Users

<p style={{textAlign: 'center'}}>
  <img
    src="/img/diagrams/resources.png"
    alt="resources"
    style={{ width: 500 }}
  />
</p>

Turnkey enables two main types of actions via our REST API:

- Change or retrieve Organization data
- Sign transactions and raw payloads with crypto private keys

There is no predefined relationship between any of the resources in your Turnkey Organization. Rather, your Policies determine which users can take which actions, under which conditions.

For example, an automated API request to sign a transaction will first be run against all of your Policies to ensure that API user has permission to sign that particular transaction with the specified Private Key. Turnkey’s signer will complete the request only if the Policy Engine approves the transaction.

All secure workloads, including key management and transaction signing, are managed by Turnkey within our secure infrastructure. These Private Keys can only be used via your Turnkey credentials and no private key material is ever exposed, to Turnkey or to your team.

### Where to head next

[Quickstart guide](./getting-started/Quickstart.md): Walk through setup of the Turnkey API and Platform, create a crypto Private Key, and sign your first transaction via command line.

[Examples](./getting-started/Examples.md): Turnkey’s flexible infrastructure means there’s a lot you can build. Check out a few of our own examples to get a picture of what’s possible.

[Security architecture](./Security/our-approach.md): Turnkey’s unique security architecture is the foundation of our product. Dive in to understand how we secure your keys.
