---
sidebar_position: 100
slug: /faq
---

# FAQ

## Authentication and credentials

### Can I sign up for Turnkey multiple times with the same email?

When you authenticate to the Turnkey dashboard, your email is used to lookup your organization and associated credentials. Currently we do not allow multiple users to be associated with the same email address.

### Why do you require a public / private key pair to access Turnkey API?

Asymmetric cryptography offers various security benefits to you:

- Turnkey _cannot_ leak your API private keys, even if compromised, because Turnkey only knows your API public keys.
- Your API private key stays on the server you generated it for. This means there's a lower risk of key exfiltration compared to other methods where an API key, or API credentials in general, are generated in one place (web browser, company server), transported via a second (copy/paste, email, PDF document) and used in a third place (your server).

### Why do I need to sign the whole POST body?

Signing the whole payload is a way for Turnkey to know:

- That you are in possession of your API key (because we can verify the signature you attach to requests).
- That the person or program signing is approving the current request (not just any request).

Concretely, Turnkey needs the following:

1. **The original request you sent**: this is achieved by simply receiving the HTTP request and its body
2. **That your API key was used to approve the request**: this is achieved by checking the signature contained in the `X-Stamp` header. For this verification we need the serialized POST body, your API public key, and the signature. This is all contained in the header value.
3. **That the request is legitimate**: this is achieved by parsing the serialized request to make sure the intent is correct. This happens all the way down in our [Secure Enclaves](/Security/Secure-enclaves). For example, when you send a request to create a new Private Key, our policy engine parses your original request to independently derive the type of request, the payload to sign, etc. This guards against man-in-the-middle attacks.

Turnkey would not be able to have its enclaves verify signatures and check the request intent if we didn't have your signature on the whole payload.

### How is a Turnkey API key different from a crypto public / private key?

A Turnkey API key is simply a way to authenticate requests to Turnkey. Crypto assets are not tied to it in any way.

Think about Turnkey API keys as an access-gating mechanism to Turnkey functionality. They're flexible in what they can do (you get to decide this with [Policies](/concepts/policies/overview)!), and revocable if they are lost or compromised.

### What happens if I lose my API key? Do I lose my crypto?

Losing your Turnkey API key doesn't mean you'll lose your crypto:

- By default, your API key is not able to move funds
- If you've changed policies so that your API key is allowed to unilaterally move funds, you may be at risk. Leverage the Turnkey UI to revoke your API key as soon as possible.

Talk to our team (<hello@turnkey.com>) if you want to get in touch and talk more in-depth.

### How long is a signed activity request valid for?

We require a recent timestamp in the `timestampMs` field for each new activity submission.

Our secure enclaves have their own, independent, secure source of time. We currently require request timestamps to be **less than an hour old**, and **up to 5 minutes in the future**.

### Can I use my existing crypto private key as a Turnkey API key?

You can, but it doesn't mean you should. If you use your existing crypto private key as a turnkey API key, you are coupling Turnkey access with your crypto wallet. In essence, the risk profile of this key goes up. It's a bit like re-using passwords across many sites. Turnkey highly recommends creating a fresh public/private key pair if you need programmatic Turnkey access.

### How can I safely rotate API key credentials?

While we don't have an off the shelf recipe, one potential approach is:

- At sub-org creation, create your root user with 2+ API keys. One for day-to-day signing, and the other(s) securely stored.
- If the day-to-day key is leaked, then you can use one of the secure, additional keys to remove it from all impacted sub-orgs via `ACTIVITY_TYPE_DELETE_API_KEYS`.

Reach out to our team (<hello@turnkey.com>) for additional guidance.

## Limits

### Are there limits on how many resources I can create, or activities I can execute?

See [resource limits](./getting-started/resource-limits).

### Do you have any rate limits in place in your public API?

Our public API currently limits users to a maximum of 60 RPS (Requests Per Second). Specific headers are returned to indicate current quota:

- `ratelimit-limit`: indicates the total quota (60)
- `ratelimit-remaining`: indicates the current quota
- `x-rate-limit-request-forwarded-for` and `x-rate-limit-request-remote-addr`: echo back your remote IP and forwarded-for IP for debugging purposes

When rate limits are exceeded, an error with HTTP 429 is returned with the following message: `Too many requests. Please wait and try again in a few seconds`.

This limit is on a **per IP address** basis: if you have multiple servers making requests to the turnkey API under a different IP address, each server is subject to the 60 RPS limit individually.

Please get in touch with us (<help@turnkey.com>) if you need this limit adjusted for your use-case.

