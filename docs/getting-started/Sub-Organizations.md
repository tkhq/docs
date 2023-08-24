---
sidebar_position: 4
description: Learn about sub-orgs and how you can use them
slug: /getting-started/sub-organizations
---
# Sub-organizations

Using Turnkey’s flexible infrastructure, you can programmatically create and manage Sub-Organizations for your end users. Sub-Organizations aren't subject to size limits: you can create as many Sub-Organizations as needed. The parent organization has **read-only** visibility into all of its Sub-Organizations, and activities performed in Sub-Organizations roll up to the parent for billing purposes.

We envision Sub-Organizations being very useful to model your End-Users if you're a business using Turnkey for key management. Let's explore how.

## Creating Sub-Organizations 

Creating a new Sub-Organization is an activity in the parent organization. The activity itself takes the following attributes as inputs: 
- organization name
- a list of root users
- a root quorum threshold

Root users in the root users list can be programmatic or human, with one or many credentials attached. Below we explain how you might want to use this primitive as a way to model end-user controlled wallets, or custodial wallets. If you have another use-case in mind, or questions/feedback on this page, reach out to [welcome@turnkey.com](mailto:welcome@turnkey.com)!

## Sub-Organizations as End-User controlled Wallets 

### Overview

Turnkey has built a new model for private key management that utilizes secure enclaves. All transactions are signed within an enclave and private keys are never exposed to Turnkey, your software, or your team. Turnkey’s role is similar to that of a safety deposit box operator — Turnkey secures and provides access to the safety deposit boxes, but our system requires cryptographic proof of ownership to take any action with the keys held within.  

