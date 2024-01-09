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

## Require the Turnkey Libraries

There are two libraries that you will need to make API requests to Turnkey:
 1. The Turnkey HTTP library.
 2. A Turnkey "stamper" library.

The stamper library is responsible for signing the operation into Turnkey, and comes in 3 different flavors:
  1. `api-key-stamper` which signs requests with your Turnkey API key
  2. `webauthn-stamper` which signs requests with a end-user's passkey
  3. `iframe-stamper` which is used for ...

The simplest way to get started, is to use the API Key Stamper to make requests to Turnkey that are signed with the API key pair you created in the previous step.

```shell
  yarn add @turnkey/http
  yarn add @turnkey/api-key-stamper
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

A `wallet` on Turnkey represents a multi-chain seed phrase from which many individual `accounts` can be derived. An `account` represents an individual index on a derivation path that contains the blockchain address you can send funds to and sign on-chain transactions with. The only thing a wallet needs to be initialized is a name for the wallet.

```javascript
await turnkeyClient.createWallet({
  organizationId: TURNKEY_ORGANIZATION_ID,
  type: 'ACTIVITY_TYPE_CREATE_WALLET',
  timestampMs: String(Date.now()),
  parameters: {
    walletName: "Test Wallet 1",
    accounts: []
  }
})
```

## Create an Ethereum Account

Once a wallet has been created, an account can be created against that wallet by passing in the [INSERT HERE] ...

Note: The account specification could also be passed into the initial createWallet call if desired.

```javascript
await client.createWalletAccounts({
  organizationId: TURNKEY_ORGANIZATION_ID,
  type: 'ACTIVITY_TYPE_CREATE_WALLET_ACCOUNTS',
  timestampMs: String(Date.now()),
  parameters: {
    walletId: '1ce716fa-9d40-5371-9c1a-3e95e4663ff5',
    accounts: [
      {
        path: "m/44'/60'/0'/0/0",
        pathFormat: "PATH_FORMAT_BIP32",
        curve: "CURVE_SECP256K1",
        addressFormat: "ADDRESS_FORMAT_ETHEREUM"
      },
      {
        path: "m/44'/60'/0'/0/1",
        pathFormat: "PATH_FORMAT_BIP32",
        curve: "CURVE_SECP256K1",
        addressFormat: "ADDRESS_FORMAT_ETHEREUM"
      },
      {
        path: "m/44'/60'/0'/0/2",
        pathFormat: "PATH_FORMAT_BIP32",
        curve: "CURVE_SECP256K1",
        addressFormat: "ADDRESS_FORMAT_ETHEREUM"
      },
    ]
  }
})
```

You can view the created accounts with

```javascript
await client.createWalletAccounts({
  organizationId: TURNKEY_ORGANIZATION_ID,
  type: 'ACTIVITY_TYPE_CREATE_WALLET_ACCOUNTS',
  timestampMs: String(Date.now()),
  parameters: {
    walletId: '1ce716fa-9d40-5371-9c1a-3e95e4663ff5',
    accounts: [
      {
        path: "m/44'/60'/0'/0/0",
        pathFormat: "PATH_FORMAT_BIP32",
        curve: "CURVE_SECP256K1",
        addressFormat: "ADDRESS_FORMAT_ETHEREUM"
      }
    ]
  }
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

## Using the Webauthn Stamper

The previous actions all had to be signed server-side in our code using a Turnkey API key, but you can also have individual end-users sign Turnkey activities using their own passkeys using the client-side webauthn stamper library. You can learn more about the specifics of the passkeys implementation in the [Passkey guide](../passkeys/introduction)

```shell
yarn add @turnkey/webauthn-stamper
```

```javascript
import { WebauthnStamper } from "@turnkey/webauthn-stamper";
import { TurnkeyClient } from '@turnkey/http';

const TURNKEY_ORGANIZATION_ID = "<Your Org ID>";

new WebauthnStamper({
  rpId: process.env.NEXT_PUBLIC_RPID,
})

const turnkeyClient = new TurnkeyClient(
  {
    baseUrl: 'https://api.turnkey.com'
  },
  stamper
);
```

## Using the IFrame Stamper
```shell
yarn add @turnkey/iframe-stamper
```

```javascript
import { IframeStamper } from "@turnkey/iframe-stamper";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface ExportProps {
  iframeUrl: string;
  iframeDisplay: string;
  setIframeStamper: Dispatch<SetStateAction<IframeStamper | null>>;
}

const TurnkeyIframeContainerId = "turnkey-export-iframe-container-id";
const TurnkeyIframeElementId = "turnkey-export-iframe-element-id";

export function Export(props: ExportProps) {
  const [iframeStamper, setIframeStamper] = useState<IframeStamper | null>(
    null
  );
  const iframeUrl = props.iframeUrl;
  const setParentIframeStamper = props.setIframeStamper;

  useEffect(() => {
    if (!iframeStamper) {
      const iframeStamper = new IframeStamper({
        iframeUrl: iframeUrl,
        iframeContainerId: TurnkeyIframeContainerId,
        iframeElementId: TurnkeyIframeElementId,
      });

      iframeStamper.init().then(() => {
        setIframeStamper(iframeStamper);
        setParentIframeStamper(iframeStamper);
      });
    }

    return () => {
      if (iframeStamper) {
        iframeStamper.clear();
        setIframeStamper(null);
        setParentIframeStamper(null);
      }
    };
  }, [iframeUrl, iframeStamper, setIframeStamper, setParentIframeStamper]);

  const iframeCss = `
  iframe {
      width: 100%;
      height: 340px;
  }
  `;

  return (
    <div
      className="space-y-4 p-4 max-w-lg m-auto"
      style={{ display: props.iframeDisplay }}
      id={TurnkeyIframeContainerId}
    >
      <style>{iframeCss}</style>
    </div>
  );
}
```

## Best Practices (Using Sub-Organizations)

Due to cryptographic limitations of how much data can be signed at once, generally speaking, a common pattern is to create sub-organizations for each individual user, instead of creating wallets for each user directly on the parent organization. You can read more about how to properly do this in the [Suborganization Guide](../integration-guides/sub-organizations-as-wallets.md)


## Next Steps
- Check out our [examples](/getting-started/examples) to see what can be built
- Learn more about [Organizations](/getting-started/organizations) and [Wallets](/getting-started/wallets)
- See our [API design](/api-introduction) or dive into our [API reference](/api)
