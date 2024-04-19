---
sidebar_position: 8
description: Learn about Wallet and Key Export on Turnkey
slug: /features/export-wallets
---

# Export Wallets and Keys

Turnkey's export functionality allows your end users to backup or transfer a [Wallet](/concepts/Wallets) by securely viewing the wallet's [mnemonic phrase](https://learnmeabitcoin.com/technical/mnemonic). We engineered this feature to ensure that the user can export their mnemonic without exposing the mnemonic itself to Turnkey or your application.

Follow along with the Embedded iframe guide.

## Embedded iframe

- We have released open-source code to create target encryption keys and decrypt exported wallet mnemonics. We've deployed a static HTML page hosted on `export.turnkey.com` meant to be embedded as an iframe element (see the code [here](https://github.com/tkhq/frames)). This ensures the mnemonics are encrypted to keys that the user has access to, but that your organization does not (because they live in the iframe, on a separate domain).
- We have also built a package to help you insert this iframe and interact with it in the context of export: [`@turnkey/iframe-stamper`](https://www.npmjs.com/package/@turnkey/iframe-stamper)

In the rest of this guide we'll assume you are using these helpers.

### Steps

Here's a diagram summarizing the wallet export flow step-by-step ([direct link](/img/wallet_export_steps.png)):

<p style={{ textAlign: "center" }}>
    <img
        src="/img/wallet_export_steps.png"
        alt="wallet export steps"
        style={{ width: 600 }}
    />
</p>

Let's review these steps in detail:

1. When a user on your application clicks "export", display a new export UI. We recommend setting this export UI as a new hosted page of your application that contains language explaining the security best practices users should follow once they've successfully exported their wallet. Remember: once the wallet has been exported, Turnkey can no longer ensure its security.

   While the UI is in a loading state, your application uses [`@turnkey/iframe-stamper`](https://www.npmjs.com/package/@turnkey/iframe-stamper) to insert a new iframe element:

   ```js
   const iframeStamper = new IframeStamper({
     iframeUrl: "https://export.turnkey.com",
     // Configure how the iframe element is inserted on the page
     iframeContainer: yourContainer,
     iframeElementId: "turnkey-iframe",
   });

   // Inserts the iframe in the DOM. This creates the new encryption target key
   const publicKey = await iframeStamper.init();

   // Set state to not display iframe
   let displayIframe = "none";

   return (
     // The iframe element can be hidden until the wallet is exported
     <div style={{ display: displayIframe }} />
   );
   ```

2. Your code receives the iframe public key. Your application prompts the user to sign a new `EXPORT_WALLET` activity with the wallet ID and the iframe public key in the parameters.
3. Your application polls for the activity response, which contains an export bundle. Remember: this export bundle is an encrypted mnemonic which can only be decrypted within the iframe.

   Need help setting up async polling? Checkout our guide and helper [here](https://github.com/tkhq/sdk/tree/main/packages/http#withasyncpolling-helper).

4. Your application injects the export bundle into the iframe for decryption and displays the iframe upon success:

   ```js
   // Inject export bundle into iframe
   let success = await iframeStamper.injectWalletExportBundle(exportBundle);

   if (success !== true) {
     throw new Error("unexpected error while injecting export bundle");
   }

   // If successfully injected, update the state to display the iframe
   iframeDisplay = "block";
   ```

Export is complete! The iframe now displays a sentence of words separated by spaces.

<p style={{ textAlign: "center" }}>
    <img
        src="/img/wallet_export_mnemonic.png"
        alt="wallet mnemonic"
        style={{ width: 420 }}
    />
</p>

The exported wallet will remain stored within Turnkey’s infrastructure. In your Turnkey dashboard, the exported user Wallet will be flagged as “Exported”.

### UI customization

Everything is customizable in the export iframe except the sentence of mnemonic words, which is minimally styled: the text is left-aligned and the padding and margins are zero. Here's an example of how you can configure the styling of the iframe.

```js
const iframeCss = `
iframe {
    box-sizing: border-box;
    width: 400px;
    height: 120px;
    border-radius: 8px;
    border-width: 1px;
    border-style: solid;
    border-color: rgba(216, 219, 227, 1);
    padding: 20px;
}
`;

return (
  <div style={{ display: iframeDisplay }} id="your-container">
    <style>{iframeCss}</style>
  </div>
);
```

### Export as Private Keys

Turnkey also supports exporting Wallet Accounts and Private Keys as private keys.

#### Wallet Accounts

Follow the same steps above for exporting Wallets as mnemonics, but instead use the `EXPORT_WALLET_ACCOUNT` activity and the `injectKeyExportBundle` method from the [`@turnkey/iframe-stamper`](https://www.npmjs.com/package/@turnkey/iframe-stamper).

#### Private Keys

Follow the same steps above for exporting Wallets as mnemonics, but instead use the `EXPORT_PRIVATE_KEY` activity and the `injectKeyExportBundle` method from the [`@turnkey/iframe-stamper`](https://www.npmjs.com/package/@turnkey/iframe-stamper). You can pass an optional `keyFormat` to `injectKeyExportBundle(keyFormat)` that will apply either `hexadecimal` or `solana` formatting to the private key that is exported in the iframe. The default key format is `hexadecimal`, which is used by MetaMask, MyEtherWallet, Phantom, Ledger, and Trezor for Ethereum keys. For Solana keys, you will need to pass the `solana` key format.

<p style={{ textAlign: "center" }}>
    <img
        src="/img/private_key_export.png"
        alt="private key export"
        style={{ width: 420 }}
    />
</p>

At the end of a successful private key export, the iframe displays a private key.

## Cryptographic details

Turnkey's export functionality ensures that neither your application nor Turnkey can view the wallet mnemonic or private key.

It works by anchoring export in a **target encryption key** (TEK). This target encryption key is a standard P-256 key pair and can be created in many ways: completely offline, or online inside of script using the web crypto APIs.

The following diagram summarizes the flow:

<p style={{ textAlign: "center" }}>
    <img
        src="/img/wallet_export_cryptography.png"
        alt="export cryptography"
        style={{ height: 280 }}
    />
</p>

The public part of this key pair is passed as a parameter inside of a signed `EXPORT_WALLET`, `EXPORT_PRIVATE_KEY`, or `EXPORT_WALLET_ACCOUNT` activity.

Our enclave encrypts the wallet's mnemonic or private key to the user's TEK using the **Hybrid Public Key Encryption standard**, also known as **HPKE** or [RFC 9180](https://datatracker.ietf.org/doc/rfc9180/).

Once the activity succeeds, the encrypted mnemonic or private key can be decrypted by the target public key offline or in an online script.

### Solana notes

Solana paths do not include an `index`. Creating a wallet account with an index specified could lead to unexpected behavior when exporting and importing into another wallet.

When importing into a multichain wallet such as Phantom, see [this guide](https://help.phantom.app/hc/en-us/articles/12988493966227-What-derivation-paths-does-Phantom-wallet-support#:~:text=The%20addresses%20are%20grouped%20into,'%2F0'%2F0%2F0.) on matching private keys across Solana, Ethereum, and Polygon.