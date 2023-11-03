---
sidebar_position: 2
description: Learn about Policies on Turnkey and how to manage them
slug: /managing-policies/overview
---
# Policy overview

Our policy engine is the foundation for flexible controls and permissions within your organization. This page provides an overview of how to author policies.

## Policy structure

Our policies are defined using **JSON**. The `effect` determines if an activity should be allowed or denied based on the evaluation of the `consensus` and `condition` fields.

`consensus` and `condition` are composed of ergonomic expressions written in our [policy language](/managing-polices/language) that must evaluate to a `bool`.  `consensus` determines which user(s) may take an action (e.g. a given user ID). `condition` determines the conditions under which the policy applies (e.g. signing with a specific private key). These fields can be used alone or together.

#### See below for an example policy that allows a single user to send transactions to a single address

```json JSON
{
  "effect": "EFFECT_ALLOW",
  "consensus": "approvers.any(user, user.id == '4b894565-fa11-42fc-b813-5bf4ea3d53f9')",
  "condition": "eth.tx.to == '<ALLOWED_ADDRESS>'"
}
```

## Policy evaluation

All policies defined within an Organization are evaluated on each request. The image below describes how an activity outcome is determined when resolving multiple policies. The rule follows the below steps:

1. If a quorum of root users takes the action, the final outcome is `OUTCOME_ALLOW`
2. Else if any applicable policy has `EFFECT_DENY`, the final outcome is `OUTCOME_DENY`. This is also referred to as "explicit deny."
3. Else if at least one applicable policy has `EFFECT_ALLOW`, then the final outcome is `OUTCOME_ALLOW`
4. Else the final outcome is `OUTCOME_DENY`. This is also referred to as "implicit deny."

Stated differently:

<p style={{textAlign: 'center'}}>
  <img src="/img/diagrams/policy_overview.png" alt="policy_overview" width="500px" />
</p>

- Root users bypass any policies
- Otherwise, all actions on Turnkey are implicitly denied by default. They have to be explicitly allowed by a policy.
- In cases of conflicts, `EFFECT_DENY` always wins
