---
description: Integration guide to use passkeys in your application
slug: /passkeys/integration
sidebar_position: 2
---

# Integrating passkeys

## Passkey flow

A typical passkey flow is composed of 4 main steps, depicted below:

<img src="/img/passkeys/passkey_flow.png" alt="Passkey prompt on Turnkey" width="920px" />

1. Your app frontend triggers a passkey prompt
2. Your end-user uses their device to produce a signature with their passkey, and a signed request is produced
3. The signed request is forwarded to your backend. This step is optional, see ["To Proxy or not to proxy"](#proxying-signed-requests) below for more information.
4. The signed request is processed by Turnkey and its secure enclaves. This where signature verification and actions such as key generation or signing happens

This flow happens once for **registration** and for each subsequent **authentication** or signature request. The main difference is the browser APIs used to trigger the passkey prompt in step (1):
- **Passkey registration** uses `navigator.credentials.create`. This is described in [this guide](https://web.dev/passkey-registration/). This is the API which triggers the creation of a **new** passkey.
- **Passkey authentication** uses `navigator.credentials.get`. See [this guide](https://web.dev/passkey-form-autofill/) for more information. This is the API which triggers a signature prompt for an **existing** passkey.

## Our SDK can help

Our SDK has integrated passkey functionality, and we've built examples to help you get started.

- [`@turnkey/http`](https://www.npmjs.com/package/@turnkey/http) has a helper to trigger passkey registration (`getWebAuthnAttestation`). You can see it in action in our [`with-federated-passkeys`](https://github.com/tkhq/sdk/tree/main/examples/with-federated-passkeys) example: [direct code link](https://github.com/tkhq/sdk/blob/a2bfbf3cbd6040902bbe4c247900ac560be42925/examples/with-federated-passkeys/src/pages/index.tsx#L88)
- [`@turnkey/webauthn-stamper`](https://www.npmjs.com/package/@turnkey/webauthn-stamper) is a passkey-compatible stamper which integrates seamlessly with `TurnkeyClient`:
  ```js
  import { WebauthnStamper } from "@turnkey/webauthn-stamper";
  import { TurnkeyClient, createActivityPoller } from "@turnkey/http";

  const stamper = new WebAuthnStamper({
    rpId: "your.app.xyz",
  });

  // New HTTP client able to sign with passkeys
  const httpClient = new TurnkeyClient(
    { baseUrl: "https://api.turnkey.com" },
    stamper
  );

  // This will produce a signed request that can be POSTed from anywhere.
  // The `signedRequest` has a URL, a POST body, and a "stamp" (HTTP header name and value)
  const signedRequest = await httpClient.stampCreatePrivateKeys(...)

  // alternatively, you can POST directly from your frontend.
  // Our HTTP client will use the webauthn stamper and the configured baseUrl automatically!
  const activityPoller = createActivityPoller({
    client: client,
    requestFn: client.createPrivateKeys,
  });

  // Contains the activity result; no backend proxy needed!
  const completedActivity = await activityPoller({
    type: "ACTIVITY_TYPE_CREATE_PRIVATE_KEYS_V2",
    // (omitting the rest of this for brevity)
  })
  ```
- [`@turnkey/viem`](https://www.npmjs.com/package/@turnkey/viem) is a package wrapping all of the above so that you work directly with Viem without worrying about passkeys. See [this demo](https://github.com/tkhq/sdk/tree/main/examples/with-viem-and-passkeys).

If you find yourself in need of an abstraction or integration that doesn't exist yet, please get in touch by [creating an issue on our SDK repo](https://github.com/tkhq/sdk/issues), starting a discussion in our [community repo](https://github.com/orgs/tkhq/discussions), or contacting us at <hello@turnkey.com>. We're here to make this as easy as possible for you and your team!

Regardless of whether you use one of our abstractions, take a look at [our registration and authentication options guide](/passkeys/options). This will help you choose the right options for your passkey flow.

## Passkey wallets with sub-organizations

If you're wondering how to create independent, non-custodial wallets for your end-users, head to [Sub-Organizations](/getting-started/sub-organizations). In short: you'll be able to pass the registered passkeys as part of a "create sub-organization" activity, making your end-users the sole owners of any resource created within the sub-organization (including private keys). Your organization will only have read permissions.

It's important to note that the initial activity to create a sub-organization has to be authorized by an API key or a user in your main Turnkey organization. Otherwise anyone would be able to create sub-organizations in your organization! Here's an [example](https://github.com/tkhq/sdk/blob/a2bfbf3cbd6040902bbe4c247900ac560be42925/examples/with-federated-passkeys/src/pages/index.tsx#L88-L116) where the initial registration is done, and posted to a NextJS backend. The NextJS backend inserts the attestation and signs the "create sub-organization" activity [here](https://github.com/tkhq/sdk/blob/a2bfbf3cbd6040902bbe4c247900ac560be42925/examples/with-federated-passkeys/src/pages/api/subOrg.ts#L25-L82).


## Proxying signed requests

Turnkey has an open CORS policy for its public API. This means your frontend can choose to POST sign requests straight to `https://api.turnkey.com`. Your frontend can also choose to forward the requests via a backend server (which POSTs the signed request to Turnkey).

How should you decide what to do? Here are some considerations:

- A backend proxy can be useful if you need to inspect and persist activity results. For example: if your users are creating wallets, you might want to persist the addresses. If your users are signing transactions, you might want to broadcast on their behalf.
- Another reason why a backend server could be beneficial is monitoring, feature toggles, and validation: with a proxy you're able to control which requests are proxied and which aren't. You can also perform extra validation to further restrict what your end-users can and cannot do (e.g. prevent users from creating ed25519 keys or policies in their sub-organizations)
- POSTing signed requests directly from your app frontend to Turnkey, on the other hand, saves you the burden of running a proxy server, and takes you out of the loop so that your end-users interact directly with Turnkey. This is a "hands-off" approach that can work well if you want to give your end-users maximum flexibility and ownership over their sub-organization.