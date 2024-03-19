---
sidebar_position: 1
description: Use sub-organizations as end-user wallets
slug: /integration-guides/sub-organizations-as-wallets
---

# Sub-Organizations as Wallets

Turnkey has built a new model for private key management that utilizes secure enclaves. All transactions are signed within an enclave and private keys are never exposed to Turnkey, your software, or your team. Turnkey’s role is similar to that of a safety deposit box operator — Turnkey secures and provides access to the safety deposit boxes, but our system requires cryptographic proof of ownership to take any action with the keys held within.

We've seen in [Sub-Organizations](/concepts/Sub-Organizations) that sub-organizations are independent from their parent. This guide walks through 3 ways to use sub-organizations as wallets for your users. We first show that it can be used to create non-custodial wallets, or end-user controlled wallets. Then we explain how you can create custodial wallets or shared custody wallets using the same primitive.

## Sub-Organizations as end-user controlled wallets

In this example wallet implementation, you will create a segregated sub-organization for each end-user, and leverage [passkeys](/passkeys/introduction) as cryptographic proof of ownership to ensure only the end-user has the ability to approve signing. Your application will construct transactions on behalf of the end-user, and then surface the relevant Turnkey activity request client-side for end-user approval.

Note that Turnkey is not a customer authentication platform. This gives you the flexibility to create the user experience you envision. Typically, Turnkey integrators implement their own standard end-user authentication flows for login, then employ passkeys behind that login for transaction signing.

If you'd like to see a live example, head over to our [✨Demo Passkey Wallet✨](https://wallet.tx.xyz/), and follow along with the code [here](https://github.com/tkhq/demo-passkey-wallet).

### Before you start

Make sure you’ve set up your primary Turnkey organization with at least one API user for programmatic user onboarding. Check out our [Quickstart guide](../getting-started/Quickstart.md) if you need help getting started.

### Step 1: Create a sub-organization

