---
description: Check out some example policies to help write your own
slug: /managing-policies/examples
---

# Policy examples

## Access control

#### Allow a specific user to create wallets

```json JSON
{
  "policyName": "Allow user <USER_ID> to create wallets",
  "effect": "EFFECT_ALLOW",
  "consensus": "approvers.any(user, user.id == '<USER_ID>')",
  "condition": "activity.resource == 'WALLET' && activity.action == 'CREATE'"
}
```

#### Allow users with a specific tag to create users

```json JSON
{
  "policyName": "Allow user_tag <USER_TAG_ID> to create users",
  "effect": "EFFECT_ALLOW",
  "consensus": "approvers.any(user, user.tags.contains('<USER_TAG_ID>'))",
  "condition": "activity.resource == 'USER' && activity.action == 'CREATE'"
}
```

#### Require two users with a specific tag to add policies

```json JSON
{
  "policyName": "Require two users with user_tag <USER_TAG_ID> to create policies",
  "effect": "EFFECT_ALLOW",
  "consensus": "approvers.filter(user, user.tags.contains('<USER_TAG_ID>')).count() >= 2",
  "condition": "activity.resource == 'POLICY' && activity.action == 'CREATE'"
}
```

#### Deny all delete actions for users with a specific tag

```json JSON
{
  "policyName": "Only user_tag <USER_TAG_ID> can take actions",
  "effect": "EFFECT_DENY",
  "consensus": "approvers.any(user, user.tags.contains('<USER_TAG_ID>'))",
  "condition": "activity.action == 'DELETE'"
}
```

#### Allow a specific user (e.g. API-only user) to create a sub-org

```json JSON
{
  "policyName": "Allow user <USER_ID> to create a sub-org",
  "effect": "EFFECT_ALLOW",
  "consensus": "approvers.any(user, user.id == '<YOUR_API_USER_ID>')",
  "condition": "activity.resource == 'ORGANIZATION' && activity.action == 'CREATE'"
}
```

#### Allow a specific user to initiate user email recovery

```json JSON
{
  "policyName": "Allow user <USER_ID> to initiate user email recovery",
  "effect": "EFFECT_ALLOW",
  "consensus": "approvers.any(user, user.id == '<YOUR_API_USER_ID>')",
  "condition": "activity.resource == 'RECOVERY' && activity.action == 'CREATE'"
}
```

#### Allow a specific user to initiate email auth

```json JSON
{
  "policyName": "Allow user <USER_ID> to initiate email auth",
  "effect": "EFFECT_ALLOW",
  "consensus": "approvers.any(user, user.id == '<YOUR_API_USER_ID>')",
  "condition": "activity.resource == 'AUTH' && activity.action == 'CREATE'"
}
```

## Signing control

#### Allow a specific user to sign transactions with a specific wallet

```json
{
  "policyName": "Allow <USER_ID> to sign transactions with <WALLET_ID>",
  "effect": "EFFECT_ALLOW",
  "consensus": "approvers.any(user, user.id == '<USER_ID>')",
  "condition": "wallet.id == '<WALLET_ID>'"
}
```

#### Allow a specific user to sign transactions with a specific private key

```json
{
  "policyName": "Allow <USER_ID> to sign transactions with <PRIVATE_KEY_ID>",
  "effect": "EFFECT_ALLOW",
  "consensus": "approvers.any(user, user.id == '<USER_ID>')",
  "condition": "private_key.id == '<PRIVATE_KEY_ID>'"
}
```

#### Allow ERC-20 transfers for a specific token smart contract

```json JSON
{
  "policyName": "Enable ERC-20 transfers for <CONTRACT_ADDRESS>",
  "effect": "EFFECT_ALLOW",
  "condition": "eth.tx.to == '<CONTRACT_ADDRESS>' && eth.tx.data[0..10] == '0xa9059cbb'"
}
```

#### Allow anyone to sign transactions for testnet (Sepolia)

```json JSON
{
  "policyName": "Allow signing ethereum sepolia transactions",
  "effect": "EFFECT_ALLOW",
  "condition": "eth.tx.chain_id == 11155111"
}
```
