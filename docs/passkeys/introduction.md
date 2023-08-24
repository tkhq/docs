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

- key generation happens seamlessly
- using passkeys is seamless thanks to native browser popups and cross-device syncing

Passkeys come with big security upgrades compared to traditional passwords:
- Access to passkeys is gated with OS-level biometrics: faceID, touchID, lock screen patterns, and so on.
- Passkeys are bound to the web domain that creates them. This is important to thwart phishing attacks, where an attacker hosts a similar-looking website to steal user credentials. This is doable with passwords; impossible with passkeys.
- Because passkeys rely on public key cryptography, passkeys have two components: a public key and a private key. Private keys are never disclosed to websites, making them a lot harder to steal. Only public keys are sent. To authenticate, passkeys sign messages (with their private keys) and provide signatures as proofs. Similar to crypto wallets!

## Isn't this similar to Webauthn?

If you know about Webauthn, congratulation: a lot of this will feel familiar. Passkeys rely on the [same web standard](https://www.w3.org/TR/webauthn-2/) and the same browser APIs: `navigator.credentials.create` and `navigator.credentials.get`.

The difference? Passkeys are resident credentials and they can be synced between devices. As a result, they are **not** device-bound and can be used from any device. Say you are logged into both your iPhone and your Macbook with the same Apple ID, passkeys created on one device will be synced through [iCloud Keychain](https://support.apple.com/en-us/HT204085). If you're using Google browsers on different devices using the same Google account, [Google Password Manager](https://passwords.google/) will sync passkeys and make them available across devices seamlessly.

## Betting on Webauthn and Passkeys

We believe **it's time to move away from passwords** so we've built Turnkey without them. When you authenticate to Turnkey you'll be prompted to create a new passkey:

<img src="/img/passkeys/turnkey_authenticator_selection.png" alt="Authenticator selection on Turnkey" width="400px" />
<img src="/img/passkeys/turnkey_passkey_prompt.png" alt="Passkey prompt on Turnkey" width="420px" />

Authentication to Turnkey requires a passkey signature. No password needed!

Turnkey’s current Webauthn implementation uses non-resident credentials, which means the credential ID generated during registration isn’t stored on the webauthn device fully: Turnkey must store the generated credential ID; otherwise the user won’t be able to sign. This is because the actual signing key is a combination of an “on-device” secret and the credential ID (crypto details here) .
We chose non-resident keys because some older yubikey models have limited key slots, and they’ll simply refuse to register if you ask for resident credentials. Concretely, at registration time, we set the following authenticatorSelection options:
