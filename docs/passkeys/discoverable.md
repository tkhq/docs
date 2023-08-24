---
description: Learn about discoverable vs. non-discoverable credentials and how they affect UX
slug: /passkeys/discoverable-vs-non-discoverable
sidebar_position: 4
---

# Discoverable vs. non-discoverable

Also known as "resident" vs. "non-resident" credentials. From [the spec](https://www.w3.org/TR/webauthn-2/):

> Historically, client-side discoverable credentials have been known as resident credentials or resident keys. Due to the phrases ResidentKey and residentKey being widely used in both the WebAuthn API and also in the Authenticator Model (e.g., in dictionary member names, algorithm variable names, and operation parameters) the usage of resident within their names has not been changed for backwards compatibility purposes. Also, the term resident key is defined here as equivalent to a client-side discoverable credential.

What does this mean exactly?
- "resident" credentials and "discoverable" credentials are the same
- "non-resident" credentials and "non-discoverable" credentials are the same.

The spec authors made this rename for clarity.

With terminology out of the way, what is a "discoverable" credential compared to a "non-discoverable" credential? And why does it matter?

## Discoverable credentials

A discoverable credential is a self-contained key pair, stored on the end-user's device. Discoverable credentials are preferred because keys are self-contained, can easily be synced and can be used across devices independently. Crucially for UX, the end-user is able to list their passkeys and choose which device/passkey they'd like to use:

<img src="/img/passkeys/discoverable_device_choice.png" alt="Device selection on Chrome" width="400px" />
<img src="/img/passkeys/discoverable_passkey_choice.png" alt="Passkey selection on Chrome" width="321px" style={{marginLeft: '10px'}} />

With discoverable credentials you don't have to keep track of credential IDs. Your authentication flow can simply be: "prompt the user with passkey authentication", and let the browser or device native UX handle the rest! The downside is you lose some control over these prompts, because they will vary depending on your users' OS and browser.

For a live example using discoverable credentials, see [wallet.tx.xyz](https://wallet.tx.xyz/).

## Non-Discoverable credentials

A non-discoverable credential, on the other hand, isn’t stored on the end-user's device fully: Turnkey must store the generated credential ID; otherwise the user won’t be able to sign. This is because the actual signing key is a combination of an “on-device” secret and the credential ID. See cryptographic details [here](https://crypto.stackexchange.com/questions/105942/how-do-non-resident-keys-work-in-webauthn). A a high-level, non-discoverable credentials work like a HD wallet with random derivation paths: one seed stored on-device, combined with random credential IDs stored by RPs somewhere else.

Why would you choose non-resident credentials?
- Some older Yubikey models have limited key slots, and they’ll simply refuse to register if you require discoverable credentials. Non-discoverable credentials have a wider support.
- Non-discoverable credentials take less space. This is important in some environments, but unlikely to be relevant if your users are storing passkeys in their Google or Apple accounts (plenty of space available there!)
- Credential IDs have to be communicated during authentication (via the `allowCredentials` field). This allow browsers to offer better, more tailored prompts in some cases. For example: if the list contains a single authenticator with `"transports": ["AUTHENTICATOR_TRANSPORT_INTERNAL"]`, Chrome does “the right thing” by skipping the device selection popup: users go straight to the fingerprint popup, with no need to select “this device”!

The downside to this is, of course, that you need to store credential IDs, and you need to make sure you can retrieve credentials for each user. This can be done with a table of credentials keyed by user email, for example. Or if you have your own authentication already, a list of credentials can be returned when the user logs in.

For a live example using non-discoverable credentials, head to [app.turnkey.com](https://app.turnkey.com). That's right, we use this option because we needed to support older yubikey models. We have some work ongoing to support both discoverable and non-discoverable credentials going forward.
