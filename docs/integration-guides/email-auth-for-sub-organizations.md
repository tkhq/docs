---
sidebar_position: 2
description: Learn about Email Auth on Turnkey
slug: /integration-guides/sub-organization-auth
---

# Sub-Organization Email Auth

Email auth is a powerful feature to couple with [sub-organizations](../getting-started/Sub-Organizations.md) for your users. This approach empowers your users to authenticate their Turnkey in a simple way (via email!), while minimizing your involvement: we engineered this feature to ensure your organization is unable to take over sub-organizations even if it wanted to.

Our [Demo Passkey Wallet](https://wallet.tx.xyz) application serves an example of how email auth functionality might be integrated. We encourage you to try it (and check out the [code](https://github.com/tkhq/demo-passkey-wallet)) before diving into your own implementation.

## Prerequisites

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
  iframeUrl: "https://auth.turnkey.com",
  // Configure how the iframe element is inserted on the page
  iframeContainerId: "your-container",
  iframeElementId: "turnkey-iframe",
});

// Inserts the iframe in the DOM. This creates the new encryption target key
const publicKey = await iframeStamper.init();
```

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
      { baseUrl: "https://api.turnkey.com" },
      iframeStamper
    );

    // Sign and submits the CREATE_WALLET activity
    const response = await client.createWallet({
      type: "ACTIVITY_TYPE_CREATE_WALLET",
      timestampMs: String(Date.now()),
      organizationId: authResponse.organizationId,
      parameters: {
        walletName: "Default Wallet",
        accounts: [
          {
            curve: "CURVE_SECP256K1",
            pathFormat: "PATH_FORMAT_BIP32",
            path: "m/44'/60'/0'/0/0",
            addressFormat: "ADDRESS_FORMAT_ETHEREUM",
          },
        ],
      },
    });
    ```

Congrats! You've succcessfully performed Email Auth! 🥳 If you'd like to explore persisting sessions across tabs/windows, read on below.

### Persistent sessions

#### Security preface

By default, Turnkey's email auth architecture aims to isolate credentials in order to prevent an attacker being able to access credentials and have unfettered access to an organization. This is achieved by the separation of the `iframe credential` and the `Turnkey credential`. Before we dive in further, here are some relevant definitions:

- the `iframe credential` (also referred to as the embedded key) is a P-256 keypair. It is stored in [local storage](https://github.com/tkhq/frames/blob/82ee1cb3797c1c785226a130a7e06f991246877f/auth/index.html#L123-L134).
- the `email auth bundle` is an encrypted payload that Turnkey sends to an end-user via email. By itself, it is meaningless. However, upon *decryption*, this is a Turnkey API keypair that can readily sign Turnkey requests.
- the `Turnkey credential` refers to a keypair that can be used to access Turnkey's API. This credential is safely sent from Turnkey to the iframe via the aforementioned `auth bundle`, which is then decrypted by the `iframe credential`. Once the credential is decrypted, it is stored [in-memory](https://github.com/tkhq/frames/blob/82ee1cb3797c1c785226a130a7e06f991246877f/auth/index.html#L853-L854). This is in order to reduce the risk that a webpage or Chrome extension could read them *both*, at which point an attacker would be able to make authenticated requests to Turnkey.

Because these credentials (`iframe credential` and `Turnkey credential`) are kept separate, this means that an attacker *could not* unilaterally access a decrypted Turnkey credential — they would need access to both the iframe credential *and* the email auth bundle. However, this means that by default, because the Turnkey credential is stored in memory, it is *not* automatically persisted across browser sessions (e.g. tabs).

#### Implementing sessions

Once an end-user shares their encrypted email auth bundle (either by copying/pasting the OTP itself, or by navigating to a magic link containing it), you can store it in the browser's local storage. Upon interactions like a page refresh, in order to "regain" an existing session, you would then insert the iframe into the DOM, retrieve the email auth bundle from local storage, and inject the bundle (i.e. `await iframeStamper.injectCredentialBundle(bundle)`). The result: the email auth bundle is now decrypted, and the iframe now has a Turnkey API key. At this point, the iframe can be used to authenticate requests to Turnkey.

Echoing the security preface above, there are security implications with this approach: because the `iframe credential` and `email auth bundle` would now be stored in local storage, an attacker with access to both would be able to decrypt a `Turnkey credential` and use it to access funds. Note that this vector is only open while the email auth credential is valid: by default, this duration is 15 minutes, but can be configured as detailed in the [email customization](#email-customization) section below.

## Integration notes

### Email customization

We offer customization for the following:

- `appName`: the name of the application. This will be used in the email's subject, e.g. `Sign in to ${appName}`
- `logoUrl`: a link to a PNG with a max width of 340px and max height of 124px
- `magicLinkTemplate`: a template for the URL to be used in the magic link button, e.g. `https://dapp.xyz/%s`. The auth bundle will be interpolated into the `%s`

```js
// Sign and submits the EMAIL_AUTH activity
const response = await client.emailAuth({
  type: "ACTIVITY_TYPE_EMAIL_AUTH",
  timestampMs: String(Date.now()),
  organizationId: <sub-organization-id>,
  parameters: {
    email: <user-email>,
    targetPublicKey: <iframe-public-key>,
    apiKeyName: <optional-api-key-name>,
    expirationSeconds: <optional-api-key-expiration-in-seconds>,
    emailCustomization: {
      appName: <optional-your-app-name>,
      logoUrl: <optional-your-logo-png>,
      magicLinkTemplate: <optional-magic-link>
    }
  },
});
```

### Bespoke email templates

We also support custom HTML email templates for [Enterprise](https://www.turnkey.com/pricing) clients. This allows you to inject arbitrary data from a JSON string containing key-value pairs. In this case, the `emailCustomization` variable may look like:

```js
...
emailCustomization: {
  templateId: <HTML-template-stored-in-turnkey>,
  templateVariables: "{\"username\": \"alice and bob\"}"
}
...
```

In this specific example, the value `alice and bob` can be interpolated into the email template using the key `username`. The use of such template variables is purely optional.

Here's an example of a custom HTML email containing an email auth bundle:

<p style={{ textAlign: "center" }}>
  <img src="/img/email-auth-example-dynamic.png" alt="dynamic" style={{ width: 540 }} />  
</p>

If you are interested in implementing bespoke, fully-customized email templates, please reach out to <hello@turnkey.com>.

### Credential validity checks

By default, if a Turnkey request is signed with an expired credential, the API will return a 401 error. If you'd like to validate whether or not an injected credential is still valid, you can specifically use the `whoami` endpoint:

```js
const whoamiResponse = await client.getWhoami({
  organizationId,
});
```

A valid response indicates the credential is still live; otherwise, an error including `unable to authenticate: api key expired` will be thrown.
