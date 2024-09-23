---
description: A guide to authoring policies with our policy lanugage
slug: /concepts/policies/language
sidebar_label: Language
---

# Policy language

This page provides an overview of how to author policies using our policy language. To begin, we'll need to get familiar with the language's grammar, keywords, and types.

## Grammar

The grammar has been designed for flexibility and expressiveness. We currently support the following operations:

| Operation  | Operators                    | Example                     | Types                    |
| ---------- | ---------------------------- | --------------------------- | ------------------------ |
| logical    | &&, \|\|                     | "true && false"             | (bool, bool) -> bool     |
| comparison | ==, !=, <, >, <=, >=         | "1 < 2"                     | (int, int) -> bool       |
| comparison | ==, !=                       | "'a' != 'b'"                | (string, string) -> bool |
| comparison | in                           | "1 in [1, 2, 3]"            | (T, list<T\>) -> bool    |
| access     | x[<index\>]                  | \[1,2,3\]\[0\]              | (list<T\>) -> T          |
| access     | x[<index\>]                  | "'abc'[0]"                  | (string) -> string       |
| access     | x[<start\>..<end\>]          | \[1,2,3\]\[0..2\]           | (list<T\>) -> (list<T\>) |
| access     | x[<start\>..<end\>]          | "'abc'[0..2]"               | (string) -> string       |
| access     | x.<field\>                   | "user.tags"                 | (struct) -> T            |
| function   | x.all(item, <predicate\>)    | "[1,1,1].all(x, x == 1)"    | (list<T\>) -> bool       |
| function   | x.any(item, <predicate\>)    | "[1,2,3].any(x, x == 1)"    | (list<T\>) -> bool       |
| function   | x.contains(<value\>)         | "[1,2,3].contains(1)"       | (list<T\>) -> bool       |
| function   | x.count()                    | "[1,2,3].count()"           | (list<T\>) -> int        |
| function   | x.filter(item, <predicate\>) | "[1,2,3].filter(x, x == 1)" | (list<T\>) -> (list<T\>) |

## Keywords

Keywords are reserved words that are dynamically interchanged for real values at evaluation time. Each field supports a different set of keywords.

### Consensus

| Keyword       | Type        | Description                              |
| ------------- | ----------- | ---------------------------------------- |
| **approvers** | list<User\> | The users that have approved an activity |

### Condition

| Keyword         | Type                | Description                                  |
| --------------- | ------------------- | -------------------------------------------- |
| **activity**    | Activity            | The activity metadata of the request         |
| **eth.tx**      | EthereumTransaction | The parsed Ethereum transaction payload      |
| **solana.tx**   | SolanaTransaction   | The parsed Solana transaction payload        |
| **wallet**      | Wallet              | The target wallet used in sign requests      |
| **private_key** | PrivateKey          | The target private key used in sign requests |

## Types

The language is strongly typed which makes policies easy to author and maintain.

### Primitive

| Type         | Example       | Notes                                          |
| ------------ | ------------- | ---------------------------------------------- |
| **bool**     | true          |                                                |
| **int**      | 256           | i128                                           |
| **string**   | 'a'           | only single quotes are supported               |
| **list<T\>** | [1, 2, 3]     | a list of type T                               |
| **struct**   | { id: 'abc' } | a key-value map of { field:T } (defined below) |

### Struct