After the end-user is logged in, your application prompts the user for passkey creation on the application domain. Our JavaScript SDK has a helper for this: `getWebAuthnAttestation`. See [this example](https://github.com/tkhq/sdk/tree/main/examples/with-federated-passkeys).

Your application then uses an API-only user to create a new sub-organization on behalf of the end-user with a `CREATE_SUB_ORGANIZATION` activity. In the example below, the new sub-organization has one root user controlled by the end user's passkey, and an associated Ethereum wallet:

```json
{
  "type": "ACTIVITY_TYPE_CREATE_SUB_ORGANIZATION_V4",
  "timestampMs": "<time-in-ms>",
  "organizationId": "<your-organization-id>",
  "parameters": {
    "subOrganizationName": "<sub-org-name>",
    "rootUsers": [
      {
        "userName": "<end-user-name>",
        "userEmail": "<email>(optional)",
        "authenticators": [
          {
            "authenticatorName": "<passkey-name>",
            "challenge": "<webauthn-challenge>",
            "attestation": {
              "credentialId": "<credential-id>",
              "clientDataJson": "<client-data-json>",
              "attestationObject": "<attestation-object>",
              "transports": ["AUTHENTICATOR_TRANSPORT_HYBRID"]
            }
          }
        ],
        "apiKeys": []
      }
    ],
    "rootQuorumThreshold": 1,
    "wallet": {
      "walletName": "Default Wallet",
      "accounts": [
        {
          "curve": "CURVE_SECP256K1",
          "pathFormat": "PATH_FORMAT_BIP32",
          "path": "m/44'/60'/0'/0/0",
          "addressFormat": "ADDRESS_FORMAT_ETHEREUM"
        }
      ]
    }
  }
}
```

The response will contain the new sub-organization ID as well as details about its associated Ethereum wallet:

```json
{
  "subOrganizationId": "<your-new-sub-org>", // the organization_id that the end-user must use when signing requests
  "wallet": {
    "walletId": "<your-new-wallet>", // the wallet ID used to generate more accounts
    "addresses": "<your-new-addresses>" // the addresses you can now sign with
  }
}
```

Note: root users created with sub-organizations can have both API keys and authenticators (e.g. passkeys). In this example we only expect passkeys. See [Sub-Organizations as shared wallets](#sub-organizations-as-shared-wallets) for a use case which requires both.

With this setup each end-user now has sole control over their sub-organization and any resources created within it. Your application cannot take any actions on resources within the sub-organization without explicit cryptographic authorization from the end-user in the form of a passkey signature.

It's important to note that the initial activity to create a sub-organization has to be authorized by an API key of a user in your main Turnkey organization. Otherwise, anyone would be able to create sub-organizations in your organization! Here's an [example](https://github.com/tkhq/sdk/blob/a2bfbf3cbd6040902bbe4c247900ac560be42925/examples/with-federated-passkeys/src/pages/index.tsx#L88-L116) where the initial registration is done, and posted to a NextJS backend. The NextJS backend inserts the attestation and signs the `CREATE_SUB_ORGANIZATION_V4` activity [here](https://github.com/tkhq/sdk/blob/ba360baeb60d80276f7faeca602b99190fe5affe/examples/with-federated-passkeys/src/pages/api/createSubOrg.ts#L27-L106).

### Step 2: Wallet creation

While the **first wallet creation is already done** (our `CREATE_SUB_ORGANIZATION` activity accepts a `wallet` parameter!), your end-users can derive more accounts or create more wallets after the fact by using their passkeys to sign a `CREATE_WALLET` activity.

We've abstracted getting WebAuthn signatures and creating signed Turnkey requests behind typed methods (e.g. `createWallet`).

Our `TurnkeyClient` (from [`@turnkey/http`](https://www.npmjs.com/package/@turnkey/http)) can be initialized with a `WebauthnStamper` (from [`@turnkey/webauthn-stamper`](https://www.npmjs.com/package/@turnkey/webauthn-stamper)):

```js
import { WebauthnStamper } from "@turnkey/webauthn-stamper";
import { TurnkeyClient } from "@turnkey/http";

const stamper = new WebAuthnStamper({
  rpId: "your-domain.com",
});

// New HTTP client able to sign with passkeys!
const httpClient = new TurnkeyClient(
  { baseUrl: "https://api.turnkey.com" },
  stamper,
);

// Signs and sends a request to Turnkey
await httpClient.createWallet({
  type: "ACTIVITY_TYPE_CREATE_WALLET",
  organizationId: "<user sub-organization>",
  timestampMs: String(Date.now()),
  parameters: {
    walletName: "New Wallet",
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

In the snippet above we send the activity directly to Turnkey's backend. Our SDK also comes with abstractions to create a `signedRequest`, which contain all the components needed to forward it to Turnkey: URL, body, and a stamp header (with name and value properties). Use `httpClient.stampCreateWallet` to get a signed request. Your backend server can then proxy it to Turnkey.

Next, we can derive additional accounts (addresses) given a single HD wallet. The shape of the request is as follows:

```json
{
  "type": "ACTIVITY_TYPE_CREATE_WALLET_ACCOUNTS",
  "timestampMs": "<time-in-ms>",
  "organizationId": "<your-organization-id>",
  "parameters": {
    "walletId": "<your-wallet-id>",
    "accounts": [
      {
        "curve": "CURVE_SECP256K1",
        "pathFormat": "PATH_FORMAT_BIP32",
        "path": "m/44'/60'/0'/0/0",
        "addressFormat": "ADDRESS_FORMAT_ETHEREUM"
      }
    ]
  }
}
```

### Step 3: Transaction signing

The end-user must provide a signature over each `SIGN_TRANSACTION` activity with their passkey. In your application, a user action (for example tapping a "Withdraw Rewards" button) might trigger the flow. The details of this transaction should be presented to the user for confirmation, followed by a passkey prompt to sign the Turnkey activity. An activity to sign a transaction looks like the following:

```json
{
  "type": "ACTIVITY_TYPE_SIGN_TRANSACTION_V2",
  "timestampMs": "<time-in-ms>",
  "organizationId": "<sub-organization-id>",
  "parameters": {
    "signWith": "<wallet account address, private key id, or private key address>",
    "type": "TRANSACTION_TYPE_ETHEREUM",
    "unsignedTransaction": "<unsigned-transaction>"
  }
}
```

Turnkey returns a signed transaction in the activity result which your application can broadcast using any provider you'd like.

## Sub-Organizations as custodial wallets

Most of the steps outlined in the previous section remain unchanged: applications creating custodial wallets should still create segregated sub-organizations for their end-users to avoid limits (we currently have a maximum of 100 users per organization, whereas an organization can have unlimited sub-organizations).

The main difference is in the Root Quorum settings: upon creating a new sub-organization, your business's API key is used to bootstrap each end-user organization. The `CREATE_SUB_ORGANIZATION_V4` activity becomes:

```json
{
  "type": "ACTIVITY_TYPE_CREATE_SUB_ORGANIZATION_V4",
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
    "rootQuorumThreshold": 1,
    "wallet": {
      "walletName": "Default ETH Wallet",
      "accounts": [
        {
          "curve": "CURVE_SECP256K1",
          "pathFormat": "PATH_FORMAT_BIP32",
          "path": "m/44'/60'/0'/0/0",
          "addressFormat": "ADDRESS_FORMAT_ETHEREUM",
        },
      ],
    },
  }
}
```

(Note the empty "authenticators" list!)

Key creation and signatures can also be performed with this root API user, and the end-user doesn't need to be involved in the activity signing process.

Policies can be use to segregate permissions if needed: you could, for example, bootstrap each sub-org with 2 API users: one to create keys and setup the organization policies; the other to sign transactions.

## Sub-Organizations as shared Wallets

For the sake of completeness: it is possible to create "shared custody" wallets with the sub-organization primitive. To do this, an application would setup sub-organizations with the following settings:

- Root quorum threshold: 2
- Root users:
  - 1 user representing the end-user (with their Passkey as an authenticator)
  - 1 user representing the business (with an API key attached)

The signing process would then have to involve **both** the user and the business since the root quorum threshold is 2. To reduce friction for the end-user, many clients opt to start with a root quorum of 1. This way, you can take certain actions with your business's API key root user **prior** to updating the root quorum threshold to 2.
