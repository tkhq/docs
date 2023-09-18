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

Synchronization and recovery are both supported natively by Apple and Google:

- With Apple, Passkeys created on one device are synced through [iCloud Keychain](https://support.apple.com/en-us/HT204085) as long as the user is logged in with their Apple ID. Apple covers both syncing and recovery in ["About the security of passkeys"](https://support.apple.com/en-us/102195). For some additional detail, see [this Q&A with the passkey team](https://developer.apple.com/news/?id=21mnmxow). Apple's account recovery process is documented in [this support page](https://support.apple.com/en-us/HT204921).
- With Google, [Google Password Manager](https://passwords.google/) syncs passkeys across devices seamlessly. Google has plans to support syncing more broadly across different operating systems, see [this support summary](https://developers.google.com/identity/passkeys/supported-environments#chrome-passkey-support-summary). Recovery is covered in [this FAQ ("What happens if a user loses their device?")](https://developers.google.com/identity/passkeys/faq#what_happens_if_a_user_loses_their_device): it relies on Google's overall [account recovery process](https://support.google.com/accounts/answer/7682439?hl=en) because passkeys are attached to Google accounts.

## Betting on Webauthn and Passkeys

We believe **it's time to move away from passwords** so we've built Turnkey without them. When you authenticate to Turnkey you'll be prompted to create a new passkey:

<img src="/img/passkeys/turnkey_authenticator_selection.png" alt="Authenticator selection on Turnkey" width="400px" />
<img src="/img/passkeys/turnkey_passkey_prompt.png" alt="Passkey prompt on Turnkey" width="420px" />

Authentication to Turnkey requires a passkey signature. No password needed!

Next up, learn about how you can integrate passkeys into your app, [here](/passkeys/integration).
