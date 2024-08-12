---
sidebar_position: 4
description: Learn about Oauth on Turnkey
slug: /features/oauth
---

# OAuth

OAuth is a feature to authenticate users using OpenID Connect ([OIDC](https://openid.net/specs/openid-connect-core-1_0.html)) tokens. It is only available for sub-organization users.

Similar to [email auth](./email-auth.md) and [email recovery](./email-recovery.md), OAuth authenticates users who do not wish to handle API keys or [passkeys](./passkeys/) directly. This makes it a great fit for onboarding users who have existing web2-style accounts (e.g. Google, Facebook) but do not know anything about cryptographic keys and credentials.

## Roles and responsibilities

* **Turnkey**: runs verifiable infrastructure to create credentials and verify OIDC tokens
* **Parent**: that's you! **For the rest of this guide we'll assume you, the reader, are a Turnkey customer**. We assume that you have
  * an existing Turnkey organization (we'll refer to this organization as "the parent organization")
  * a web application frontend (we'll refer to this as just "app" or "web app")
  * a backend able to sign and POST Turnkey activities ("backend" or "parent backend")
* **End-User**: the end-user is a user of your web app. They have an account with Google.
* **OIDC Provider**: a provider able to authenticate your End-Users and provide OIDC tokens as proof. We'll use [Google](https://developers.google.com/identity/openid-connect/openid-connect) as an example.

## OAuth step-by-step

### Registration (signup)

<p>
    <img
        src="/img/oauth_signup.png"
        alt="OAuth signup flow"
    />
</p>

1. **End-User** enters the signup flow on the app, gets redirected to Google for authentication.
1. Upon completion, the **Parent**'s backend receives the OIDC token authenticating **End-User**.
1. This token is used inside of a `CREATE_SUB_ORGANIZATION` activity to register Google as the Oauth provider under the root user.
1. **Turnkey** verifies the OIDC token and creates a new sub-organization.

The user is now registered: a sub-organization under the parent organization has been created with a a root user, authenticated via an OAuth Provider. Concretely:
   * `issuer` is set to `https://accounts.google.com`
   * `audience` is set to `<google-oauth-app-id>` (your Oauth app ID)
   * `subject` is set `<google-end-user-id>` (the user ID of `End-User` on Google's side)

### Authentication (login)

<p>
    <img
        src="/img/oauth_login.png"
        alt="OAuth login flow"
    />
</p>

1. **End-User** enters the login flow on the app, gets redirected to Google for authentication.
1. Upon completion, `Parent backend` receives the OIDC token authenticating **End-User**.
1. This token is used inside of an `OAUTH` activity, signed by the **Parent**'s backend.
1. **Turnkey** verifies the OIDC token and encrypts an expiring API key credential to **End-User**.
1. **End-User** decrypts the credential.

The user is now authenticated and able to perform Turnkey activities.

## OIDC token verification

All OIDC tokens are verified inside of Turnkey's [secure enclaves](/security/secure-enclaves).

We've designed a new secure enclave to fetch TLS content securely and bring [non-repudiation](https://en.wikipedia.org/wiki/Non-repudiation#In_digital_security) on top of TLS content: our TLS fetcher returns a URL and the fetched content, signed by the TLS fetcher's quorum key. By trusting the TLS fetcher quorum key, other Turnkey enclaves can bring TLS-fetched data into their computation safely. Verifying OIDC token is the first computation which requires this!

To verify an OIDC token, other Turnkey enclaves receive the OIDC token as well as:
* the signed content of the issuer's OpenId configuration. OpenId configuration **must** be hosted under `/.well-known/openid-configuration` for each domain. For Google for example, the issuer configuration is at [`accounts.google.com/.well-known/openid-configuration`](https://accounts.google.com/.well-known/openid-configuration). This JSON document contains, among other thing, a `jwksUri` key. The value for this key is a URL hosting the list of currently-valid OIDC token signers.
* the signed content of the issuer's `jwksUri` (e.g., for Google, the `jwksUri` is [`googleapis.com/oauth2/v3/cert`](https://www.googleapis.com/oauth2/v3/certs)). This is a list of public keys against which the secure enclave can verify tokens. Note: **these public keys rotate periodically** (every ~6hrs), hence it's not possible to hardcode these public keys in our secure enclave code directly. We have to fetch them dynamically!

With all of that, an enclave can independently verify an OIDC token without making outbound requests. Once the token is parsed and considered authentic, our enclaves match the `iss`, `aud` and `sub` attributes against the registered OAuth providers on the Turnkey sub-organization. We also check `exp` to make sure the OIDC token is not expired, and the `nonce` attribute (see next section).

## Nonce restrictions in OIDC tokens

Our [`OAUTH`](/api#tag/Users/operation/Oauth) activity requires 2 parameters minimum:
* `oidcToken`: the base64 OIDC token
* `targetPublicKey`: the client-side public key generated by the user

In order to prevent OIDC tokens from being used against multiple public keys, our enclaves parse the OIDC token and, as part of the validation logic, enforce that the `nonce` claim is set to `sha256(targetPublicKey)`.

For example, if the iframe public key is `04bb76f9a8aaafbb0722fa184f66642ae425e2a032bde8ffa0479ff5a93157b204c7848701cf246d81fd58f6c4c47a437d9f81e6a183042f2f1aa2f6aa28e4ab65`, our enclaves expect the OIDC token nonce to be `1f9570d976946c0cb72f0e853eea0fb648b5e9e9a2266d25f971817e187c9b18`.

## OAuth vs. OIDC

[OAuth2.0](https://datatracker.ietf.org/doc/html/rfc6749) is a separate protocol from ([OIDC](https://openid.net/specs/openid-connect-core-1_0.html)), with distinct goals:
* "OAuth2.0" is an authorization framework
* "OIDC" is an authentication framework

We chose to name this feature "OAuth" because of the term familiarity: most Turnkey customers will have to setup an "OAuth" app with Google, and the user experience is often referred to as "OAuth" regardless of the protocol underneath.

From dev to dev: if want some kind of saving grace, think about Turnkey's OAuth as an abbreviation for "OIDC Auth".
