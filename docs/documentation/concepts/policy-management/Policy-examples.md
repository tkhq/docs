---
position: 100
description: Check out some example policies to help write your own
slug: /concepts/policies/examples
sidebar_label: Examples
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

#### Allow a specific user to sign transactions with a specific wallet account address

```json
{
  "policyName": "Allow <USER_ID> to sign transactions with <WALLET_ID>",
  "effect": "EFFECT_ALLOW",
  "consensus": "approvers.any(user, user.id == '<USER_ID>')",
  "condition": "wallet_account.address == '<WALLET_ACCOUNT_ADDRESS>'"
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

### Ethereum (EVM)

Note: see the [language section](Policy-language.md#appendix) for more details.

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

#### Allow ETH transactions with a specific nonce range

```json JSON
{
  "policyName": "Allow signing Ethereum transactions with an early nonce",
  "effect": "EFFECT_ALLOW",
  "condition": "eth.tx.nonce <= 3"
}
```

### Solana

Note: see the [language section](Policy-language.md#appendix) for various approaches on writing Solana policies.

#### Allow Solana transactions that include a transfer from one specific sender

```json JSON
{
  "policyName": "Enable transactions with a transfer sent by <SENDER_ADDRESS>",
  "effect": "EFFECT_ALLOW",
  "condition": "solana.tx.transfers.all(transfer, transfer.from == '<SENDER_ADDRESS>')"
}
```

#### Allow Solana transactions that include a transfer to only one specific recipient

```json JSON
{
  "policyName": "Enable transactions with a single transfer sent to <RECIPIENT_ADDRESS>",
  "effect": "EFFECT_ALLOW",
  "condition": "solana.tx.transfers.count == 1 && solana.tx.transfers[0].to == '<RECIPIENT_ADDRESS>'"
}
```

#### Allow Solana transactions that have exactly one transfer, to one specific recipient

```json JSON
{
  "policyName": "Enable transactions with a transfer sent to <RECIPIENT_ADDRESS>",
  "effect": "EFFECT_ALLOW",
  "condition": "solana.tx.transfers.all(transfer, transfer.to == '<RECIPIENT_ADDRESS>')"
}
```

#### Allow Solana transactions that only use the Solana System Program

```json JSON
{
  "policyName": "Enable transactions that only use the system program",
  "effect": "EFFECT_ALLOW",
  "condition": "solana.tx.program_keys.all(p, p == '11111111111111111111111111111111')"
}
```

#### Deny all Solana transactions transferring to an undesired address

```json JSON
{
  "policyName": "Reject transactions with a transfer sent to <BAD_ADDRESS>",
  "effect": "EFFECT_DENY",
  "condition": "solana.tx.transfers.any(transfer, transfer.to == '<BAD_ADDRESS>')"
}
```

#### Allow Solana transactions with specific expected instruction data

```json JSON
{
  "policyName": "Enable transactions where the first instruction has precisely <HEX BYTES>",
  "effect": "EFFECT_ALLOW",
  "condition": "solana.tx.instructions[0].instruction_data_hex == '<HEX BYTES>'"
}
```

#### Allow Solana transactions whose first instruction involves a specific address

```json JSON
{
  "policyName": "Enable transactions where the first instruction has a first account involving <ADDRESS>",
  "effect": "EFFECT_ALLOW",
  "condition": "solana.tx.instructions[0].accounts[0].account_key == '<ADDRESS>'"
}
```
