---
description: See how passkeys integrate into native applications on iOS and Android
slug: /passkeys/native
sidebar_position: 4
---

# Native passkeys

If you're unfamiliar with passkeys broadly, head to [this introduction](./introduction.md) for an overview. TL;DR: passkeys are cryptographic key pairs generated and stored on secure hardware. Typically this is your Mac's or iPhone's [secure enclave](https://support.apple.com/guide/security/secure-enclave-sec59b0b31ff/web), your Android's [Titan M2 chip](https://security.googleblog.com/2021/10/pixel-6-setting-new-standard-for-mobile.html), or an external security key plugged in via USB.

- Registration ("sign up") creates a new key pair: this is your passkey
- Authentication ("sign in") uses an existing passkey to sign a message, proving ownership of the associated private key stored on your device.

## Passkeys on the Web

Creating and using passkeys on the web is straightforward: browsers offer APIs to do it!

- `navigator.credentials.create` creates a passkey
- `navigator.credentials.get` prompts the user to select a passkey to sign a message

And this doesn't require a backend. Here's a demo proving it: https://passkeyapp.tkhqlabs.xyz/

An important security feature of passkeys: they're **domain-bound** to prevent phishing. In other words: passkeys created on `passkeyapp.tkhqlabs.xyz` won't be usable on `turnkey.com` for example. Browsers prevent this.

## Native Platform APIs

### Android

In the Android ecosystem the `CredentialManager` supports creating and using passkeys with `CreatePublicKeyCredentialRequest` and `GetCredentialRequest`. See [the associated documentation](https://developer.android.com/training/sign-in/passkeys#sign-in) for more information.

### iOS

iOS APIs to create and use passkeys are available as well:

- `ASAuthorizationPlatformPublicKeyCredentialProvider(…).createCredentialRegistrationRequest` for passkey creation
- `ASAuthorizationPlatformPublicKeyCredentialProvider(…).createCredentialAssertionRequest` for passkey usage

See [these docs](https://developer.apple.com/documentation/authenticationservices/asauthorizationplatformpublickeycredentialprovider) for more info. And [this app](https://github.com/r-n-o/shiny) for a mini demo.

### Beware: no native Turnkey SDK (yet)

While the native APIs to interact with passkeys exists on both iOS and Android, Turnkey doesn't yet offer an SDK for Swift or Kotlin, which means you'd have to write code to sign activities and send HTTP requests to our API. Get in touch with us if this is something you're attempting to do, we'd love to support you and release this as a proper SDK maintained by Turnkey.

## Building with React Native (recommended)

Turnkey has a fully-featured [TypeScript SDK](https://github.com/tkhq/sdk/). It provides a type-safe client to call the Turnkey API and abstracts activity request signing.

[React Native](https://reactnative.dev/) lets you write your app in Typescript and compile it into native code for both iOS and Android automatically.

To sign Turnkey requests with native passkeys in a React Native application we've released [`@turnkey/react-native-passkey-stamper`](https://www.npmjs.com/package/@turnkey/react-native-passkey-stamper), a package compatible with our TypeScript client to sign Turnkey requests with native passkeys.

Under the hood this package wraps [`react-native-passkey`](https://github.com/f-23/react-native-passkey), which calls the right native APIs on [iOS](https://github.com/f-23/react-native-passkey/blob/17184a1b1f6f3ac61e07aa784c9b64efb28b570e/ios/Passkey.swift#L29) and [Android](https://github.com/f-23/react-native-passkey/blob/17184a1b1f6f3ac61e07aa784c9b64efb28b570e/android/src/main/java/com/reactnativepasskey/PasskeyModule.kt#L30C44-L30C76), and exports a unified interface that we leverage.

Bottom-line: if you've used our [webauthn stamper](https://www.npmjs.com/package/@turnkey/webauthn-stamper) or [API key stamper](https://www.npmjs.com/package/@turnkey/api-key-stamper), using our React Native passkey stamper will feel familiar. Take a look at the ["Installation"](https://www.npmjs.com/package/@turnkey/react-native-passkey-stamper#installation) and ["Usage"](https://www.npmjs.com/package/@turnkey/react-native-passkey-stamper#usage) sections to get started with passkeys in your React Native application.

If you're looking for a concrete example, head to [this repository](https://github.com/r-n-o/passkeyapp): it contains a sample application integrated with Turnkey, written with Expo, and tested on both Android and iOS.

## Linking apps and web domains

Passkeys on native apps aren't app-bound, they're **domain** bound just like web passkeys. This may come as a surprise: you'll have to configure a web domain to use passkeys natively! Configuration is done separately per ecosystem, but the idea is the same:

- iOS expects a JSON file at the domain root (`/.well-known
/apple-app-site-association`) : [example](https://github.com/r-n-o/passkeyapp/blob/main/http/.well-known/apple-app-site-association)
- Android expects a JSON file at the domain root (`/.well-known/assetlinks.json`): [example](https://github.com/r-n-o/passkeyapp/blob/main/http/.well-known/assetlinks.json)

This unlocks interesting flows where users use their web-created passkeys in a "companion" native app, or vice-versa. For example: a native app linked to the wallet.tx.xyz domain would allow users to log into their account from a native mobile app _using their web-created passkey_ as long as they're synced properly.

Note that these associations are "many-to-many": a website can link multiple associated apps, and a single native application can choose to create passkeys for multiple domains, via a dropdown for example. However (as far as we know) a single passkey is always bound to a single web domain: it can't be bound to multiple web domains.
