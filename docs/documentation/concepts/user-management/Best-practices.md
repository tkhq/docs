---
sidebar_position: 5
description: Best practices as you set up users and policies
slug: /concepts/users/best-practices
---

# Best practices

This page describes some best practices to consider as you set up users and policies while getting ready for production.

## Managing users

**Enforce a security policy of least privilege for your users**  
Users on Turnkey should have the minimum required privilege to accomplish their job. When setting up users, consider this for their access type and policies that will grant the user permissions.

**Use user tags to create groups of users with equal permissions**  
Referencing user tags in policies instead of individual users allows for clearer management of permissions.

**When creating new users, consider verifying onboarding before adding tags**  
When inviting a web user to your Turnkey organization, you should consider real-life verification to confirm that they have onboarded correctly before granting that user permissions via tags. Granting tags prior to verification could provide an attacker permissions in your Turnkey organization if they are able to access the signup link.

**Regularly review and remove unused users, user tags, and policies**  
If a user is unused or the user has left your company, you should remove them from your Turnkey organization to avoid compromise.

**Attach multiple authenticators to web users**  
This ensures you don't lose access to the user. If an authenticator is lost or stolen, log in immediately to remove that authenticator from the user, or notify someone in your organization with permissions to delete the user. It's best to use multiple types of authenticators to ensure the security of your account if one fails.

## Protecting API keys

API keys allow programmatic access to Turnkey, and thus anyone with access to your API key has the same level of access to your Turnkey organization as you do. Consider the following to better protect your API keys and Turnkey organization.

**Don't embed API keys directly in your code**  
This reduces the ways that a hacker could acquire your API key. Our SDKs and CLI enable you to reference your API keys so you don't have to put them directly in your code.

**Use different API-only users for different applications**  
This allows you to isolate permissions and differentiate activities between those applications. In the case that an API key is lost or stolen, it also allows you to revoke access solely for the affected application.

**Use a secret management system to protect your API keys**  
Tools like Hashicorp Vault or AWS KMS can help you protect your API key from malicious access.

**Regularly remove any unused API keys**  
This reduces the chance that an old key can be used to access your Turnkey organization.

## Setting up policies

**Apply least-privilege permissions**  
Turnkey's policy engine allows you to enforce permissions at a fine-grained level. When setting up your account, we suggest you use the principle of least privilege, meaning that a user only has the minimum permissions that are necessary to perform their job. Create policies that ensure that users have least-privilege permissions.

**Apply consensus to sensitive actions**  
Sensitive actions like changing policies or signing transactions should be carefully controlled as they can lead to funds being moved off of the platform. You can apply consensus to actions like this to ensure that multiple approvals are required. For example, the policy below specifies that 2 total approvals, including the initiating approval, are required to create a new policy.

```json
{
  "policyName": "Require 2 approvers for creating a policy",
  "effect": "EFFECT_ALLOW",
  "consensus": "approvers.count() >= 2",
  "condition": "activity.type == 'ACTIVITY_TYPE_CREATE_POLICY_V3'"
}
```

**Be especially careful with the ability to add policies**  
Within this principle of least privilege,

Some actions should be treated more sensitively:

- Adding policies
- Signing transactions

**Use allowlisting if you only send to a set of addresses**  
If your use case for Turnkey only requires you to send funds to a certain set of crypto addresses, you should set a policy that allowlists those addresses. See below for an example policy.

```json
{
  "policyName": "ETH address whitelist",
  "effect": "EFFECT_ALLOW",
  "condition": "eth.tx.to == '<ALLOWED_ADDRESS>'"
}
```
