---
sidebar_position: 2
description: Creating your first signed request
slug: /api-overview/stamps
---

# Stamps

Every request made to Turnkey must include a signature over the POST body attached as a HTTP header. Our secure enclave applications use this signature to verify the integrity and authenticity of the request.

### API Keys

To create a valid, API key stamped request follow these steps:

1. Sign the JSON-encoded POST body with your API key to produce a `signature` (DER-encoded)
2. Hex encode the `signature`
3. Create a JSON-encoded stamp:
   - `publicKey`: the public key of API key
   - `signature`: the signature produced by the API key
   - `scheme`: `SIGNATURE_SCHEME_TK_API_P256`
4. Base64URL encode the stamp
5. Attach the encoded string to your request as a `X-Stamp` header
6. Submit the stamped request to Turnkey's API

### WebAuthn

To create a valid, Webauthn authenticator stamped request follow these steps:

1. Base64-encode the SHA256 hash of the JSON-encoded POST body -- this is considered the **challenge**
2. Include the challenge amongst WebAuthn signing options. Refer to the existing stamper implementations in the [following section](#stampers)) for examples
3. Create a JSON-encoded stamp:
   - `credentialId`: the id of the webauthn authenticator
   - `authenticatorData`: the authenticator data produced by Webauthn assertion
   - `clientDataJson`: the client data produced by the Webauthn assertion
   - `signature`: the signature produced by the Webauthn assertion
4. Attach the JSON-encoded stamp to your request as a `X-Stamp-Webauthn` header
   - Header names are case-insensitive (so `X-Stamp-Webauthn` and `X-Stamp-WebAuthn` are considered equivalent)
   - Unlike API key stamps, the format is just JSON; no base64URL encoding necessary!
5. Submit the stamped request to Turnkey's API. If you would like your client request to be proxied through a backend, refer to the patterns mentioned [here](../../documentation/features/passkeys/integration.md#proxying-signed-requests). An example application that uses this pattern can be found at wallet.tx.xyz (code [here](https://github.com/tkhq/demo-passkey-wallet/))

### Stampers

Our [JS SDK](https://github.com/tkhq/sdk) and [CLI](https://github.com/tkhq/tkcli) abstract request stamping for you. If you choose to use an independent client, you will need to implement this yourself. For reference, check out our implementations:

- [API Key Stamper](https://github.com/tkhq/sdk/blob/main/packages/api-key-stamper)
- [WebAuthn Stamper](https://github.com/tkhq/sdk/blob/main/packages/webauthn-stamper)
- [React Native Stamper](https://github.com/tkhq/sdk/tree/main/packages/react-native-passkey-stamper)
- [iFrame Stamper](https://github.com/tkhq/sdk/tree/main/packages/iframe-stamper)
- [CLI](https://github.com/tkhq/tkcli/blob/main/src/cmd/turnkey/pkg/request.go)
