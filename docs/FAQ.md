---
sidebar_position: 8
slug: /faq
---

# FAQ

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
3. **That the request is legitimate**: this is achieved by parsing the serialized request to make sure the intent is correct. This happens all the way down in our [Secure Enclaves](./Security/Secure-enclaves.md). For example, when you send a request to create a new Private Key, our policy engine parses your original request to independently derive the type of request, the payload to sign, etc. This guards against man-in-the-middle attacks.

Turnkey would not be able to have its enclaves verify signatures and check the request intent if we didn't have your signature on the whole payload.

### How is a Turnkey API key different from a crypto public / private key?

A Turnkey API key is simply a way to authenticate requests to Turnkey. Crypto assets are not tied to it in any way.

Think about Turnkey API keys as an access-gating mechanism to Turnkey functionality. They're flexible in what they can do (you get to decide this with [Policies](./policy-management/Policy-overview.md)!), and revocable if they are lost or compromised.

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

### What happens if I lose my API key? Do I lose my crypto?

Losing your Turnkey API key doesn't mean you'll lose your crypto:

- By default, your API key is not able to move funds
- If you've changed policies so that your API key is allowed to unilaterally move funds, you may be at risk. Leverage the Turnkey UI to revoke your API key as soon as possible.

Talk to our team (<hello@turnkey.com>) if you want to get in touch and talk more in-depth.

### Can I use my existing crypto private key as a Turnkey API key?

You can, but it doesn't mean you should. If you use your existing crypto private key as a turnkey API key, you are coupling Turnkey access with your crypto wallet. In essence, the risk profile of this key goes up. It's a bit like re-using passwords across many sites. Turnkey highly recommends creating a fresh public/private key pair if you need programmatic Turnkey access.

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

### How long is a signed activity request valid for?

We require a recent timestamp in the `timestampMs` field for each new activity submission.

Our secure enclaves have their own, independent, secure source of time. We currently require request timestamps to be **less than an hour old**, and **up to 5 minutes in the future**.

### How do pricing and billing work?

Turnkey is priced per signature, i.e. any transaction or raw payload successfully signed by a private key created on Turnkey. Turnkey offers 25 free signatures each month. To execute more than 25 transactions in a given month, you are required to have a credit card on file or active enterprise plan on your account. To upgrade your plan, navigate to Account Settings from the menu in the top right-hand corner in the Turnkey dashboard and follow the instructions.

For more information about pricing and billing, check out the [pricing page](https://www.turnkey.com/pricing).

### Where else can I get help with my Turnkey implementation?

If you get stuck or have a one-off question, post it to our [developer forum](https://github.com/orgs/tkhq/discussions) or reach out directly to help@turnkey.com. Teams that are looking for more in-depth integration support can upgrade to an Enterprise plan via hello@turnkey.com.

### Is my country supported?

Turnkey is not currently available to users in any countries currently subject to US OFAC sanctions.
