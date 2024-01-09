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

For convenience, it's worth setting this as a constant in your app:

```javascript
const TURNKEY_ORGANIZATION_ID="<Your Org ID>"
```

## Require the Turnkey Libraries

There are two libraries that you need, the Turnkey HTTP library, for making API requests to the Turnkey API. And a Turnkey "Stamper" library. The stamper library is responsible for signing the operation into Turnkey, and comes in 3 different flavors:
  1. `api-key-stamper` which signs requests with your Turnkey API key
  2. `webauthn-stamper` which signs requests with a end-user's passkey
  3. `iframe-stamper` which is used for ...

For this example we're going to use the API Key Stamper to make requests to Turnkey from the context of the dapp.
**Any code using the Turnkey API key should only be run server-side**

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

```javascript
await turnkeyClient.createWallet({
  organizationId: TURNKEY_ORGANIZATION_ID,
  type: 'ACTIVITY_TYPE_CREATE_WALLET',
  timestampMs: String(Date.now()),
  parameters: {
    walletName: "Test Wallet 1",
    accounts: [
      {
        path: "m/44'/0'/0'/0/0",
        pathFormat: "PATH_FORMAT_BIP32",
        curve: "CURVE_SECP256K1",
        addressFormat: "ADDRESS_FORMAT_ETHEREUM"
      }
    ]
  }
})
```

## Create an Ethereum Account

```javascript
await turnkeyClient.createWallet({
  organizationId: TURNKEY_ORGANIZATION_ID,
  type: 'ACTIVITY_TYPE_CREATE_WALLET',
  timestampMs: String(Date.now()),
  parameters: {
    walletName: "Test Wallet 1",
    accounts: [
      {
        path: "m/44'/0'/0'/0/0",
        pathFormat: "PATH_FORMAT_BIP32",
        curve: "CURVE_SECP256K1",
        addressFormat: "ADDRESS_FORMAT_ETHEREUM"
      }
    ]
  }
})
```

## Sign a Transaction

```javascript
await turnkeyClient.createWallet({
  organizationId: TURNKEY_ORGANIZATION_ID,
  type: 'ACTIVITY_TYPE_CREATE_WALLET',
  timestampMs: String(Date.now()),
  parameters: {
    walletName: "Test Wallet 1",
    accounts: [
      {
        path: "m/44'/0'/0'/0/0",
        pathFormat: "PATH_FORMAT_BIP32",
        curve: "CURVE_SECP256K1",
        addressFormat: "ADDRESS_FORMAT_ETHEREUM"
      }
    ]
  }
})
```

## Using the Webauthn Stamper

Now we'll perform user actions using the client-side webauthn stamper. You can learn more about the specifics of passkeys in the [Passkey guide](../passkeys/introduction)

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

## Next Steps
- Check out our [examples](/getting-started/examples) to see what can be built
- Learn more about [Organizations](/getting-started/organizations) and [Wallets](/getting-started/wallets)
- See our [API design](/api-introduction) or dive into our [API reference](/api)
