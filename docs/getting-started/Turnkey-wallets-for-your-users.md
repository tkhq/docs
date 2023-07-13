---
sidebar_position: 3
---
# Passkey wallets for your users

Using Turnkey’s flexible infrastructure, you can programmatically create and manage wallets for your end users in a fully customized way, directly embedded into your application with no predefined user interfaces.

Turnkey supports creating both wallets your application controls and wallets controlled by your end users. To create application-controlled wallets, with no approvals required by the end user, the implementation is simple: [create a private key](https://turnkey.readme.io/reference/publicapiservice_createprivatekeys) within your main Turnkey Organization, enable an [API user](https://turnkey.readme.io/reference/publicapiservice_createapionlyusers) to sign transactions on behalf of that private key via [policy](policy-overview), and use your own server to manage the association between your users and private keys created on Turnkey.

The rest of this guide walks through one potential implementation model for creating **wallets fully controlled by your end users**.

_Note that some of this functionality remains under development: All sample code is illustrative._ Reach out to <welcome@turnkey.io> if you’re interested in this implementation model for your own application.

### Overview: Wallets controlled by your end users

Turnkey has built a new model for private key management that utilizes secure enclaves. All transactions are signed within an enclave and private keys are never exposed to Turnkey, your software, or your team. Turnkey’s role is similar to that of a safety deposit box operator — Turnkey secures and provides access to the safety deposit boxes, but our system requires cryptographic proof of ownership to take any action with the keys held within.  

In this example wallet implementation, you will create a segregated sub-organization for each end user, and leverage [passkeys](https://www.passkeys.io/) as cryptographic proof of ownership to ensure only the end user has the ability to approve signing with their private key.

#### Primary Turnkey components

- Passkeys
- Sub-organizations

#### Before you start

Make sure you’ve set up your primary Turkey Organization as well as one or more API-only users that will programmatically manage user onboarding within your application. Check out the [quickstart guide](quickstart) if you need help getting started.

Note also that unlike some wallet providers, Turnkey is not a customer authentication platform. This gives you the ultimate flexibility in creating exactly the user experience you envision. Typically, developers implement their own standard end user authentication flows for user login, then employ passkeys behind that login for transaction signing.

#### Step 1: End user sub-org creation

After the end user is logged in, your application prompts the user for passkey creation on the application domain.

The application then uses an API-only user to create a new sub-organization on behalf of the end user:

```
// Running on Application's API backend

const newOrgId = turnkeyApi.postCreateSubOrganization(userCredential)
persistTurnkeyOrganization(currentUser, newOrgId)
```

Sub-organizations are independent entities; the end user now has sole control over the sub-org and any resources created within it. Your application cannot take any actions on resources within the sub-org without explicitly cryptographic authorization from the end user in the form of a passkey.

The new sub-org ID is persisted by your application.

#### Step 2: Creating a wallet

A user interface on your application prompts users to input their passkey to create a new wallet. This action fires a Turnkey create_private_keys request in the background, creating a new private key within the end user’s sub-org that can only be used for signing with a stamp from their passkey.

```
// Running on Application's frontend

// Set this to be a random UUID for now; but any scheme is acceptable
// (as long as it produces unique names)
const walletId = crypto.randomUUID();

const orgId = TurnkeyOrganizationForCurrentUser();

const payload = return {
  body: {
    timestampMs: String(Date.now()),
    type: "ACTIVITY_TYPE_CREATE_PRIVATE_KEYS",
    organizationId: orgId,
    parameters: {
      privateKeys: [
        {
          privateKeyName: walletId,
          curve: "CURVE_SECP256K1",
          addressFormats: ["ADDRESS_FORMAT_ETHEREUM"],
          privateKeyTags: [],
        },
      ],
    },
  },
};

// This RPID will be visible during passkey prompts
const MY_RPID = "piggybank.com"

const stamp, body = Turnkey.stampWithPasskey(turnkeyRequest, MY_RPID)

PostSignedTurnkeyRequest(stamp, body)
```

#### Step 3: Transaction signing

A user action, for example clicking "Withdraw Rewards," prompts your application to construct a specific transaction on behalf of the end user. The details of this transaction are presented to the user for confirmation, followed by a request for their passkey to sign the Turnkey request. The signed request is then passed to Turnkey.

```
// Running on Application's frontend

const endUserWalletId = GetCurrentUserWalletId();
const endUserOrganizationId = GetCurrentUserOrganizationId();
const constructedTransaction = ConstructTransaction(...);

const turnkeyRequest =  {
  body: {
    timestampMs: String(Date.now()),
    type: "ACTIVITY_TYPE_SIGN_RAW_PAYLOAD",
    organizationId: endUserOrganizationId,
      parameters: {
      privateKeyId: endUserWalletId,
      payload: constructedTransaction,
      encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
      hashFunction: "HASH_FUNCTION_KECCAK_256",
    },
  },
};

// This RPID will be visible during passkey prompts
const MY_RPID = "piggybank.com"

const stamp, body = Turnkey.stampWithPasskey(turnkeyRequest, MY_RPID)

// Forward the payload+stamp to Turnkey
PostSignedTurnkeyRequest(stamp, body)
```

Turnkey will return a signed transaction which your application can broadcast using any provider you'd like.
