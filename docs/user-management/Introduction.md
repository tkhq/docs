---
sidebar_position: 1
---
# Introduction

Overview of the different types of users within Turnkey and their capabilities

Turnkey Users are resources within an Organization. Their attributes are:

- UUID: a globally unique ID (e.g. `fc6372d1-723d-4f7e-8554-dc3a212e4aec`), used as a unique identifier for a User in the context of Policies or User Tags, or Quorums.
- Name and email
- Access type: whether a user has access to Turnkey via our dashboard (`ACCESS_TYPE_WEB`), API (`ACCESS_TYPE_API`) or both (`ACCESS_TYPE_ALL`)
- Authenticators: a list of authenticators (see below for information)
- API key: a list of API keys (see below for information)
- User tags: a list of User Tag UUIDs

A **user belongs to one organization**, and one organization can have many (**up to 500**) users. If you need to create more users, consider using Sub-Organizations.

## User Credentials

Credentials represent ways for Users to authenticate to Turnkey. All Turnkey Credentials are held by you, the end-user. Turnkey only keeps **public keys**. At the moment, Turnkey supports 2 types of Credentials:

- Authenticators
- API Keys

### Authenticators

Turnkey uses [Webauthn](https://www.w3.org/TR/webauthn-2/) for authentication into its dashboard (no passwords!). Authenticators on Turnkey represent a Webauthn device registered on Turnkey.

When logging into Turnkey, you'll be prompted for a signature with a registered device. This signature is then verified to grant dashboard access. To avoid repeated signatures, Turnkey's dashboard uses session cookies for read traffic. However, all write actions require an authenticator signature.

### API Keys

Turnkey API requests are authenticated with API key signature. When you generate an API key (either through our CLI or through our dashboard), you generate a P-256 key pair. Turnkey keeps the public key, and you hold the private key.

SDK requests or requests made with our CLI use the private API key to sign requests. Turnkey's public API expects all requests (to get data or to submit activities) to be signed.

## Access Type

An API user can only authenticate with API keys, a web-only user can only authenticate with Authenticators, and a web+api user can authenticate with either. There's currently no restrictions on the number of authenticators or API keys attached to a user.
