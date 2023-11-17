---
sidebar_position: 3
description: Learn about Wallet Export on Turnkey
slug: /integration-guides/export-wallets
---
# Export Wallet

Exporting a [Wallet](../getting-started/Wallets.md) allows your users to back up or transfer a wallet by securely viewing the wallet's [mnemonic](https://learnmeabitcoin.com/technical/mnemonic). We engineered this feature to ensure that the user can export their mnemonic without needing you in the loop.

## Before you start
Make sure you have created a wallet for your user. 
Check out our [Quickstart guide](../getting-started/Quickstart.md) if you need help getting started.  

 
If you'd like to use a sub-organization as a wallet for your user, follow our [Wallet integration guide](./sub-organizations-as-wallets.md).


## Helper packages

* We have released open-source code to create target encryption keys and decrypt exported wallet mnemonics. We've deployed this a static HTML page hosted on `export.turnkey.com` meant to be embedded as an iframe element (see the code [here](https://github.com/tkhq/frames)). This ensures the mnemonics are encrypted to keys that the user has access to, but that your organization does not (because they live in the iframe, on a separate domain).
* We have also built a package to help you insert this iframe and interact with it in the context of export: [`@turnkey/iframe-stamper`](https://www.npmjs.com/package/@turnkey/iframe-stamper)

In the rest of this guide we'll assume you are using these helpers.

## Export step-by-step

Here's a diagram summarizing the wallet export flow step-by-step ([direct link](/img/wallet_export_steps.png)):

<img src="/img/wallet_export_steps.png" />

Let's review these steps in detail:

1. User on `yoursite.xyz` clicks "export", and a new export UI is shown. We recommend this export UI be a new hosted page of your site or application, which contains language explaining to the user the security best practices they should follow once they've successfully exported their wallet. While the UI is in a loading state, your frontend uses [`@turnkey/iframe-stamper`](https://www.npmjs.com/package/@turnkey/iframe-stamper) to insert a new iframe element:
    ```js
    const iframeStamper = new IframeStamper({
        iframeUrl: "https://export.turnkey.com",
        // Configure how the iframe element is inserted on the page
        iframeContainerId: "your-container",
        iframeElementId: "turnkey-iframe",
    });

    // Inserts the iframe in the DOM. This creates the new encryption target key
    const publicKey = await iframeStamper.init();

    // Set state to not display iframe
    let showIframe = false;

    return (
        // The iframe element can be hidden until the wallet is exported
        <div
            style={{ display: showIframe ? "block" : "none" }}
        />
    );
    ```
2. Your code receives the iframe public key. Your app prompts the user to sign a new `EXPORT_WALLET` activity with the wallet ID and the iframe public key in the parameters.
3. Your app polls for the activity response, which contains an export bundle. Remember: this export bundle is an encrypted mnemonic which can only be decrypted within the iframe.
4. Your app injects the export bundle into the iframe for decryption and displays the iframe upon success:
    ```js
    // Inject export bundle into iframe
    let success = await iframeStamper.injectWalletExportBundle(exportBundle);

    if (success !== true) {
        throw new Error("unexpected error while injecting export bundle");
    }

    // If successfully injected, update the state to display the iframe
    showIframe = true;
    ```

Export is complete! The iframe now displays a numbered 3-column grid of words that form the mnemonic.

## UI customization

To enable as much customization of brand, theme, and copy, we've limited the only non-customizable UI component in the export iframe to be the grid of words forming the mnemonic.

## Private Keys

Turnkey also supports exporting raw private keys. To implement export for private keys, follow the same steps above, but instead use the `EXPORT_PRIVATE_KEY` activity and the `injectKeyExportBundle` method on the [`@turnkey/iframe-stamper`](https://www.npmjs.com/package/@turnkey/iframe-stamper). At the end of a successful private key export, the iframe displays a hexadecimal-encoded raw private key.
