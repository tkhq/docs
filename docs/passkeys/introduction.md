---
description: Learn about passkeys at a high-level
slug: /passkeys/introduction
sidebar_position: 1
---

# Introduction to passkeys

Passkeys are born out of a new standard being pushed by major industry players: Apple and Google.

Google has a great high-level introduction to passkeys at https://developers.google.com/identity/passkeys, and Apple has its own version here: https://developer.apple.com/passkeys

## TLDR: what are passkeys?

From a technical point of view, passkeys are cryptographic key pairs created on end-user devices. Apple and Google have done a great job making these key pairs usable:

- Key generation happens in secure end-user hardware.
- Using passkeys is easy thanks to native browser UIs and cross-device syncing.
- Passkey recovery for users is supported natively by Apple via iCloud keychain and Google via the Google Password Manager. 

Passkeys come with big security upgrades compared to traditional passwords:
- Access to passkeys is gated with OS-level biometrics: faceID, touchID, lock screen patterns, and so on.
- Passkeys are bound to the web domain that creates them. This is important to thwart phishing attacks, where an attacker hosts a similar-looking website to steal user credentials. This is doable with passwords; impossible with passkeys.
- Because passkeys rely on public key cryptography, passkeys have two components: a public key and a private key. Private keys are never disclosed to websites, making them a lot harder to steal. Only public keys are sent. To authenticate, passkeys sign messages (with their private keys) and provide signatures as proofs, similar to crypto wallets.

## Isn't this similar to Webauthn?

If you know about Webauthn, congratulations: a lot of this will feel familiar. Passkeys rely on the [same web standard](https://www.w3.org/TR/webauthn-2/) and the same browser APIs: `navigator.credentials.create` and `navigator.credentials.get`.

The difference? Passkeys are resident credentials and they can be synced between devices. As a result, they are **not** device-bound and can be used from any device. 

## How do cross-device syncing and recovery work? 

Synchronization and recovery are both supported natively by Apple and Google. 

For example, say you are logged into both your iPhone and your Macbook with the same Apple ID. Passkeys created on one device will be synced through [iCloud Keychain](https://support.apple.com/en-us/HT204085). If you're using Chrome on different Android devices using the same Google account, [Google Password Manager](https://passwords.google/) will sync passkeys and make them available across devices seamlessly. Google has plans to support syncing more broadly across different operating systems, see [this support summary](https://developers.google.com/identity/passkeys/supported-environments#chrome-passkey-support-summary). If a passkey is lost, for example if a device was lost or damaged, both Apple and Google provide recovery processes to which you can refer your users. 

## Betting on Webauthn and Passkeys

We believe **it's time to move away from passwords** so we've built Turnkey without them. When you authenticate to Turnkey you'll be prompted to create a new passkey:

<img src="/img/passkeys/turnkey_authenticator_selection.png" alt="Authenticator selection on Turnkey" width="400px" />
<img src="/img/passkeys/turnkey_passkey_prompt.png" alt="Passkey prompt on Turnkey" width="420px" />

Authentication to Turnkey requires a passkey signature. No password needed!

Next up, learn about how you can integrate passkeys into your app, [here](/passkeys/integration).
