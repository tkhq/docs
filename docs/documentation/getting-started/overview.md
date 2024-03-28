---
title: Overview
sidebar_position: 1
slug: /
---

<img src="/img/diagrams/welcome_image.png" alt="welcome" />


### About Turnkey

Turnkey is flexible, scalable, and secure wallet infrastructure. Create thousands of embedded wallets, eliminate manual transaction flows, and automate onchain actions - all without compromising on security. 

<div class="overview-buttons">
  <a href="/getting-started/quickstart" class="overview-button">
    <img src="/img/icons/rocket-line.png" class="button-icon"/>
    <div class="button-text">
      <div class="button-header">Quickstart Guide</div>
      <div class="button-description">Get started with Turnkey</div>
    </div>
  </a>
  <a href="/api" class="overview-button">
    <img src="/img/icons/braces-fill.png" class="button-icon"/>
    <div class="button-text">
      <div class="button-header">API Reference</div>
      <div class="button-description">Explore Turnkey's API</div>
    </div>
  </a>
  <a href="https://join.slack.com/t/clubturnkey/shared_invite/zt-2837d2isy-gbH60kJ~XnXSSFHiqVOrqw" class="overview-button">
    <img src="/img/icons/chat-quote-line.png" class="button-icon"/>
    <div class="button-text">
      <div class="button-header">Slack community</div>
      <div class="button-description">Join Turnkey's Slack group</div>
    </div>
  </a>
</div>

### Jump to product guides 

You can keep reading for a broad understanding of Turnkey's infrastructure, or jump to a product guide below to get a sense for how you can use Turnkey in your product: 

<div class="overview-buttons">
  <a href="/getting-started/quickstart" class="overview-button">
    <img src="/img/icons/wallet-line.png" class="button-icon"/>
    <div class="button-text">
      <div class="button-header">Wallets for your users</div>
      <div class="button-description">Embed non-custodial user wallets directly in your product</div>
    </div>
  </a>
  <a href="/api" class="overview-button">
    <img src="/img/icons/settings-3-line.png" class="button-icon"/>
    <div class="button-text">
      <div class="button-header">Signing automation</div>
      <div class="button-description">Securely automate any signing workflow</div>
    </div>
  </a>
</div>

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
