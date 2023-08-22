---
description: A guide to authoring policies with our policy lanugage
slug: /managing-polices/language
---
# Policy language
This page provides an overview of how to author policies using our policy language. To begin, we'll need to get familiar with the language's grammar, keywords, and types.

## Grammar

The grammar has been designed for flexibility and expressiveness. We currently support the following operations:

| Operation  | Operators                     | Example                     | Types                            |
| ---------- | ----------------------------- | --------------------------- | -------------------------------- |
| logical    | &&, \|\|                      | "true && false"             | (bool, bool) -> bool             |
| comparison | ==, !=, <, >, <=, >=          | "1 < 2"                     | (int, int)  -> bool              |
| comparison | ==, !=                        | "'a' != 'b'"                | (string, string)  -> bool        |
| comparison | in                            | "1 in [1, 2, 3]"            | (T, list<T\>) -> bool            |
| access     | x[<index\>]                   | \[1,2,3\]\[0\]              | (list<T\>) -> T                  |
| access     | x[<index\>]                   | "'abc'[0]"                  | (string) -> string               |
| access     | x[<start\>..<end\>]           | \[1,2,3\]\[0..2\]           | (list<T\>) -> (list<T\>)         |
| access     | x[<start\>..<end\>]           | "'abc'[0..2]"               | (string) -> string               |
| access     | x.<field\>                    | "user.tags"                 | (struct) -> T                    |
| function   | x.all(item, <predicate\>)     | "[1,1,1].all(x, x == 1)"    | (list<T\>) -> bool               |
| function   | x.any(item, <predicate\>)     | "[1,2,3].any(x, x == 1)"    | (list<T\>) -> bool               |
| function   | x.contains(<value\>)          | "[1,2,3].contains(1)"       | (list<T\>) -> bool               |
| function   | x.count()                     | "[1,2,3].count()"           | (list<T\>) -> int                |
| function   | x.filter(item, <predicate\>)  | "[1,2,3].filter(x, x == 1)" | (list<T\>) -> (list<T\>)         |

## Keywords

Keywords are reserved words that are dynamically interchanged for real values at evaluation time. Each field supports a different set of keywords.

### Consensus

| Keyword       | Type         | Description                              |
| ------------- | ------------ | ---------------------------------------- |
| **approvers** | list<User\>  | The users that have approved an activity |

### Condition

| Keyword         | Type                | Description                                  |
| --------------- | ------------------- | -------------------------------------------- |
| **activity**    | Activity            | The activity metadata of the request         |
| **eth.tx**      | EthereumTransaction | The parsed Ethereum transaction payload      |
| **private_key** | PrivateKey          | The target private key used in sign requests |

## Types

 The language is strongly typed which makes policies easy to author and maintain.

### Primitive

| Type          | Example       | Notes                                          |
| ------------- | ------------- | ---------------------------------------------- |
| **bool**      | true          |                                                |
| **int**       | 256           | i64                                            |
| **string**    | 'a'           | only single quotes are supported               |
| **list<T\>**  | [1, 2, 3]     | a list of type T                               |
| **struct**    | { id: 'abc' } | a key-value map of { field:T } (defined below) |

### Struct

| Struct                  | Field     | Type           | Description                                                                           |
| ----------------------- | --------- | -------------- | ------------------------------------------------------------------------------------- |
| **User**                | id        | string         | The identifier of the user                                                            |
|                         | tags      | list<string\>  | The collection of tags for the user                                                   |
|                         | email     | string         | The email address of the user                                                         |
|                         | alias     | string         | The alias of the user                                                                 |
| **Activity**            | type      | string         | The type of the activity (e.g. ACTIVITY_TYPE_SIGN_TRANSACTION)                        |
|                         | resource  | string         | The target resource of the activity (e.g. USER, PRIVATE_KEY, POLICY, CREDENTIAL, etc) |
|                         | action    | string         | The action of the activity (e.g. CREATE, UPDATE, DELETE, SIGN, etc)                           |
| **PrivateKey**          | id        | string         | The identifier of the private key                                                     |
|                         | tags      | list<string\>  | The collection of tags for the private key                                            |
| **EthereumTransaction** | from      | string         | The sender address of the transaction                                                 |
|                         | to        | string         | The receiver address of the transaction                                               |
|                         | data      | string         | The arbitrary data of the transaction (hex-encoded)                                   |
|                         | value     | int            | The amount being sent (in wei)                                                        |
|                         | gas       | int            | The maximum allowed gas for the transaction                                           |
|                         | gas_price | int            | The price of gas for the transaction                                                  |
|                         | chain_id  | int            | The chain identifier for the transaction                                              |