## Supported functionality

### Which cryptographic curves do you support?

Turnkey currently supports secp256k1 and ed25519.

### Which cryptocurrencies do you support?

Turnkey's primitive for private keys is cryptographic curves, not specific cryptocurrencies. This means that if Turnkey supports the cryptographic curve used by a given cryptocurrency, you can use Turnkey private keys to store and sign for that asset.

We have deeper support for common Ethereum use cases in our API and SDKs, including address derivation and scripts to help you construct simple transactions.

If there are specific cryptocurrencies you'd like to see us offer deeper support for, please let us know by contacting us at <hello@turnkey.com>.

### Do you support transaction construction and broadcast?

Turnkey does not offer native support for transaction construction and broadcast, instead we focus on transaction signing.

We suggest you use blockchain-specific libraries, like Ethers.js for Ethereum, to construct transactions. We offer simple [scripts](https://github.com/tkhq/sdk/tree/main/examples/with-ethers/) leveraging `ethers.js` to help you with basic transaction construction.

You can use any blockchain node provider, like Infura or Alchemy, to broadcast your transactions.

### What does `HASH_FUNCTION_NO_OP` mean?

In the ECDSA context, messages are hashed before signing. Turnkey can perform this hashing for you, as we support two hash functions: `HASH_FUNCTION_KECCAK256` and `HASH_FUNCTION_SHA256` (for Ethereum and Bitcoin ecosystems respectively). If your message had already been hashed, you should use the `HASH_FUNCTION_NO_OP` option to sign the raw hash, in which case Turnkey will sign the payload as is. `HASH_FUNCTION_NO_OP` also has privacy implications: if a raw hashed message is passed in, Turnkey has no knowledge of the underlying pre-image.

As an example, in our Viem package, the message is [hashed](https://github.com/tkhq/sdk/blob/673442f025990fde6a37436bed987b42e694a64d/packages/viem/src/index.ts#L201) before [signing](https://github.com/tkhq/sdk/blob/673442f025990fde6a37436bed987b42e694a64d/packages/viem/src/index.ts#L348).

### What is `HASH_FUNCTION_NOT_APPLICABLE` and how does it differ from `HASH_FUNCTION_NO_OP`?

Unlike ECDSA, in which a message is hashed as a separate step _before_ signing, when using Ed25519, hashing is performed _during_ signature computation, and thus cannot be skipped (for more details on the standard, see [RFC 8032](https://datatracker.ietf.org/doc/html/rfc8032#section-5.1): `“Ed25519 is EdDSA instantiated with: …H(x) = SHA-512"`). As a result, we have a special `HASH_FUNCTION_NOT_APPLICABLE` option for when you use ed25519/EdDSA.

An example for this case can be found in our [Solana signer](https://github.com/tkhq/sdk/blob/d9ed2aefc92d298826a40e821f959b019ea1936f/packages/solana/src/index.ts#L64).

## Guidance

### Do you have a status page?

Yes, we report critical incidents at [turnkey-status.com](https://www.turnkey-status.com/).

### How do you recommend testing the Turnkey API and functionality safely?

Typically we recommend that you create "test" organizations to test the API and functionality freely. When you are ready to go to production, use a "main" organization used for production only.

To do this you can use email aliases: if `firstname@domain.com` is your email, you can sign up for a new Turnkey organization with `firstname+test@domain.com` to have a test playground.

If you need many test organizations or if you have specific questions, our team is happy to help you get set up.

### How do pricing and billing work?

Turnkey is priced per signature, i.e. any transaction or raw payload successfully signed by a private key created on Turnkey. Turnkey offers 25 free signatures each month. To execute more than 25 transactions in a given month, you are required to have a credit card on file or active enterprise plan on your account. To upgrade your plan, navigate to Account Settings from the menu in the top right-hand corner in the Turnkey dashboard and follow the instructions.

For more information about pricing and billing, check out the [pricing page](https://www.turnkey.com/pricing).

### Where else can I get help with my Turnkey implementation?

Join our slack community [here](https://join.slack.com/t/clubturnkey/shared_invite/zt-2837d2isy-gbH60kJ~XnXSSFHiqVOrqw) to get support with your integration, share product feedback, and connect with other crypto builders. Or, reach out directly to help@turnkey.com. Teams that are looking for more in-depth integration support can upgrade to an Enterprise plan via hello@turnkey.com.

### Is my country supported?

Turnkey is not currently available to users in any countries currently subject to US OFAC sanctions.