| Struct                  | Field            | Type               | Description                                                                                                                                                                                   |
| ----------------------- | ---------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User**                | id               | string             | The identifier of the user                                                                                                                                                                    |
|                         | tags             | list<string\>      | The collection of tags for the user                                                                                                                                                           |
|                         | email            | string             | The email address of the user                                                                                                                                                                 |
|                         | alias            | string             | The alias of the user                                                                                                                                                                         |
| **Activity**            | type             | string             | The type of the activity (e.g. ACTIVITY_TYPE_SIGN_TRANSACTION_V2)                                                                                                                             |
|                         | resource         | string             | The resource type the activity targets: `USER`, `PRIVATE_KEY`, `POLICY`, `WALLET`, `ORGANIZATION`, `INVITATION`, `CREDENTIAL`, `CONFIG`, `RECOVERY`, `AUTH`, `PAYMENT_ACTION`, `SUBSCRIPTION` |
|                         | action           | string             | The action of the activity: `CREATE`, `UPDATE`, `DELETE`, `SIGN`, `EXPORT`, `IMPORT`                                                                                                          |
| **Wallet**              | id               | string             | The identifier of the wallet                                                                                                                                                                  |
| **PrivateKey**          | id               | string             | The identifier of the private key                                                                                                                                                             |
|                         | tags             | list<string\>      | The collection of tags for the private key                                                                                                                                                    |
| **EthereumTransaction** | from             | string             | The sender address of the transaction                                                                                                                                                         |
|                         | to               | string             | The receiver address of the transaction                                                                                                                                                       |
|                         | data             | string             | The arbitrary data of the transaction (hex-encoded)                                                                                                                                           |
|                         | value            | int                | The amount being sent (in wei)                                                                                                                                                                |
|                         | gas              | int                | The maximum allowed gas for the transaction                                                                                                                                                   |
|                         | gas_price        | int                | The price of gas for the transaction                                                                                                                                                          |
|                         | chain_id         | int                | The chain identifier for the transaction                                                                                                                                                      |
|                         | nonce            | int                | The nonce for the transaction                                                                                                                                                                 |
| **SolanaTransaction**   | account_keys     | list<string\>      | The accounts (public keys) involved in the transaction                                                                                                                                        |
|                         | program_keys     | list<string\>      | The programs (public keys) involved in the transaction                                                                                                                                        |
|                         | instructions     | list<Instruction\> | A list of Instructions (see below)                                                                                                                                                            |
|                         | transfers        | list<Transfer\>    | A list of Transfers (see below)                                                                                                                                                               |
|                         | recent_blockhash | string             | The recent blockhash specified in a transaction                                                                                                                                               |

### Nested Structs

