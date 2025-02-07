---
sidebar_position: 100
description: Learn about Email Recovery on Turnkey
slug: /features/email-recovery
---

# Email Recovery (legacy)

:::info

Email Recovery is a legacy flow, now superseded by [Email Auth](./email-auth.md), which can used to implement recovery flows and more.

:::

Email Recovery lets a user gain access to their Turnkey account via email in case they've lost access to their API keys and authenticators.

## User Experience

This functionality is split in two phases: [Initiation](#initiation) and [Finalization](#finalization)

### Initiation

Email recovery starts with a new activity posted to Turnkey. This activity has the type `ACTIVITY_TYPE_INIT_USER_EMAIL_RECOVERY` and takes the following as parameters:

- `email`: the email of the user who needs to start recovery. This email must be the email already attached to the user in organization data (i.e., previously approved by the user). This prevents malicious account takeover. If you try to pass a different email address, the activity will fail.
- `targetPublicKey`: the public key to which the recovery credential is encrypted (more on this later)

This activity generates a new temporary API key pair (a "recovery credential"), saves the public key in organization data under the target user, and sends an email with the encrypted recovery credential:

<p style={{ textAlign: "center" }}>
    <img
        src="/img/recovery_email.png"
        alt="recovery email"
        style={{ width: 420 }}
    />
</p>

Initiating a new email recovery require proper permissions via policies or being a parent organization. See [Authorization](#authorization) for more details.

### Finalization

Once a user receives a recovery email, recovery credential _decryption_ needs to happen, and the credential can be used to sign a new activity: `ACTIVITY_TYPE_RECOVER_USER`. This activity accepts a new authenticator in its parameters, and adds this new authenticator to the user. Once this activity completes the user is able to log in using their newly registered authenticator.

## Authorization

Authorization for email recovery is based on our usual activity authorization: our [policy engine](/concepts/policies/overview) controls who can and cannot execute recovery-related activities.

- `ACTIVITY_TYPE_INIT_USER_EMAIL_RECOVERY` can be performed by the root user or by any user in an organization if authorized by policy, but **only if the feature is enabled**. The activity can target **any user** in this organization **or any sub-organization user**. The activity will fail if a parent user tries to initiate recovery for a sub-organization which has [opted out of email recovery](#opting-out-of-email-recovery).
- `ACTIVITY_TYPE_RECOVER_USER` should be signed by the recovery credential sent via email. Even if not explicitly allowed by policy, a user is always able to add credentials to their own user. This includes adding a new authenticator when authenticated with a recovery credential. In other words, no special policy is needed to make this work: users are able to recover out-of-the-box.

<p style={{textAlign: 'center'}}>
    <img
        src="/img/diagrams/email_recovery_authorization.png"
        alt="email recovery authorization"
        style={{ width: 500 }}
    />
</p>

Important note: recovery credentials automatically expire after **15 minutes** and are overridden when multiple `INIT_USER_EMAIL_RECOVERY` activities target the same user. Only the most recent recovery credential is valid.

## Email recovery in your sub-organizations

Email recovery works well with [sub-organizations](/concepts/sub-organizations). A simple example demonstrating email recovery end-to-end can be found [here](https://github.com/tkhq/sdk/tree/main/examples/email-recovery).

If you're looking for a more concrete guide, head to our [Sub-Organization Recovery implementation guide](/embedded-wallets/sub-organization-recovery) for more details.

<!-- TODO: add email recovery in the context of demo embedded wallet, once it's implemented -->

## Email recovery in your organization

If you want to use email recovery in the context of an organization accessed via our dashboard, we aren't ready yet. This is because we do not have a flow to enroll new passkeys and sign `RECOVER_USER` activities in our main dashboard.

A workaround if you're a root user trying to perform recovery for one of your users: delete their user and re-invite them by email. It's not perfect because their new user ID will differ from their old one (which means policies might need an update).

If you're a root user and you have lost access to your authenticators, **Turnkey cannot perform email recovery for you**. You need to create a fresh organization.

## Opting out of email recovery

Depending on your threat model it may be unacceptable to rely on email as an authentication factor. We envision this to be the case when an organization has a mature set of root users with multiple authenticators, or when a sub-organization "graduates" from one to many redundant passkeys or API keys. When you're ready, you can disable email recovery with `ACTIVITY_TYPE_REMOVE_ORGANIZATION_FEATURE` (see Remove [Organization Feature](/api#tag/Features/operation/RemoveOrganizationFeature)). The feature name to remove is `FEATURE_NAME_EMAIL_RECOVERY`.

If you _never_ want to have email recovery enabled, our `CREATE_SUB_ORGANIZATION` activity takes a `disableEmailRecovery` boolean in its parameters. Set it to `true` and the sub-organization will be created without the organization feature.
