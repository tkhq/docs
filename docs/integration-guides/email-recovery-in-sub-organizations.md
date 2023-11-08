---
sidebar_position: 2
description: Learn about Email Recovery on Turnkey
slug: /integration-guides/sub-organization-recovery
---
# Sub-Organization Recovery

Email recovery shines if you are leveraging [sub-organizations](../getting-started/Sub-Organizations.md) for each of your users. This allows your users to recover their Turnkey account if something goes wrong with their passkeys, and keeps you out of the loop: we engineered this feature to ensure your organization is unable to take over sub-organizations even if it wanted to.

Our Demo Passkey Wallet application (https://wallet.tx.xyz) has recovery functionality integrated. We encourage you to try it (and look at [the code](https://github.com/tkhq/demo-passkey-wallet)) before diving into your own implementation.

## Pre-requisites

Make sure you have set up your primary Turnkey organization with at least one API user that can programmatically initiate email recovery. Check out our [Quickstart guide](../getting-started/Quickstart.md) if you need help getting started. To allow an API user to initiate email recovery, you'll need the following policy in your main organization:
```json JSON
{ 
    "effect": "EFFECT_ALLOW",
    "consensus": "approvers.any(user, user.id == '<YOUR_API_USER_ID>')",
    "condition": "activity.resource == 'RECOVERY' && activity.action == 'CREATE'"
}
```

## Helper packages

* We have released open-source code to abstract recovery credential decryption and signing with an iframe elements hosted on `recovery.turnkey.com` (see the code [here](https://github.com/tkhq/frames)). This ensures the recovery credentials are encrypted to keys that your organization doesn't have access to (because they live in the iframe, on a separate domain)
* We have also built a package to help you insert this iframe and interact with it in the context of email recovery: [`@turnkey/iframe-stamper`](https://www.npmjs.com/package/@turnkey/iframe-stamper)

In the rest of this guide we'll assume you are using these helpers.

## Email Recovery step-by-step

Here's a diagram summarizing the email recovery flow step-by-step ([direct link](/img/email_recovery_steps.png)):

<img src="/img/email_recovery_steps.png" />

Let's review these steps in detail:

1. User on `yoursite.xyz` clicks "recovery", and a new recovery UI is shown. While the widget is in a loading state your frontend uses [`@turnkey/iframe-stamper`](https://www.npmjs.com/package/@turnkey/iframe-stamper) to insert a new iframe element:
    ```js
    const iframeStamper = new IframeStamper({
        iframeUrl: "https://recovery.turnkey.com",
        // Configure how the iframe element is inserted on the page
        iframeContainerId: "your-container",
        iframeElementId: "turnkey-iframe",
    });

    // Inserts the iframe in the DOM. This creates the new encryption target key
    const publicKey = await iframeStamper.init();
    ```
2. Your code receives the iframe public key and shows the recovery form, and the user enters their email address.
3. Your app can now create and sign a new `INIT_USER_EMAIL_RECOVERY` activity with the user email and the iframe public key in the parameters. Note: you'll need to retrieve the sub-organization ID based on the user email.
4. Email is received by the user.
5. User copies and pastes their recovery code into your app. Remember: this code is an encrypted credential which can only be decrypted within the iframe.
6. Your app injects the recovery code into the iframe for decryption:
    ```js
    await iframeStamper.injectRecoveryBundle(code);
    ```
7. Your app prompts the user to create a new passkey (using our SDK functionality):
    ```js
    // Creates a new passkey
    let attestation = await getWebAuthnAttestation(...params...)
    ```
8. Your app uses [`@turnkey/iframe-stamper`](https://www.npmjs.com/package/@turnkey/iframe-stamper) to sign a new `RECOVER_USER` activity:
    ```js
    // New client instantiated with our iframe stamper
    const client = new TurnkeyClient(
        { baseUrl: "https://api.turnkey.com" },
        iframeStamper,
    );

    // Sign and submits the RECOVER_USER activity
    const response = await client.recoverUser({
        type: "ACTIVITY_TYPE_RECOVER_USER",
        timestampMs: String(Date.now()),
        organizationId: initRecoveryResponse.organizationId,
        parameters: {
            userId: initRecoveryResponse.userId,
            authenticator: {
            authenticatorName: data.authenticatorName,
            challenge: base64UrlEncode(challenge),
            attestation: attestation,
            },
        },
    });
    ```

Once the `RECOVER_USER` activity is successfully posted, the recovery is complete! If this activity succeeds, your frontend can redirect to login/sign-in or perform crypto signing with the new passkey.