| Struct                 | Field                 | Type                      | Description                                                                                                              |
| ---------------------- | --------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Instruction**        | program_key           | string                    | The program (public key) involved in the instruction                                                                     |
|                        | accounts              | list<Account\>            | A list of Accounts involved in the instruction                                                                           |
|                        | instruction_data_hex  | string                    | Raw hex bytes corresponding to instruction data                                                                          |
|                        | address_table_lookups | list<AddressTableLookup\> | A list of AddressTableLookups used in the instruction. Learn more [here](https://solana.com/docs/advanced/lookup-tables) |
| **Transfer**           | sender                | string                    | A Solana account (public key)                                                                                            |
|                        | recipient             | string                    | A Solana account (public key)                                                                                            |
|                        | amount                | string                    | The native SOL amount for the transfer (lamports)                                                                        |
| **Account**            | account_key           | string                    | A Solana account (public key)                                                                                            |
|                        | signer                | boolean                   | An indicator of whether or not the account is a signer                                                                   |
|                        | writable              | boolean                   | An indicator of whether or not the account can perform a write operation                                                 |
| **AddressTableLookup** | address_table_key     | string                    | A Solana address (public key) corresponding to the address table                                                         |
|                        | writable_indexes      | list<int\>                 | Indexes corresponding to accounts that can perform writes                                                                |
|                        | readonly_indexes      | list<int\>                 | Indexes corresponding to accounts that can only perform reads                                                            |

## Activity Breakdown

| Resource Type    | Action | Activity Type                             |
| ---------------- | ------ | :---------------------------------------- |
| **ORGANIZATION** | CREATE | ACTIVITY_TYPE_CREATE_SUB_ORGANIZATION_V5  |
|                  | UPDATE | ACTIVITY_TYPE_UPDATE_ROOT_QUORUM          |
|                  | UPDATE | ACTIVITY_TYPE_SET_ORGANIZATION_FEATURE    |
|                  | REMOVE | ACTIVITY_TYPE_REMOVE_ORGANIZATION_FEATURE |
| **INVITATION**   | CREATE | ACTIVITY_TYPE_CREATE_INVITATIONS          |
|                  | DELETE | ACTIVITY_TYPE_DELETE_INVITATION           |
|                  | ACCEPT | ACTIVITY_TYPE_ACCEPT_INVITATION_V2        |
| **POLICY**       | CREATE | ACTIVITY_TYPE_CREATE_POLICY_V3            |
|                  | CREATE | ACTIVITY_TYPE_CREATE_POLICIES             |
|                  | UPDATE | ACTIVITY_TYPE_UPDATE_POLICY               |
|                  | DELETE | ACTIVITY_TYPE_DELETE_POLICY               |
| **WALLET**       | CREATE | ACTIVITY_TYPE_CREATE_WALLET               |
|                  | CREATE | ACTIVITY_TYPE_CREATE_WALLET_ACCOUNTS      |
|                  | EXPORT | ACTIVITY_TYPE_EXPORT_WALLET               |
|                  | EXPORT | ACTIVITY_TYPE_EXPORT_WALLET_ACCOUNT       |
|                  | IMPORT | ACTIVITY_TYPE_INIT_IMPORT_WALLET          |
|                  | IMPORT | ACTIVITY_TYPE_IMPORT_WALLET               |
| **PRIVATE_KEY**  | CREATE | ACTIVITY_TYPE_CREATE_PRIVATE_KEYS_V2      |
|                  | CREATE | ACTIVITY_TYPE_CREATE_PRIVATE_KEY_TAG      |
|                  | UPDATE | ACTIVITY_TYPE_UPDATE_PRIVATE_KEY_TAG      |
|                  | DELETE | ACTIVITY_TYPE_DISABLE_PRIVATE_KEY         |
|                  | DELETE | ACTIVITY_TYPE_DELETE_PRIVATE_KEY_TAGS     |
|                  | EXPORT | ACTIVITY_TYPE_EXPORT_PRIVATE_KEY          |
|                  | IMPORT | ACTIVITY_TYPE_INIT_IMPORT_PRIVATE_KEY     |
|                  | IMPORT | ACTIVITY_TYPE_IMPORT_PRIVATE_KEY          |
|                  | SIGN   | ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2         |
|                  | SIGN   | ACTIVITY_TYPE_SIGN_TRANSACTION_V2         |
| **USER**         | CREATE | ACTIVITY_TYPE_CREATE_USERS_V2             |
|                  | CREATE | ACTIVITY_TYPE_CREATE_USER_TAG             |
|                  | CREATE | ACTIVITY_TYPE_CREATE_API_ONLY_USERS       |
|                  | UPDATE | ACTIVITY_TYPE_UPDATE_USER                 |
|                  | UPDATE | ACTIVITY_TYPE_UPDATE_USER_TAG             |
|                  | DELETE | ACTIVITY_TYPE_DELETE_USERS                |
|                  | DELETE | ACTIVITY_TYPE_DELETE_USER_TAGS            |
|                  | UPDATE | ACTIVITY_TYPE_RECOVER_USER                |
| **CREDENTIAL**   | CREATE | ACTIVITY_TYPE_CREATE_API_KEYS             |
|                  | CREATE | ACTIVITY_TYPE_CREATE_AUTHENTICATORS_V2    |
|                  | DELETE | ACTIVITY_TYPE_DELETE_API_KEYS             |
|                  | DELETE | ACTIVITY_TYPE_DELETE_AUTHENTICATORS       |
| **PAYMENT**      | UPDATE | ACTIVITY_TYPE_SET_PAYMENT_METHOD_V2       |
|                  | DELETE | ACTIVITY_TYPE_DELETE_PAYMENT_METHOD       |
| **SUBSCRIPTION** | UPDATE | ACTIVITY_TYPE_ACTIVATE_BILLING_TIER       |
| **CONFIG**       | UPDATE | ACTIVITY_TYPE_UPDATE_ALLOWED_ORIGINS      |
| **RECOVERY**     | UPDATE | ACTIVITY_TYPE_INIT_USER_EMAIL_RECOVERY    |
| **AUTH**         | CREATE | ACTIVITY_TYPE_EMAIL_AUTH                  |
|                  | CREATE | ACTIVITY_TYPE_OAUTH                       |
|                  | CREATE | ACTIVITY_TYPE_CREATE_OAUTH_PROVIDERS      |
|                  | DELETE | ACTIVITY_TYPE_DELETE_OAUTH_PROVIDERS      |
