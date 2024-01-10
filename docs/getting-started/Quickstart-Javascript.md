---
id: quickstart-javascript
sidebar_position: 2
description: Onboard and sign your first Ethereum transaction
slug: /getting-started/quickstart
---
# Quickstart

This quickstart will guide you through Turnkey’s onboarding, adding an API key, creating a wallet, and signing your first Ethereum transaction.

## Create your Turnkey Organization

- Visit [app.turnkey.com/dashboard/auth/initial](https://app.turnkey.com/dashboard/auth/initial) and enter your email address
- Confirm your email by clicking on the link inside of the confirmation email
- Follow the prompts to add your first authenticator and create your organization

## Find your Organization ID

All API requests require an organization ID. Yours can be located in the user dropdown menu at the top right corner of the dashboard.

<img
  src="/img/quickstart/find_organization_id.png"
  alt="Find organization ID"
  style={{ width: 940 }}
/>

You'll want to save this somewhere in your code, as you'll need it to make requests to the Turnkey API.

```javascript
const TURNKEY_ORGANIZATION_ID = "<Your Org ID>";
```

## Create an API Key

Turnkey API Keys are generic public / private key pairs that allow you to make requests to our API. You can create an API Key from your user page of the dashboard. Navigate to your user page by clicking on "User Details" in the user dropdown menu, and then click "Create an API key".

<img
  src="/img/quickstart/find_user_details.png"
  alt="Find user details"
  style={{ width: 940 }}
/>

<img
  src="/img/quickstart/create_api_key.png"
  alt="Find user details"
  style={{ width: 940 }}
/>

- Select "Generate API keys in-browser" and click continue.
- Give your API key pair a name and click continue.
- Save your Public and Private Key locally.
- Make sure to click "Approve" to sign the API Creation activity with your authenticator device.

A couple of notes:
- You will need both the public and private key to sign requests to the Turnkey API.
- **Any code using a Turnkey API private key should only ever be run server-side.**
- PLACEHOLDER: Explanation of Turnkey Activities -> Direct to relavant link

## Require the Turnkey Libraries

There are two libraries that you will need to make API requests to Turnkey:
 1. The Turnkey HTTP library.
 2. A Turnkey "stamper" library.

The stamper library is responsible for signing a request into Turnkey, and comes in 3 different flavors:
  1. `api-key-stamper` which signs requests with your Turnkey API key
  2. `webauthn-stamper` which signs requests with a end-user's passkey
  3. `iframe-stamper` which is a wrapper around the api-key-stamper and used specifically for Email Recovery and Email Auth

The simplest way to get started, is to use the API Key Stamper to make requests to Turnkey that are signed with the API key pair you created in the previous step.

```shell
npm install @turnkey/http
npm install @turnkey/api-key-stamper
```

## Initialize the Turnkey Client
```javascript
import { ApiKeyStamper } from '@turnkey/api-key-stamper';
import { TurnkeyClient } from '@turnkey/http';

const TURNKEY_ORGANIZATION_ID = "<Your Org ID>";

const stamper = new ApiKeyStamper({
  apiPublicKey: "<Your Public Key>",
  apiPrivateKey: "<Your Private Key>"
})

const turnkeyClient = new TurnkeyClient(
  {
    baseUrl: 'https://api.turnkey.com'
  },
  stamper
);
```

## Create a Wallet

A `wallet` on Turnkey represents a multi-chain seed phrase from which many individual `accounts` can be derived. An `account` represents a specific index on a derivation path and contains the blockchain address that you can send funds to and sign on-chain transactions with. The only thing a wallet needs to be initialized is a name for the wallet.

```javascript
const response = await turnkeyClient.createWallet({
  organizationId: TURNKEY_ORGANIZATION_ID,
  type: 'ACTIVITY_TYPE_CREATE_WALLET',
  timestampMs: String(Date.now()),
  parameters: {
    walletName: "Test Wallet 1",
    accounts: []
  }
})

const walletId = response.activity.result.createWalletResult.walletId;
```

## Create an Ethereum Account

Once a wallet has been created, accounts can be created against that wallet by passing in the derivation path information for any accounts that you want to derive. In this example we will derive Ethereum accounts, using the standard BIP44 Path format. The final number at the end of the path string represents the index in the derivation path that you want to derive the account for.

Note: You can also create the accounts atomically when you create the wallet by passing in the account derivation paths to the initial createWallet call if desired.

```javascript
await client.createWalletAccounts({
  organizationId: TURNKEY_ORGANIZATION_ID,
  type: 'ACTIVITY_TYPE_CREATE_WALLET_ACCOUNTS',
  timestampMs: String(Date.now()),
  parameters: {
    walletId: "<Your wallet id>",
    accounts: [
      {
        path: "m/44'/60'/0'/0/0", // account at index 0
        pathFormat: "PATH_FORMAT_BIP32",
        curve: "CURVE_SECP256K1",
        addressFormat: "ADDRESS_FORMAT_ETHEREUM"
      },
      {
        path: "m/44'/60'/0'/0/1", // account at index 1
        pathFormat: "PATH_FORMAT_BIP32",
        curve: "CURVE_SECP256K1",
        addressFormat: "ADDRESS_FORMAT_ETHEREUM"
      },
      {
        path: "m/44'/60'/0'/0/2", // account at index 2
        pathFormat: "PATH_FORMAT_BIP32",
        curve: "CURVE_SECP256K1",
        addressFormat: "ADDRESS_FORMAT_ETHEREUM"
      },
    ]
  }
})
```

You can view the created accounts and their associated Ethereum addresses with

```javascript
await client.getWalletAccounts({
  organizationId: TURNKEY_ORGANIZATION_ID,
  walletId: "<Your wallet id>"
})
```

## Sign a Transaction

Once you have an account, you can sign a transaction with the account as follows.

```javascript
await turnkeyClient.signTransaction({
  organizationId: TURNKEY_ORGANIZATION_ID,
  type: "ACTIVITY_TYPE_SIGN_TRANSACTION_V2",
  timestampMs: String(Date.now()),
  parameters: {
    signWith: "<Your ethereum address>" // i.e. 0x780ed9b6BF99908106d1bAA25b7658a80ADB5f42
    unsignedTransaction: "<Your unsigned transaction>", // i.e. 02eb018084db4f550d850bb6338fa88252089470a8a81613dd06dc243de94ebdf861ff5f82b361831e848080c0
    type: "TRANSACTION_TYPE_ETHEREUM"
  }
})
```

Make sure to replace the `unsignedTransaction` below with your own. You can use our [simple transaction generator](https://build.tx.xyz) if you need a quick transaction for testing.

If you'd like to broadcast your transaction, you can easily do so via [Etherscan](https://etherscan.io/pushTx).


## Using the Webauthn Stamper

The previous actions all had to be signed server-side in our code using a Turnkey API key, but you can also have individual end-users sign Turnkey activities using their own passkeys using the webauthn stamper library. You can learn more about the specifics of the passkeys implementation in the [Passkey guide](../passkeys/introduction)

The following example will show a simple example of having an end-user sign a request with a passkey and send it to a dapp developer's endpoint.

```shell
npm install @turnkey/webauthn-stamper
```

```javascript
import { WebauthnStamper } from "@turnkey/webauthn-stamper";
import { TurnkeyClient, createActivityPoller } from '@turnkey/http';

const TURNKEY_ORGANIZATION_ID = "<Your Org ID>";

const stamper = new WebauthnStamper({
  rpId: "<Your domain name here>" // i.e. "wallet.xyz" or "localhost"
})

const turnkeyClient = new TurnkeyClient(
  {
    baseUrl: 'https://api.turnkey.com'
  },
  stamper
);

// This will produce a signed request that can be POSTed from anywhere.
// The `signedRequest` has a URL, a POST body, and a "stamp" (HTTP header name and value)
const signedRequest = await turnkeyClient.stampCreatePrivateKeys(...);

// Alternatively, you can POST directly from your frontend.
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

## Best Practices (Using Sub-Organizations)

Due to cryptographic limitations of how much data can be signed at once, generally speaking, a common pattern is to create sub-organizations for each individual user, instead of creating wallets for each user directly on the parent organization. You can read more about how to properly do this in the [Suborganization Guide](../integration-guides/sub-organizations-as-wallets.md)

## Next Steps
- Check out our [examples](/getting-started/examples) to see what can be built
- Learn more about [Organizations](/getting-started/organizations) and [Wallets](/getting-started/wallets)
- See our [API design](/api-introduction) or dive into our [API reference](/api)
