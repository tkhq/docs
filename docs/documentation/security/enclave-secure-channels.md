---
sidebar_position: 7
title: Enclave secure channels
description: Learn about Turnkey's enclave to end-user secure channels
slug: /security/enclave-secure-channels
---

# Enclave to end-user secure channels

Turnkey does not trust anything running outside of secure enclaves. See [our approach](./our-approach.md) for more details. When enclaves and end-users need to exchange private information, we've rely on a protocol based on [HPKE](ttps://datatracker.ietf.org/doc/html/rfc9180) to establish a **secure channel**. This channel is a short-lived, one-way communication channel used in the following case:
* **Key import**: the end-user encrypts key material to a Turnkey enclave
* **Key export**: a Turnkey enclave encrypts key material to an end-user
* **Authentication**: a Turnkey enclave encrypts an API key credential to an end-user after authentication

Neither the client or the server should reused keys to send or receive more than one message. We want to avoid the recipient target key being used more then once in order to ensure [forward secrecy](https://en.wikipedia.org/wiki/Forward_secrecy); see [security details](#security-details) section for important details and caveats.

## HPKE Protocol

### Terms

- **Encapsulated Key** ("Encapped Key"): the public key of the sender used for ECDH.
- **Target Key Pair**: the key pair of the receiver that the sender encrypts to the public key of. Only one message should ever be encrypted to the public key.
- **Server**: a server inside of the enclave; normally an enclave application.
- **Client**: a client outside of the enclave; normally a turnkey end user.
- **Enclave HPKE Key Pair**: a key pair derived from the Quorum master seed specifically for the purpose of establishing secure channels with clients.

### Overview

This protocol builds on top of the HPKE standard ([RFC 9180](https://datatracker.ietf.org/doc/html/rfc9180)) by adding recipient pre-flight authentication so the client can verify it is sending ciphertext to a turnkey controlled enclave and the enclave can verify its sending ciphertext to the correct client. See the [security profile](#security-profile) section more details.

### HPKE Configuration

* KEM: `KEM_P256_HKDF_SHA256`
* KDF: `KDF_HKDF_SHA256`
* AEAD: `AEAD_AES256GCM`
* INFO: `turnkey_hpke` (raw bytes)
* Additional Associated Data: `EncappedPublicKey||ReceiverPublicKey`

### Protocol details

#### Server to Client

1. Client generates target pair and sends `clientTargetPub` key to server.
1. Server computes `ciphertext, serverEncappedPub = ENCRYPT(plaintext, clientTargetPub)` and clears `clientTargetPub` from memory.
1. Server computes `serverEncappedPub_sig_enclaveAuthPriv = SIGN(serverEncappedPub, enclaveAuthPriv)`.
1. Server sends `(ciphertext, serverEncappedPub, serverEncappedPub_sig_enclaveAuthPriv)` to client.
1. Client runs `VERIFY(serverEncappedPub, serverEncappedPub_sig_enclaveAuthPriv)`.
1. Client recovers plaintext by computing `DECRYPT(ciphertext, serverEncappedPub, clientTargetPriv)` and the client target pair is cleared from memory. If the target pair is used multiple times we increase the count of messages that an attacker with the compromised target private key can decrypt. There is no hard mechanism to prevent a faulty client from resubmitting the same target public key.

#### Client to Server

1. Client sends request to server for target key.
1. Server generates server target pair and computes `serverTargetPub_sig_enclaveAuthPriv = SIGN(serverTargetPub, enclaveAuthPriv)`.
1. Server sends `(serverTargetPub, serverTargetPub_sig_enclaveAuthPriv)` to client.
1. Client runs `VERIFY(serverTargetPub, serverTargetPub_sig_enclaveAuthPriv)`.
1. Client computes `ciphertext, clientEncappedPub = ENCRYPT(plaintext, serverTargetPub)` and clears serverTargetPub from memory.
1. Client sends `(ciphertext, clientEncappedPub)` to server and the client is cleared from memory.
1. Server recovers plaintext by computing `DECRYPT(ciphertext, clientEncappedPub, clientTargetPriv)` and server target pair is cleared from memory. If the target pair is used multiple times we increase the count of messages that an attacker with the compromised target private key can decrypt.

## Import flow

Turnkey's import functionality works by anchoring import in a **target encryption key** (TEK). This target encryption key is a standard P-256 key pair and is generated in the Turnkey secure enclave via a `INIT_IMPORT_WALLET` or `INIT_IMPORT_PRIVATE_KEY` activity. This TEK is encrypted to the enclave's quorum key and the TEK public key is returned in the activity response, following the protocol above.

The following diagram summarizes the flow:

<p style={{ textAlign: "center" }}>
  <img
    src="/img/wallet_import_cryptography.png"
    alt="import cryptography"
    style={{ height: 280 }}
  />
</p>

The client-side iframe plays the role of the client and encrypts the wallet's mnemonic or private key to the secure enclave using the protocol described above. The encrypted key material is then passed as a parameter inside of a signed `IMPORT_WALLET` or `IMPORT_PRIVATE_KEY` activity. During this activity, the Turnkey enclave uses its key pair to decrypt and import the encrypted key material.

## Export flow

Turnkey's export functionality works by anchoring export in a **target encryption key** (TEK). This target encryption key is a standard P-256 key pair and can be created in many ways: completely offline, or online inside of script using the web crypto APIs.

The following diagram summarizes the flow:

<p style={{ textAlign: "center" }}>
    <img
        src="/img/wallet_export_cryptography.png"
        alt="export cryptography"
        style={{ height: 280 }}
    />
</p>

The client-side iframe plays the role of the server: the public portion of this key pair is passed as a parameter inside of a signed `EXPORT_WALLET`, `EXPORT_PRIVATE_KEY`, or `EXPORT_WALLET_ACCOUNT` activity.

Turnkey's enclave encrypts the private key material (wallet mnemonic or private key) to the end-user's TEK using the protocol described in the previous section.

Once the activity succeeds, the encrypted mnemonic or private key can be decrypted by the end-user only.

## Auth flow

Unlike typical auth and recovery flows in the industry, Turnkey doesn't send unencrypted tokens. We use the protocol above to send credentials to end-users with no man-in-the-middle risk. This ensures that even if the content of an auth email is leaked, an attacker cannot decrypt and use the underlying credential. The following diagram summarizes the email auth flow:

<p style={{ textAlign: "center" }}>
    <img src="/img/email_auth_cryptography.png" alt="email auth cryptography" />
</p>

Our email auth flow works by anchoring on a **target encryption key** (TEK). This target encryption key is a standard P-256 key pair and can be created in many ways: completely offline, or online inside of script using the web crypto APIs.

The public part of this key pair is passed as a parameter inside of a signed `INIT_OTP_AUTH` or `EMAIL_AUTH` activity.

Our enclave creates a fresh P256 key pair ("credential") and encrypts its private key to the recovering user's TEK using the protocol above.

Once the encrypted credential is received via email, it's decrypted where the target public key was originally created. The credential is then ready to be used to sign Turnkey activity requests.

Our OTP flows work similarly, except the bundle is not emailed to the user directly. Instead, it is returned as part of the `OTP_AUTH` activity results.

<p style={{ textAlign: "center" }}>
  <img src="/img/otp_auth_cryptography.png" alt="OTP auth cryptography"/>
</p>

## Security details

### Receiver pre-flight authentication

We achieve recipient authentication for both the server and client:

- **Client to Server**: client verifies that the server's target key is signed by the enclave. This check is critical for import/export flows. If the client accepts key material (e.g. a wallet seed) from a malicious party, they might not realize they have the wrong wallet (compromised seed because known or with bad entropy). If the client encrypts their seed to a malicious party, they lose funds directly. This is NOT required for authentication flows: the client can afford to decrypt and use a bad API key. A bad API key will simply produce an invalid signature when used.
- **Server to Client**: server relies on upstream checks by our policy engine, as well as the overall activity signing scheme to enforce rules that guarantee authenticity of the client's target key. Specifically, when the client sends their target public key, it is sent as part of a signed payload (the activity request), and that payload must be signed with an existing credential persisted in org data.

### Forward secrecy

The underlying HPKE spec does not provide forward secrecy on the recipient side since the target key can be long lived. To improve forward secrecy we specify that the target key should only be used once by the sender and receiver. We cannot enforce this strictly on the client-side because a client may choose to reuse their key.

### Sender authentication

We use `OpMod Base` because the sender's KEM private key is not long lived and thus does not need HPKE authentication. In order for this to be exploited one side's private key data would have to be leaked or an attacker would need to spoof a message from the sender. Turnkey mitigates this attack by layering a signature from an authentication key over payloads that contain ciphertext + encappedPub. Note that in the case of client to server the authentication signature is verified by the our policy engine. Read more about HPKE asymmetric authentication [here](https://datatracker.ietf.org/doc/html/rfc9180#name-authentication-using-an-asy).
