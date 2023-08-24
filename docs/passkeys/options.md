---
description: Learn about registration and authentication options
slug: /passkeys/options
sidebar_position: 3
---

# Passkey options

Whether you use the raw browser APIs or one of our helpers you'll have flexibility to set your own registration and authentication options. This page provides an overview and some recommendations related to these options.

## Registration options

Mozilla has good (but lengthy) documentation on each option: [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/CredentialsContainer/create). Below we detail the most relevant options you'll want to think about.

### `challenge`

This is the challenge signed by the end-user for registration. During registration this challenge isn't meaningful so we recommend picking a random challenge. It will not be visible to users.

### `timeout`

Number of seconds before "giving up". The browser will simply show a timeout popup:

<img src="/img/passkeys/timeout.png" alt="authenticatorAttachment unspecified" width="360px"/><br/><br/>

This UI isn't very helpful, so we recommend making the timeout long to minimize user exposure. The less they see this, the better.

### `rp`

The `rp` options is an object with 2 fields: `id` and `name`.

`rp.id` should be your app domain. If your app is hosted on "your.app.xyz" the RPID can be "your.app.xyz" or "app.xyz". Be aware: if you create passkeys on "your.app.xyz", they won't be usable on other subdomains (e.g. "other.app.xyz"). So unless you have good reasons not to, use the top-level domain as the RPID.

`rp.id` will show up in the initial registration popup:

<img src="/img/passkeys/registration_options_rpid.png" alt="RPID in registration prompt" width="360px"/>

`rp.name` doesn't show up in the popup so can be set to anything. We recommend setting it to the correctly capitalized name of your app, in case browsers start showing it in their native UIs in the future.

### `attestation`

This option indicates whether an attestation is needed, to prove the authenticator authenticity. In general, Turnkey doesn't need attestations. Most passkeys do not produce meaningful attestations for privacy reasons. In the context of passkey integrations, you can omit this option: it will default to "none".

### `pubKeyCredParams` and `alg`

The `pubKeyCredParams` is a list of supported algorithms. If you're relying on Turnkey to validate passkey signatures, this list has to be: `[{alg: -7, type: "public-key"}]`.

The `-7` value is an algorithm identifier for P256 with sha256. For other values, see https://www.iana.org/assignments/cose/cose.xhtml#algorithms.

Turnkey currently supports P256 only. In the near future Turnkey will support RSA (`-257`), at which point we'll update our helpers to support both P256 and RSA: `[{alg: -7, type: "public-key"}, {alg: -257, type: "public-key"}]`.

### `user`

The `user` field has three sub-fields:
- `id`: we recommend setting this to a random string. It won't be visible to the end user.
- `name`: this will show up in the passkey list modal (see screenshot below). We recommend setting this to something the user will recognize: their email, the name of your app, or potentially leave this up to the user:<br/>
  <img src="/img/passkeys/user_name_and_display.png" alt="RPID in registration prompt" width="360px"/>
- `displayName`: as far as we can tell this doesn't show up in current browser UIs. It might show up in future iterations so it's best to populate this with the same value as `name`.

### `authenticatorSelection`

This option has lots of consequences for UX, and it has many sub-options, outlined below.

#### `authenticatorAttachment`
This option, if set, restricts the type of authenticators that can be registered.

If set to `platform`, only internal authenticators (face ID, touch ID, and so on) can be registered:

<img src="/img/passkeys/attachment_platform.png" alt="authenticatorAttachment set to platform" width="360px"/><br/><br/>

If set to `cross-platform`, only passkeys from other devices are allowed:

<img src="/img/passkeys/attachment_cross_platform.png" alt="authenticatorAttachment set to cross-platform" width="360px"/><br/><br/>

If you want broad compatibility, leave this option empty, and the browser UI will allow for both internal and external passkeys:

<img src="/img/passkeys/attachment_unspecified.png" alt="authenticatorAttachment unspecified" width="360px"/><br/><br/>


#### `requireResidentKey` and `residentKey`

These options allow you to specify whether you want your users to create discoverable or non-discoverable credentials. See [Discoverable vs. non-discoverable](/passkeys/discoverable-vs-non-discoverable) for more information. Default values: `residentKey` is `discouraged` and `requireResidentKey` is `false`.

#### `userVerification`

This flag defaults to "preferred" and referred to authentication mechanisms on the authenticator itself. If this is set to "required", the browser will prompt the user to create a PIN for their security key. We recommend setting this to "discouraged" or "preferred" to maximize compatibility (some authenticators do not support user verification).


## Authentication options

Mozilla's documentation on authentication options can be found here: [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/CredentialsContainer/get). Luckily there are fewer authentication options than registration.

### `challenge`

This is the challenge to sign with the passkey. If you're integrating with Turnkey, the challenge should be the POST body of the request to be signed. Our SDK and helpers set this automatically for you already.

### `rpId`

Must match the `rp.id` option during passkey registration. Passkeys are domain bound, so it's not possible to use a passkey registered with `rp.id` set to "foo.com" and use it on "bar.com". This is a core anti-phishing counter-measure.

### `allowCredentials`

List of objects restricting which credentials can be used. This is crucial to specify if you're using [non-discoverable credentials](/passkeys/discoverable-vs-non-discoverable#non-discoverable-credentials) or if you want to tailor browser prompts to the right type of transport.

Each object in this list has an ID (the credential ID) and a list of transports (e.g. "hybrid", "internal", "usb", etc).

### `attestation`

See [`attestation`](#attestation) above.

### `timeout`

See [`timeout`](#timeout) above.

## `UserVerification`

See [`UserVerification`](#userverification) above.