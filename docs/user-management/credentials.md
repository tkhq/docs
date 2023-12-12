---
sidebar_position: 2
description: Learn about user credentials and authentication on Turnkey
slug: /users/credentials
---

# Credentials

Credentials represent ways for Users to authenticate to Turnkey. All Turnkey Credentials are held by you, the end-user. Turnkey only keeps **public keys**. At the moment, Turnkey supports 2 types of Credentials:

- Authenticators
- API Keys

### Authenticators

Turnkey uses [Webauthn](https://www.w3.org/TR/webauthn-2/) for authentication into its dashboard (no passwords!). Authenticators on Turnkey represent a Webauthn device registered on Turnkey.

When logging into Turnkey, you'll be prompted for a signature with a registered device. This signature is then verified to grant dashboard access. To avoid repeated signatures, Turnkey's dashboard uses session cookies for read traffic. However, all write actions require an authenticator signature.

### API Keys

Turnkey API requests are authenticated with API key signatures. When you generate an API key (either through our CLI or through our dashboard), you generate a P-256 key pair. Turnkey keeps the public key, and you hold the private key.

Requests made via SDK or CLI use the private API key to sign requests. Turnkey's public API expects all requests (e.g. to get data or to submit activities) to be signed.

See our [API reference](./api#tag/API-Keys/operation/CreateApiKeys) for how to programmatically create API keys.

#### Session keys

Turnkey session keys are built atop API keys, with one key difference: they have an expiration date. This date can be specified using the `expirationSeconds` parameter within a `CREATE_API_KEYS` request. Session keys are an effective way for an application to authenticate requests on behalf of a user for a specific duration.
