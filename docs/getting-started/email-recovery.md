---
sidebar_position: 7
description: Learn about Email Recovery on Turnkey
slug: /getting-started/email-recovery
---
# Email Recovery

Email Recovery lets a user gain access to their Turnkey account via email, in cases where they've lost access to their API keys and authenticators.

## User Experience
This functionality is split in two phases: [Initiation](#initiation) and [Finalization](#finalization)

### Initiation

Email recovery starts with a new activity posted to Turnkey. This activity has the type `ACTIVITY_TYPE_INIT_USER_EMAIL_RECOVERY` and takes the following as parameters:
* `email`: the email of the user who needs to start recovery. This email has to be the email in organization data. If you try to pass a different email address, the activity will fail.
* `targetPublicKey`: the public key to which the recovery credential is encrypted (more on this later)

This activity generates a new temporary API key pair (a "recovery credential"), saves the public key in organization data under the target user, and sends an email with the recovery credential, encrypted:

<img src="/img/recovery_email.png" width="420" />

Initiating a new email recovery requires proper permissions. It can't be done by anyone. See [Authorization](#authorization) for more details.

### Finalization

Once a user receives a recovery email, recovery credential _decryption_ needs to happen, and the credential can be used to sign a new activity: `ACTIVITY_TYPE_RECOVER_USER`. This activity accepts a new authenticator in its parameters, and adds this new authenticator to the user. After processing, the user is able to log in using their newly registered authenticator.

This activity must be signed by the recovery credential.

## Authorization

Authorization for email recovery is based on our usual activity authorization: our [policy engine](../policy-management/Policy-overview.md) controls who can and cannot execute recovery-related activities.
* `ACTIVITY_TYPE_INIT_USER_EMAIL_RECOVERY` can be performed by the root user or by any user in an organization if authorized by policy. The activity can target any user in this organization **or any sub-organization user**. The activity will fail if a parent user tries to initiate recovery for a sub-organization which has [opted out of email recovery](#opting-out-of-email-recovery)
* `ACTIVITY_TYPE_RECOVER_USER` should be signed by the recovery credential sent via email. Even if not explicitly allowed by policy, a user is always able to add credentials to their own user. This includes adding a new authenticator when authenticated with a recovery credential. In other words, no special policy is needed to make this work: your users are able to recover out-of-the-box.

Important note: recovery credentials automatically expire after **30 minutes** and are overridden when multiple initiation activities are processed. The newest recovery credential wins.

## Email recovery in your sub-organizations

Email recovery works well with [sub-organization](./Sub-Organizations.md). Our Demo Passkey Wallet application (https://wallet.tx.xyz) has recovery functionality integrated. We encourage you to try it (and look at [the code](https://github.com/tkhq/demo-passkey-wallet) if you're curious!).

If you're looking for a more concrete implementation guide, head to [Sub-Organization Recovery](../integration-guides/email-recovery-in-sub-organizations.md) for more details.

## Email recovery in your organization

If you want to use email recovery in the context of an organization accessed via our dashboard, we aren't ready yet. This is because we do not have a flow to enroll new passkeys and sign `RECOVER_USER` activities in our main dashboard.

A workaround if you're a root user trying to perform recovery for one of your users: delete their user and re-invite them by email. It's not perfect because their new user ID will differ from their old one (which means policies might need an update).

If you're a root user and you have lost access to your authenticators, **Turnkey cannot perform email recovery for you**. You need to create a fresh organization.

## Opting out of email recovery

Depending on your threat model it may be unacceptable to rely on email as an authentication factor. We envision this to be the case when an organization has a mature set of root users with multiple authenticators, or when a sub-organization "graduates" from one to many redundant passkeys or API keys. When you're ready, you can disable email recovery with `ACTIVITY_TYPE_REMOVE_ORGANIZATION_FEATURE` (see Remove [Organization Feature](/api#tag/Features/operation/RemoveOrganizationFeature)). The feature name to remove is `FEATURE_NAME_ROOT_USER_EMAIL_RECOVERY`.

## Cryptographic details

Unlike typical email recovery functionality, Turnkey's email recovery doesn't send unencrypted tokens via emails. This ensures no man-in-the-middle attack can happen: even if the content of the recovery email is leaked, the user organization is safe because an attacker wouldn't be able to decrypt the recovery credential. The following diagram summarizes the flow:

<img src="/img/email_recovery_cryptography.png" />

Our email recovery flow works by anchoring recovery in a **target encryption key** (TEK). This target encryption key is a standard P-256 key pair and can be created in many ways: completely offline, or online inside of script using the web crypto APIs.

The public part of this key pair is passed as a parameter inside of a signed `INIT_USER_EMAIL_RECOVERY` activity. The signature on the activity has to come from a user who is authorized to initiate email recovery.

Our enclave creates a fresh P256 key pair ("recovery credential") and encrypts the private key to the recovering user's TEK using the **Hybrid Public Key Encryption standard**, also known as **HPKE** or [RFC 9180](https://datatracker.ietf.org/doc/rfc9180/).

Once the encrypted recovery credential is received via email, it's decrypted where the target public key was originally created. The recovery credential is then ready to be used to sign a `RECOVER_USER` activity, submitted to Turnkey.
