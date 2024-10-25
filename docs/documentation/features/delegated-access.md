---
sidebar_position: 9
description: Learn about setting up delegated access to user wallets on Turnkey.
slug: /features/delegated-access
---

# Delegated access

With Turnkey you can create multi-user accounts with flexible co-ownership controls. This primitive enables you to establish delegated access to a user’s wallet, reducing or removing the need for them to manually approve each action. You can provide a smoother user experience while ensuring that end-users maintain full control over their wallets.

To set up delegated access, here’s one example of how you can create a limited-permissions user within the end-user’s sub-organization:

### Step 1: Create a sub-organization with two root users

- Create your sub-organization with the two root users being:
  - The end-user
  - A user you control (let’s call it the ‘Service Account’)

```sh
{
  "type": "ACTIVITY_TYPE_CREATE_SUB_ORGANIZATION_V7",
  "timestampMs": "<time-in-ms>",
  "organizationId": "your-organization-id",
  "parameters": {
    "subOrganizationName": "<sub-org-name>",
    "rootUsers": [
      {
        "userName": "<end-user-name>",
        "userEmail": "enduser@example.com",
        "authenticators": [
          {
            "authenticatorName": "<passkey-name>",
            "challenge": "<webauthn-challenge>",
            "attestation": {
              "credentialId": "<credential-id>",
              "clientDataJson": "<client-data-json>",
              "attestationObject": "<attestation-object>",
              "transports": ["AUTHENTICATOR_TRANSPORT_HYBRID"]
            }
          }
        ],
        "apiKeys": [],
	  "oidcProviders": []
      },
      {
        "userName": "Service Account",
        "userEmail": "<email>(optional)",
        "authenticators": [],
        "apiKeys": [
          {
            "apiKeyName": "<service-account-api-key-name>",
            "publicKey": "<service-account-api-public-key>"
          }
        ],
	  "oidcProviders": []
      }
    ],
    "rootQuorumThreshold": 1,
    "wallet": {
      "walletName": "Default ETH Wallet",
      "accounts": [
        {
          "curve": "CURVE_SECP256K1",
          "pathFormat": "PATH_FORMAT_BIP32",
          "path": "m/44'/60'/0'/0/0",
          "addressFormat": "ADDRESS_FORMAT_ETHEREUM"
        }
      ]
    }
  }
}
```

### Step 2: Create a new Delegated Access user using the Service Account

- Create a new user, the ‘Delegated Account’
- Create a custom policy granting the Delegated Account specific permissions. You might grant that user permissions to:
  - Sign any transaction
  - Sign only transactions to a specific address
  - Create new users in the sub-org
  - Or any other activity you want to be able to take using your Delegated Account

Here’s one example, creating a Delegated Account that only has permission to sign transactions to a specific receiver address:

```sh
// 1. Create the Delegated Account
{
  "type": "ACTIVITY_TYPE_CREATE_USER",
  "timestampMs": "<time-in-ms>",
  "organizationId": "sub-organization-id",
  "parameters": {
    "userName": "Delegated Account",
    "apiKeys": [
      {
        "apiKeyName": "Delegated Account API Key",
        "publicKey": "DELEGATED_ACCOUNT_PUBLIC_KEY"
      }
    ]
  }
}

// 2. Create a policy for the Delegated Account
{
  "type": "ACTIVITY_TYPE_CREATE_POLICY",
  "timestampMs": "<time-in-ms>",
  "organizationId": "sub-organization-id",
  "parameters": {
    "policyName": "Allow Delegated Account to sign transactions to specific address",
    "policy": {
      "effect": "EFFECT_ALLOW",
      "consensus": "approvers.any(user, user.id == <DELEGATED_ACCOUNT_USER_ID>)",
      "condition": "eth.tx.to == <RECIPIENT_ADDRESS>"
    },
  }
}
```

### Step 3: Remove the Service Account from the root quorum.

- Using the Service Account:
  - Create a new policy that explicitly grants the Service Account permission to delete users. This is necessary because, once removed from the Root Quorum, the Service Account will have no permissions by default.
  - [Update the root quorum](https://docs.turnkey.com/api#tag/Organizations/operation/UpdateRootQuorum) to remove the Service Account from the root quorum
  - Delete the Service Account user from the organization

After completing these steps, the sub-organization will have two users: the end-user (the only root-user) and the Delegated Account user, which has the permissions granted earlier.