In this example wallet implementation, you will create a segregated sub-organization for each end-user, and leverage [passkeys](https://www.passkeys.io/) as cryptographic proof of ownership to ensure only the end user has the ability to approve signing with their private key.

### Before you start

Make sure you’ve set up your primary Turkey Organization as well as one or more API-only users that will programmatically manage user onboarding within your application. Check out the [quickstart guide](quickstart) if you need help getting started. 

Note also that unlike some wallet providers, Turnkey is not a customer authentication platform. This gives you the flexibility to create the user experience you envision. Typically, developers implement their own standard end-user authentication flows for user login, then employ passkeys behind that login for transaction signing.

### Step 1: End user sub-org creation

After the end user is logged in, your application prompts the user for passkey creation on the application domain. Our JavaScript SDK has a helper for this: `getWebAuthnAttestation`. See [this example](https://github.com/tkhq/sdk/tree/main/examples/with-federated-passkeys).

The application then uses an API-only user to create a new sub-organization on behalf of the end user. Here's what the activity would look like:
```sh
{
  "type": "ACTIVITY_TYPE_CREATE_SUB_ORGANIZATION_V2",
  "timestampMs": "<time-in-ms>",
  "organizationId": "<your-organization-id>",
  "parameters": {
    "subOrganizationName": "<sub-org-name>",
    "rootUsers": [{
      "userName": "<end-user-name>",
      "userEmail": "<email>(optional)",
      "authenticators": [{
        "authenticatorName": "<passkey-name>",
        "challenge": "<webauthn-challenge>",
        "attestation": {
          "credentialId": "<credential-id>",
          "clientDataJson": "<client-data-json>",
          "attestationObject": "<attestation-object>",
          "transports": ["AUTHENTICATOR_TRANSPORT_HYBRID"]
        }
      }],
      "apiKeys": [],
    }],
    "rootQuorumThreshold": 1
  }
}
```
With this setup each end-user now has sole control over their Sub-Organization and any resources created within it. Your application cannot take any actions on resources within the Sub-Organization without explicitly cryptographic authorization from the end user in the form of a passkey signature.

It's important to note that the initial activity to create a sub-organization has to be authorized by an API key or a user in your main Turnkey organization. Otherwise anyone would be able to create sub-organizations in your organization! Here's an [example](https://github.com/tkhq/sdk/blob/a2bfbf3cbd6040902bbe4c247900ac560be42925/examples/with-federated-passkeys/src/pages/index.tsx#L88-L116) where the initial registration is done, and posted to a NextJS backend. The NextJS backend inserts the attestation and signs the "create sub-organization" activity [here](https://github.com/tkhq/sdk/blob/a2bfbf3cbd6040902bbe4c247900ac560be42925/examples/with-federated-passkeys/src/pages/api/subOrg.ts#L25-L82).

#### Step 2: Creating a wallet

A user interface on your application prompts users to sign with their passkey to create a new wallet. This signature is used to produce a signed Turnkey request. Here are the request components:

- URL: `https://api.turnkey.com/api/v1/create_private_keys`
- `X-Stamp-Webauthn` header: set to the WebAuthn stamp collected on the application's frontend (the End-User passkey signature)
- The request body: `CREATE_PRIVATE_KEYS` activity request.

We've abstracted getting WebAuthn signatures and creating signed Turnkey requests behind typed methods (e.g. `stampCreatePrivateKeys`).

Our `TurnkeyClient` (in (from [`@turnkey/http`](https://www.npmjs.com/package/@turnkey/http))) can be initialized with a `WebauthnStamper` (from [`@turnkey/webauthn-stamper`](https://www.npmjs.com/package/@turnkey/webauthn-stamper)):

```js
import { WebauthnStamper } from "@turnkey/webauthn-stamper";
import { TurnkeyClient } from "@turnkey/http";

const stamper = new WebAuthnStamper({
  rpId: "your-domain.com",
});

// New HTTP client able to sign with passkeys!
const httpClient = new TurnkeyClient(
  { baseUrl: "https://api.turnkey.com" },
  stamper
);

const signedRequest = await httpClient.stampCreatePrivateKeys({
  type: "ACTIVITY_TYPE_CREATE_PRIVATE_KEYS_V2",
  organizationId: "<user sub-organization>",
  timestampMs: String(Date.now()),
  parameters: {
    privateKeys: [
      {
        privateKeyName: "<name>",
        curve: "CURVE_SECP256K1",
        addressFormats: ["ADDRESS_FORMAT_ETHEREUM"],
        privateKeyTags: [],
      },
    ],
  },
});
```

The `signedRequest` contains all the components needed to forward it to turnkey: URL, body, and a stamp header (with name and value properties).

You can choose to send this request straight from your frontend, or proxy it through your backend server. If you want to send from the frontend, you can use `httpClient.createPrivateKeys` instead.

#### Step 3: Transaction signing

Similar to creating a wallet, the end-user must provide a signature over each "Sign Transaction" activity with their passkey. A user action, for example clicking "Withdraw Rewards", might trigger the flow. The details of this transaction are presented to the user for confirmation, followed by a request for their passkey to sign the Turnkey request. The signed request is then proxied and POSTed to Turnkey.

Turnkey returns a signed transaction which your application can broadcast using any provider you'd like.

## Sub-Organizations as custodial Wallets 

Most of the steps outlined in the previous section remain unchanged: application creating custodial wallets should still create segregated Sub-Organization for their end-users to avoid limits (we currently have a maximum of 500 users per organization).

The main difference in the Quorum settings: upon creating a new sub-organization, your business' API key is used to bootstrap each End-User organization. The "CREATE_SUB_ORGANIZATION_V2" activity becomes:
```sh
{
  "type": "ACTIVITY_TYPE_CREATE_SUB_ORGANIZATION_V2",
  "timestampMs": "<time-in-ms>",
  "organizationId": "<your-organization-id>",
  "parameters": {
    "subOrganizationName": "<sub-org-name>",
    "rootUsers": [{
      "userName": "<your-business-user>",
      "userEmail": "<email>(optional)",
      "authenticators": [],
      "apiKeys": [
        "apiKeyName": "<api-key-name>",
        "publicKey": "<your-business-api-public-key>"
      ],
    }],
    "rootQuorumThreshold": 1
  }
```
(Note the empty "authenticators" list!)

Key creation and signatures can also be performed with this root API user, and the end-user doesn't need to be involved in the activity signing process.

Policies can be use to segregate permissions if needed: you could, for example, bootstrap each sub-org with 2 API users: one to create keys and setup the organization policies; the other to sign transaction.

## Sub-Organizations as shared Wallets

For the sake of completeness: it is possible to create "shared custody" wallets with the Sub-Organization primitive. To do this, an application would setup sub-organizations with the following settings:

- Root quorum threshold: 2
- Root users:
  - 1 user representing the end-user (with their Passkey as an authenticator)
  - 1 user representing the business (with an API key attached)

The signing process would then have to involve **both** the user and the business since the root quorum threshold is 2.