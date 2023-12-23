---
sidebar_position: 8
description: Learn about Email Auth on Turnkey
slug: /getting-started/email-auth
---

# Email Auth

Email Auth enables a user to authenticate their Turnkey account via email. In this process, the user is granted an expiring API key that is held in local storage. This expiring API key can be used by the user to access their wallet, similar to a session key. An example utilizing Email Auth for an organization can be found in our SDK repo [here](https://github.com/tkhq/sdk/tree/main/examples/email-auth).

#### Mechanism

In short, Email Auth is built on top of the expiring API keys primitive: email is simply the mechanism through which the API key credential is safely delivered. Once the credential is live on the client side (within the context of an iframe), it is readily available to stamp (authenticate) requests. See the [cryptographic details](#cryptographic-details) section for more info.

## User Experience

Email auth starts with a new activity posted to Turnkey. This activity has the type `ACTIVITY_TYPE_EMAIL_AUTH` and takes the following as parameters:

- `email`: the email of the user who would like to authenticate. This email must be the email already attached to the user in organization data (i.e., previously approved by the user). This prevents malicious account takeover. If you try to pass a different email address, the activity will fail.
- `targetPublicKey`: the public key to which the auth credential is encrypted (more on this later)
- `apiKeyName`: an optional name for the API Key. If none is provided, we will default to `Email Auth - <Timestamp>`
- `expirationSeconds`: an optional window (in seconds) indicating how long the API Key should last. Default to 15 minutes.
- `emailCustomization`: optional parameters for customizing emails. If not provided, use defaults. This is currently a WIP. 🚧

This activity generates a new API key pair (an "auth credential"), saves the public key in organization data under the target user, and sends an email with the encrypted auth credential:

<p style={{ textAlign: "center" }}>
    <img
        src="/img/auth_email.png"
        alt="auth email"
        style={{ width: 420 }}
    />
</p>

Calling email auth requires proper permissions via policies or being a parent organization. See [Authorization](#authorization) for more details.

## Authorization

Authorization for email auth is based on our usual activity authorization: our [policy engine](../policy-management/Policy-overview.md) controls who can and cannot execute auth-related activities.

- `ACTIVITY_TYPE_EMAIL_AUTH` can be performed by the root user or by any user in an organization if authorized by policy, but **only if the feature is enabled**. The activity can target **any user** in this organization **or any sub-organization user**. The activity will fail if a parent user tries to perform email auth for a sub-organization which has [opted out of this feature](#opting-out-of-email-auth).

<p style={{textAlign: 'center'}}>
    <img src="/img/diagrams/email_auth_authorization.png" width="500" height="200"/>
</p>

## Email auth in your sub-organizations

Email auth works well with [sub-organizations](./Sub-Organizations.md).

<!-- TODO: Our Demo Passkey Wallet application (https://wallet.tx.xyz) has auth functionality integrated. We encourage you to try it (and look at [the code](https://github.com/tkhq/demo-passkey-wallet) if you're curious!). -->

If you're looking for a more concrete guide, head to our [Sub-Organization Email Auth implementation guide](../integration-guides/email-auth-for-sub-organizations.md) for more details.

## Email auth in your organization

If you want to use email auth in the context of an organization accessed via our dashboard, first, you must ensure that the organization feature (`FEATURE_NAME_EMAIL_AUTH`) is enabled. Additionally, the user attempting to initiate email auth must have appropriate permissions (via root user status, or via policy).

## Opting out of email auth

Similar to email recovery, depending on your threat model, it may be unacceptable to rely on email as an authentication factor. We envision this to be the case when an organization has a mature set of root users with multiple authenticators, or when a sub-organization "graduates" from one to many redundant passkeys or API keys. When you're ready, you can disable email auth with `ACTIVITY_TYPE_REMOVE_ORGANIZATION_FEATURE` (see Remove [Organization Feature](/api#tag/Features/operation/RemoveOrganizationFeature)). The feature name to remove is `FEATURE_NAME_EMAIL_AUTH`.

If you _never_ want to have email auth enabled for sub-organizations, our `CREATE_SUB_ORGANIZATION` activity takes a `disableEmailAuth` boolean in its parameters. Set it to `true` and the sub-organization will be created without the organization feature.

## Mechanism and cryptographic details

Note: if the following section looks familiar, it is! It shares the same cryptographic innerworkings as Email Recovery.

Unlike typical email auth functionality, Turnkey's email auth doesn't send unencrypted tokens via emails. This ensures no man-in-the-middle attack can happen: even if the content of the auth email is leaked, an attacker wouldn't be able to decrypt the auth credential. The following diagram summarizes the flow:

<img src="/img/email_auth_cryptography.png" />

Our email auth flow works by anchoring auth in a **target encryption key** (TEK). This target encryption key is a standard P-256 key pair and can be created in many ways: completely offline, or online inside of script using the web crypto APIs.

The public part of this key pair is passed as a parameter inside of a signed `EMAIL_AUTH` activity. The signature on the activity has to come from a user who is [authorized](#authorization) to initiate email auth.

Our enclave creates a fresh P256 key pair ("auth credential") and encrypts the private key to the recovering user's TEK using the **Hybrid Public Key Encryption standard**, also known as **HPKE** or [RFC 9180](https://datatracker.ietf.org/doc/rfc9180/).

Once the encrypted auth credential is received via email, it's decrypted where the target public key was originally created. The auth credential is then ready to be used to sign an activity, which is then submitted to Turnkey.

## Implementation notes

Users currently have a limit of 10 long-lived API keys, and 10 expiring API keys. In the case that the limit of expiring API keys is breached, the oldest (by creation date) will be discarded.

NOTE: feature must be enabled. For top-level orgs, by default, Email Auth is not enabled. It must be enabled via the `ACTIVITY_TYPE_SET_ORGANIZATION_FEATURE` activity. Here's an example, using our CLI:

```
turnkey request --host api.turnkey.com --path /public/v1/submit/set_organization_feature --body '{
        "timestampMs": "'"$(date +%s)"'000",
        "type": "ACTIVITY_TYPE_SET_ORGANIZATION_FEATURE",
        "organizationId": "<YOUR-ORG-ID>",
        "parameters": {
                "name": "FEATURE_NAME_EMAIL_AUTH"
        }
}' --organization <YOUR-ORG-ID>
```

Suborgs have Email Auth enabled as a feature by default. It can be conveniently disabled during creation, using the `CreateSubOrganizationIntentV4` activity parameter `disableEmailAuth`.
