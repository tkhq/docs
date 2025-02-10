---
sidebar_position: 4
description: Learn about OTP Auth on Turnkey
slug: /features/otp-auth
---

# OTP Auth

OTP (one-time password) Auth enables a user to authenticate their Turnkey account with an email or phone number (SMS currently in beta) via a 6 digit one time password. Similar to email auth, the user is granted an expiring API key that is stored in memory within an iframe. This expiring API key can then be used by the user to access their wallet, similar to a session key. An example utilizing OTP Auth for an organization can be found in our SDK repo [here](https://github.com/tkhq/sdk/tree/main/examples/otp-auth).

#### Mechanism

OTP Auth uses two activities: INIT_OTP_AUTH sends a 6-digit OTP code to a specified phone number or email, and OTP_AUTH to verify the code. Upon successful verification, OTP_AUTH returns the encrypted API key credential in the activity result. This credential is then available for stamping (authenticating) requests on the client side.

## User Experience

OTP Auth starts with a new activity posted to Turnkey. This activity has the type `ACTIVITY_TYPE_INIT_OTP_AUTH` and takes the following as parameters:

- `otpType`: specifiy delivery mechanism `"OTP_TYPE_SMS"` or `"OTP_TYPE_EMAIL"`
- `contact`: the email or phone number of the user who would like to authenticate. This contact must be already attached to the user in organization data (i.e., previously approved by the user). This prevents malicious account takeover. If you try to pass a different email address or phone number, the activity will fail.
- `emailCustomization`: optional parameters for customizing emails. If not provided, the default email will be used. For more info, see the [integration guide](/embedded-wallets/sub-organization-auth#email-customization).
- `userIdentifier`: optional parameter to uniquely identify an end-user, for the purpose of rate limiting SMS OTP requests on a per-user basis. We recommend generating this value serverside based on either the user's IP address or their public key to mitigate the risk of abuse. Turnkey will enforce rate limiting on our end based on this identifier if any value is provided; if this is left blank, no per-user rate limiting will be enforced.

This activity generates a 6 digit OTP, and sends it as an email or SMS

<p style={{ textAlign: "center" }}>
    <img
        src="/img/auth_otp_email.png"
        alt="auth otp email"
        style={{ width: 420 }}
    />
</p>

This activity returns an `otpId` in the result to be used in the following `ACTIVITY_TYPE_OTP_AUTH` to verify the 6 digit code which takes the following as parameters:

- `otpId`: ID representing the result of an `ACTIVITY_TYPE_INIT_OTP_AUTH`
- `otpCode`: 6 digit OTP code sent out to a user's contact (email or SMS)
- `targetPublicKey`: the public key to which the auth credential is encrypted (more on this later)
- `apiKeyName`: an optional name for the API Key. If none is provided, we will default to `OTP Auth - <Timestamp>`
- `expirationSeconds`: an optional window (in seconds) indicating how long the API Key should last. Default to 15 minutes.
- `invalidateExisting`: an optional boolean used to invalidate all other previously generated OTP Auth API keys

Initiating OTP Auth for both `"OTP_TYPE_SMS"` and `"OTP_TYPE_EMAIL"` requires proper permissions via policies or being a parent organization. See [Authorization](#authorization) for more details.

_Note: Non-paying accounts are currently limited to 50 SMS messages per month._

## Authorization

Authorization for OTP auth is based on our usual activity authorization: our [policy engine](/concepts/policies/overview) controls who can and cannot execute auth-related activities.

- `ACTIVITY_TYPE_OTP_AUTH` can be performed by the root user or by any user in an organization if authorized by policy, but **only if the feature is enabled**. The activity can target **any user** in this organization **or any sub-organization user**. The activity will fail if a parent user tries to perform OTP auth for a sub-organization which has [opted out of this feature](#opting-out-of-otp-auth).

<p style={{textAlign: 'center'}}>
    <img src="/img/diagrams/otp_auth_authorization.png" width="500" height="200"/>
</p>

## Opting out of OTP auth

Similar to [Email Auth](./email-auth.md), depending on your threat model, it may be unacceptable to rely on an email or phone number as an authentication factor. We envision this to be the case when an organization has a mature set of root users with multiple authenticators, or when a sub-organization "graduates" from one to many redundant passkeys or API keys. When you're ready, you can disable OTP auth with `ACTIVITY_TYPE_REMOVE_ORGANIZATION_FEATURE` (see Remove [Organization Feature](/api#tag/Features/operation/RemoveOrganizationFeature)). The feature name to remove is `FEATURE_NAME_OTP_EMAIL_AUTH` for OTP email and `FEATURE_NAME_SMS_AUTH` for OTP SMS.

If you _never_ want to have OTP email/SMS auth enabled for sub-organizations, our `CREATE_SUB_ORGANIZATION` activity takes `disableOtpEmailAuth` and `disableSmsAuth` booleans in its parameters. Set them to `true` and the sub-organization will be created without the organization feature.

## Implementation notes

Users currently have a limit of 10 long-lived API keys, and 10 expiring API keys. In the case that the limit of expiring API keys is breached, the oldest (by creation date) will be discarded.

NOTE: feature must be enabled. For top-level orgs, by default, OTP auth is not enabled. It must be enabled via the `ACTIVITY_TYPE_SET_ORGANIZATION_FEATURE` activity. Here's an example for OTP email auth, using our CLI:

```sh
turnkey request --host api.turnkey.com --path /public/v1/submit/set_organization_feature --body '{
        "timestampMs": "'"$(date +%s)"'000",
        "type": "ACTIVITY_TYPE_SET_ORGANIZATION_FEATURE",
        "organizationId": "<YOUR-ORG-ID>",
        "parameters": {
                "name": "FEATURE_NAME_OTP_EMAIL_AUTH"
        }
}' --organization <YOUR-ORG-ID>
```

Suborgs have OTP Auth enabled for both SMS and email as a feature by default. It can be conveniently disabled during creation, using the `CreateSubOrganizationIntentV7` activity parameter `disableOtpEmailAuth` and `disableSmsAuth`.
