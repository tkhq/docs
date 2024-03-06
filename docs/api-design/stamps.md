---
sidebar_position: 2
description: Creating your first signed request
slug: /api-design/stamps
---

# Stamps

Every request made to Turnkey must include a signature inside a stamp header. Our secure enclave applications use this signature to verify the integrity and authenticity of the request.

### API Keys
To create a valid, API key stamped request follow these steps:
1. SHA256 hash the JSON-encoded POST body
2. Sign the hash with your API key to produce a `signature`
3. Create a JSON-encoded stamp:
    - `publicKey`: the public key of API key
    - `signature`: the signature produced by the API key
    - `scheme`: `SIGNATURE_SCHEME_TK_API_P256`
4. Base64URL encode the stamp
5. Add the encoded string to your request as a `X-Stamp` header

### Webauthn
To create a valid, Webauthn authenticator stamped request follow these steps:
1. SHA256 hash the JSON-encoded POST body
2. Sign the hash with WebAuthn credential.
3. Create a JSON-encoded stamp:
    - `credentialId`: the id of the webauthn authenticator
    - `authenticatorData`: the authenticator data produced by Webauthn assertion
    - `clientDataJson`: the client data produced by the Webauthn assertion
    - `signature`: the signature produced by the Webauthn assertion
4. Base64URL encode the stamp
5. Add the encoded string to your request as a `X-Stamp-Webauthn` header

### Stampers

In practice, you should not have to worry about this step. Our [JS SDK](https://github.com/tkhq/sdk) and [CLI](https://github.com/tkhq/tkcli) take care of stamping for you. However, if you choose to use an independent client, you will need to implement this yourself. For reference, check out our implementations:
- [API Key Stamper](https://github.com/tkhq/sdk/blob/main/packages/api-key-stamper)
- [WebAuthn Stamper](https://github.com/tkhq/sdk/blob/main/packages/webauthn-stamper)
- [React Native Stamper](https://github.com/tkhq/sdk/tree/main/packages/react-native-passkey-stamper)
- [iFrame Stamper](https://github.com/tkhq/sdk/tree/main/packages/iframe-stamper)
- [CLI](https://github.com/tkhq/tkcli/blob/main/src/cmd/turnkey/pkg/request.go)

