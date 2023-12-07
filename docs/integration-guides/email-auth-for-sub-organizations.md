---
sidebar_position: 3
description: Learn about Email Auth on Turnkey
slug: /integration-guides/sub-organization-auth
---

# Sub-Organization Email Auth

Email auth is a powerful feature to couple with [sub-organizations](../getting-started/Sub-Organizations.md) for your users. This approach empowers your users to authenticate their Turnkey in a simple way (via email!), while minimizing your involvement: we engineered this feature to ensure your organization is unable to take over sub-organizations even if it wanted to.

<!-- TODO
Our Demo Passkey Wallet application (https://wallet.tx.xyz) will soon have email auth functionality integrated. We encourage you to try it (and look at [the code](https://github.com/tkhq/demo-passkey-wallet)) before diving into your own implementation. -->

## Pre-requisites

Make sure you have set up your primary Turnkey organization with at least one API user that can programmatically initiate email auth. Check out our [Quickstart guide](../getting-started/Quickstart.md) if you need help getting started. To allow an API user to initiate email auth, you'll need the following policy in your main organization:

```json JSON
{
  "effect": "EFFECT_ALLOW",
  "consensus": "approvers.any(user, user.id == '<YOUR_API_USER_ID>')",
  "condition": "activity.resource == 'AUTH' && activity.action == 'CREATE'"
}
```

## Helper packages

- We have released open-source code to create target encryption keys, decrypt auth credentials, and sign Turnkey activities. We've deployed this a static HTML page hosted on `auth.turnkey.com` meant to be embedded as an iframe element (see the code [here](https://github.com/tkhq/frames)). This ensures the auth credentials are encrypted to keys that your organization doesn't have access to (because they live in the iframe, on a separate domain)
- We have also built a package to help you insert this iframe and interact with it in the context of email auth: [`@turnkey/iframe-stamper`](https://www.npmjs.com/package/@turnkey/iframe-stamper)

In the rest of this guide we'll assume you are using these helpers.

## Email Auth step-by-step

Here's a diagram summarizing the email auth flow step-by-step ([direct link](/img/email_auth_steps.png)):

<img src="/img/email_auth_steps.png" />

Let's review these steps in detail:

1.  User on `yoursite.xyz` clicks "auth", and a new auth UI is shown. We recommend this auth UI be a new hosted page of your site or application, which contains language explaining to the user what steps they will need to take next to successfully authenticate. While the UI is in a loading state your frontend uses [`@turnkey/iframe-stamper`](https://www.npmjs.com/package/@turnkey/iframe-stamper) to insert a new iframe element:

```js
const iframeStamper = new IframeStamper({
  iframeUrl: 'https://auth.turnkey.com',
  // Configure how the iframe element is inserted on the page
  iframeContainerId: 'your-container',
  iframeElementId: 'turnkey-iframe',
});

// Inserts the iframe in the DOM. This creates the new encryption target key
const publicKey = await iframeStamper.init();
```

<!-- TODO: describe customization as well -->

2.  Your code receives the iframe public key and shows the auth form, and the user enters their email address.
3.  Your app can now create and sign a new `EMAIL_AUTH` activity with the user email and the iframe public key in the parameters. Optional arguments include a custom name for the API key, and a specific duration (denoted in seconds) for it. Note: you'll need to retrieve the sub-organization ID based on the user email.
4.  Email is received by the user.
5.  User copies and pastes their auth code into your app. Remember: this code is an encrypted credential which can only be decrypted within the iframe.
6.  Your app injects the auth code into the iframe for decryption:
    ```js
    await iframeStamper.injectCredentialBundle(code);
    ```
7.  At this point, the user is authenticated! Your app should use [`@turnkey/iframe-stamper`](https://www.npmjs.com/package/@turnkey/iframe-stamper) to sign a new activity, e.g. `CREATE_WALLET`:

    ```js
    // New client instantiated with our iframe stamper
    const client = new TurnkeyClient(
      { baseUrl: 'https://api.turnkey.com' },
      iframeStamper
    );

    // Sign and submits the CREATE_WALLET activity
    const response = await client.createWallet({
      type: 'ACTIVITY_TYPE_CREATE_WALLET',
      timestampMs: String(Date.now()),
      organizationId: authResponse.organizationId,
      parameters: {
        walletName: 'Default Wallet',
        accounts: [
          {
            curve: 'CURVE_SECP256K1',
            pathFormat: 'PATH_FORMAT_BIP32',
            path: "m/44'/60'/0'/0/0",
            addressFormat: 'ADDRESS_FORMAT_ETHEREUM',
          },
        ],
      },
    });
    ```

Congrats! You've succcessfully performed Email Auth! 🥳

## Integration notes

Before stamping an activity, if you'd like to validate whether or not an injected credential is still valid, you can use the `whoami` endpoint:

```js
const whoamiResponse = await client.getWhoami({
  organizationId,
});
```

A valid response indicates the credential is still live; otherwise, an error including `unable to authenticate: api key expired` will be thrown.
