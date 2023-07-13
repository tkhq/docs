# Policy Examples

## Access Control

#### Allow a specific user to create private keys

```json JSON
{
  "policyName": "Allow user <USER_ID> to create private keys",
  "effect": "EFFECT_ALLOW",
  "consensus": "approvers.any(user, user.id == '<USER_ID>')",
  "condition": "activity.type == 'ACTIVITY_TYPE_CREATE_PRIVATE_KEYS'"
}
```

#### Allow users with a specific tag to create users

```json JSON
{
  "policyName": "Allow user_tag <USER_TAG_ID> to create private users",
  "effect": "EFFECT_ALLOW",
  "consensus": "approvers.any(user, user.tags.contains('<USER_TAG_ID>'))",
  "condition": "activity.type == 'ACTIVITY_TYPE_CREATE_USERS'"
}
```

#### Require two users with a specific tag to add policies

```json JSON
{
  "policyName": "Require two users with user_tag <USER_TAG_ID> to create policies",
  "effect": "EFFECT_ALLOW",
  "consensus": "approvers.filter(user, user.tags.contains('<USER_TAG_ID>')).count() >= 2",
  "condition": "activity.type == 'ACTIVITY_TYPE_CREATE_POLICY_V3'"
}
```

#### Deny all actions without approval from a user with a specific tag

```json JSON
{
    "policyName": "Only user_tag <USER_TAG_ID> can take actions",
    "effect": "EFFECT_DENY",
    "consensus": "approvers.filter(user, user.tags.contains('<USER_TAG_ID>')).count() < 1",
}    
```

## Signing Control

#### Allow a user to sign transactions with a specific private key

```json
{
    "policyName": "Allow <USER_ID> to sign transactions with <PRIVATE_KEY_ID>",
    "effect": "EFFECT_ALLOW",
    "consensus": "approvers.any(user, user.id == '<USER_ID>')",
    "condition": "activity.type == 'ACTIVITY_TYPE_SIGN_TRANSACTION' && private_key.id == ‘<PRIVATE_KEY_ID>’"
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

#### Deny all sign transactions without two approvals

```json JSON
{
  "policyName": "Allow any two users to sign transactions",
  "effect": "EFFECT_DENY",
  "consensus": "approvers.count() < 2",
  "condition": "activity.type == 'ACTIVITY_TYPE_SIGN_TRANSACTION'"
}
```
