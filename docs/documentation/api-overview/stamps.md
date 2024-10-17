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

1. Compute the webauthn challenge by hashing the POST body bytes (JSON encoded) with SHA256. For example, if the POST body is `{"organization_id": "1234", "type": "ACTIVITY_TYPE_CREATE_API_KEYS", "params": {"for": "example"}`, the webauthn challenge is the string `7e8b4653fc7e51dc119cea031942f4693b4742ceca4dda269b925802b38b2147`
2. Include the challenge amongst WebAuthn signing options. Refer to the existing stamper implementations in the [following section](#stampers)) for examples

- Note that if you need to pass the challenge as bytes, you'll need to utf8-encode the challenge string (in JS, the challenge bytes will be `TextEncoder().encode("7e8b4653fc7e51dc119cea031942f4693b4742ceca4dda269b925802b38b2147")`)
- Additional note for React Native contexts: the resulting string should then additionally be base64-encoded. See [implementation](https://github.com/tkhq/sdk/blob/b52db566e79a65eec8d8e7066053d6a3ac5f3943/packages/react-native-passkey-stamper/src/util.ts#L5-L10)

3. Create a JSON-encoded stamp:
   - `credentialId`: the id of the webauthn authenticator
   - `authenticatorData`: the authenticator data produced by Webauthn assertion
   - `clientDataJson`: the client data produced by the Webauthn assertion
   - `signature`: the signature produced by the Webauthn assertion
4. Attach the JSON-encoded stamp to your request as a `X-Stamp-Webauthn` header
   - Header names are case-insensitive (so `X-Stamp-Webauthn` and `X-Stamp-WebAuthn` are considered equivalent)
   - Unlike API key stamps, the format is just JSON; no base64URL encoding necessary! For example: `X-Stamp-Webauthn: {"authenticatorData":"UaQZ...","clientDataJson":"eyJ0...","credentialId":"Grf...","signature":"MEQ..."}`
5. Submit the stamped request to Turnkey's API. If you would like your client request to be proxied through a backend, refer to the patterns mentioned [here](../../documentation/features/passkeys/integration.md#proxying-signed-requests). An example application that uses this pattern can be found at wallet.tx.xyz (code [here](https://github.com/tkhq/demo-embedded-wallet/))

### Stampers

Our [JS SDK](https://github.com/tkhq/sdk) and [CLI](https://github.com/tkhq/tkcli) abstract request stamping for you. If you choose to use an independent client, you will need to implement this yourself. For reference, check out our implementations:

- [API Key Stamper](https://github.com/tkhq/sdk/blob/main/packages/api-key-stamper)
- [WebAuthn Stamper](https://github.com/tkhq/sdk/blob/main/packages/webauthn-stamper)
- [React Native Stamper](https://github.com/tkhq/sdk/tree/main/packages/react-native-passkey-stamper)
- [iFrame Stamper](https://github.com/tkhq/sdk/tree/main/packages/iframe-stamper)
- [CLI](https://github.com/tkhq/tkcli/blob/main/src/cmd/turnkey/pkg/request.go)

Our CLI has a `--no-post` option to generate stamps without sending anything over the network. This is a useful tool should you have trouble with debugging stamping-related logic. A sample command might look something like:

```
turnkey request --no-post --host api.turnkey.com --path /api/v1/sign --body '{"payload": "hello from TKHQ"}'
{
   "curlCommand": "curl -X POST -d'{\"payload\": \"hello from TKHQ\"}' -H'X-Stamp: eyJwdWJsaWNLZXkiOiIwMzI3YTUwMDMyZTZmMDYzMWQ1NjA1YjZhZGEzMmI3NzkwNzRmMzQ2ZTgxYjY4ZTEyODAxNjQwZjFjOWVlMDNkYWUiLCJzaWduYXR1cmUiOiIzMDQ0MDIyMDM2MjNkZWZkNjE4ZWIzZTIxOTk3MDQ5NjQwN2ViZTkyNDQ3MzE3ZGFkNzVlNDEyYmQ0YTYyNjdjM2I1ZTIyMjMwMjIwMjQ1Yjc0MDg0OGE3MmQwOGI2MGQ2Yzg0ZjMzOTczN2I2M2RiM2JjYmFkYjNiZDBkY2IxYmZiODY1NzE1ZDhiNSIsInNjaGVtZSI6IlNJR05BVFVSRV9TQ0hFTUVfVEtfQVBJX1AyNTYifQ' -v 'https://api.turnkey.com/api/v1/sign'",
   "message": "{\"payload\": \"hello from TKHQ\"}",
   "stamp": "eyJwdWJsaWNLZXkiOiIwMzI3YTUwMDMyZTZmMDYzMWQ1NjA1YjZhZGEzMmI3NzkwNzRmMzQ2ZTgxYjY4ZTEyODAxNjQwZjFjOWVlMDNkYWUiLCJzaWduYXR1cmUiOiIzMDQ0MDIyMDM2MjNkZWZkNjE4ZWIzZTIxOTk3MDQ5NjQwN2ViZTkyNDQ3MzE3ZGFkNzVlNDEyYmQ0YTYyNjdjM2I1ZTIyMjMwMjIwMjQ1Yjc0MDg0OGE3MmQwOGI2MGQ2Yzg0ZjMzOTczN2I2M2RiM2JjYmFkYjNiZDBkY2IxYmZiODY1NzE1ZDhiNSIsInNjaGVtZSI6IlNJR05BVFVSRV9TQ0hFTUVfVEtfQVBJX1AyNTYifQ"
}
```