## Activity Breakdown
| Type                                       | Resource          | Action     | Notes |
| :----------------------------------------- | ---------------   | ---------- | ----- |
| ACTIVITY_TYPE_CREATE_SUB_ORGANIZATION_V2   | ORGANIZATION      | CREATE     |       |
| ACTIVITY_TYPE_CREATE_INVITATIONS           | INVITATION        | CREATE     |       |
| ACTIVITY_TYPE_DELETE_INVITATION            | INVITATION        | DELETE     |       |
| ACTIVITY_TYPE_CREATE_POLICY_V3             | POLICY            | CREATE     |       |
| ACTIVITY_TYPE_UPDATE_POLICY                | POLICY            | UPDATE     |       |
| ACTIVITY_TYPE_DELETE_POLICY                | POLICY            | DELETE     |       |
| ACTIVITY_TYPE_CREATE_PRIVATE_KEYS_V2       | PRIVATE_KEY       | CREATE     |       |
| ACTIVITY_TYPE_CREATE_PRIVATE_KEY_TAG       | PRIVATE_KEY       | CREATE     |       |
| ACTIVITY_TYPE_UPDATE_PRIVATE_KEY_TAG       | PRIVATE_KEY       | UPDATE     |       |
| ACTIVITY_TYPE_DISABLE_PRIVATE_KEY          | PRIVATE_KEY       | DELETE     |       |
| ACTIVITY_TYPE_DELETE_PRIVATE_KEY_TAGS      | PRIVATE_KEY       | DELELE     |       |
| ACTIVITY_TYPE_SIGN_RAW_PAYLOAD             | PRIVATE_KEY       | SIGN       |       |
| ACTIVITY_TYPE_SIGN_TRANSACTION             | PRIVATE_KEY       | SIGN       |       |
| ACTIVITY_TYPE_CREATE_USERS_V2              | USER              | CREATE     |       |
| ACTIVITY_TYPE_CREATE_USER_TAG              | USER              | CREATE     |       |
| ACTIVITY_TYPE_UPDATE_USER                  | USER              | UPDATE     |       |
| ACTIVITY_TYPE_UPDATE_USER_TAG              | USER              | UPDATE     |       |
| ACTIVITY_TYPE_DELETE_USERS                 | USER              | DELETE     |       |
| ACTIVITY_TYPE_DELETE_USER_TAG              | USER              | DELETE     |       |
| ACTIVITY_TYPE_CREATE_API_KEYS              | CREDENTIAL        | CREATE     |       |
| ACTIVITY_TYPE_CREATE_AUTHENTICATORS_V2     | CREDENTIAL        | CREATE     |       |
| ACTIVITY_TYPE_DELETE_API_KEYS              | CREDENTIAL        | DELETE     |       |
| ACTIVITY_TYPE_DELETE_AUTHENTICATORS        | CREDENTIAL        | DELETE     |       |

## Coming soon

Turnkey will expand the policy language significantly over the next few months. Soon you'll have access to new keywords:

- Self-defined variables (e.g., allow arbitrary data to be considered in policy validation)
- Time-based limits (e.g., limit total transaction size over a 24 hour period)
- Dollar-based amount limits based on current price (e.g., limit total $-based transaction amount for a given user type)
