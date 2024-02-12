---
sidebar_position: 4
description: Learn about Alchemy's Email Auth implementation
slug: /integration-guides/email-auth-alchemy
---

# Email Auth: Alchemy integration

Now that you've learned about email auth and its implementation details, let's dive into an example case study integration: Alchemy.

## Persistent sessions

By default, Turnkey's email auth architecture aims to isolate credentials in order to prevent an attacker being able to access credentials and have unfettered access to an organization. This is achieved by the separation of the iframe credential and the Turnkey credential. Here are some relevant definitions:

- the iframe credential (also referred to as the embedded key) is a P-256 keypair. It is stored in [local storage](https://github.com/tkhq/frames/blob/82ee1cb3797c1c785226a130a7e06f991246877f/auth/index.html#L123-L134).
- the email auth bundle is an encrypted payload that Turnkey sends to an end-user via email. By itself, it is meaningless. However, upon *decryption*, this is a Turnkey API keypair that can readily sign Turnkey requests.
- the Turnkey credential refers to a keypair that can be used to access Turnkey's API. This credential is safely sent from Turnkey to the iframe via the aforementioned auth bundle, which is to then decrypted by the iframe credential mentioned above. Once the credential is decrypted, it is stored [in-memory](https://github.com/tkhq/frames/blob/82ee1cb3797c1c785226a130a7e06f991246877f/auth/index.html#L853-L854). This is in order to reduce the risk that a webpage or Chrome extension could read them, at which point an attacker would be able to make authenticated requests to Turnkey.

Because these credentials (iframe credential and Turnkey credential) are kept separate, this means that an attacker could not unilaterally access a decrypted Turnkey credential. They would need access to both the iframe credential and the email auth bundle. However, this means that by default, because the Turnkey credential is stored in memory, it is not persisted, which has implications as to long-lived browser sessions.

## Alchemy's approach

Once an end-user shares their encrypted email auth bundle (either by copying/pasting the OTP itself, or by navigating to a magic link containing it), Alchemy stores the encrypted bundle in the browser's local storage. Upon interactions like a page refresh, in order to "regain" an existing session, Alchemy inserts the iframe into the DOM, retrieves the email auth bundle from local storage, and injects that bundle. The result: the email auth bundle is now decrypted, and the iframe now has a Turnkey API key. At this point, that iframe can be used to authenticate requests to Turnkey.
