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

A non-discoverable credential isn’t stored on the end-user's device fully: Turnkey must store the generated credential ID; otherwise the user won’t be able to sign. This is because the actual signing key is a combination of an “on-device” secret and the credential ID (see details [here](https://crypto.stackexchange.com/questions/105942/how-do-non-resident-keys-work-in-webauthn)).

Why would you choose non-discoverable credentials?
- Most hardware security keys have limited slots to store discoverable credentials, or will refuse to create new discoverable credentials on the hardware altogether. YubiKey 5 [advertises 25 slots](https://support.yubico.com/hc/en-us/articles/4404456942738-FAQ#h_01FFHQFVBW0995G2MKZGCKQVEJ), SoloKeys [support 50](https://github.com/solokeys/solo1/issues/156#issuecomment-477645573), NitroKeys 3 [support 10](https://github.com/Nitrokey/nitrokey-3-firmware/blob/0e23c75318e2016ac1cfb8345de9279e3ad2eaf9/components/apps/src/lib.rs#L390). Non-discoverable credentials aren't subject to these limits because they work off of a single hardware secret.
- Security keys can only allow clearing of individual slots if they support [CTAP 2.1](https://fidoalliance.org/specs/fido-v2.1-rd-20201208/fido-client-to-authenticator-protocol-v2.1-rd-20201208.html). This is described in [this blog post](https://fy.blackhats.net.au/blog/2023-02-02-how-hype-will-turn-your-security-key-into-junk/). When security keys do not support CTAP 2.1, slots can only be freed up by resetting the hardware entirely, erasing all secrets at once.
- Non-discoverable credentials take less space. This is important in some environments, but unlikely to be relevant if your users are storing passkeys in their Google or Apple accounts (plenty of space available there!)
- Credential IDs have to be communicated during authentication (via the `allowCredentials` field). This allows browsers to offer better, more tailored prompts in some cases. For example: if the list contains a single authenticator with `"transports": ["AUTHENTICATOR_TRANSPORT_INTERNAL"]`, Chrome does “the right thing” by skipping the device selection popup: users go straight to the fingerprint popup, with no need to select “this device”!

The downside to this is, of course, that you need to store credential IDs, and you need to make sure you can retrieve credentials for each user. This can be done with a table of credentials keyed by user email, for example. Or if you have your own authentication already, a list of credentials can be returned when the user logs in.

For a live example using non-discoverable credentials, head to [app.turnkey.com](https://app.turnkey.com). That's right, Turnkey uses non-discoverable credentials because we need to offer broad support for security keys. We have some work ongoing to support both discoverable and non-discoverable credentials going forward.
