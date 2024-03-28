---
sidebar_position: 1
description: Learn about Organizations on Turnkey
slug: /concepts/organizations
---

# Organizations

An organization is a logical grouping of resources (e.g. users, policies, wallets). These resources can only be accessed by authorized and permissioned users within the organization. Resources are not shared between organizations.

## Root Quorum

All organizations are controlled by a [Root Quorum](/users/root-quorum) which contains the root users and the required threshold of approvals to take any action. Only the root quorum can update the root quorum or feature set.

## Features

Organizations can opt-in or opt-out of the following features:

| Name                          | Description                                   | Default  | Notes                                                                                                                                                                                                                                                                              |
| ----------------------------- | --------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FEATURE_NAME_EMAIL_AUTH       | Enables email authentication activities       | Enabled  | Can only be initiated by a parent organization for a sub-organization.                                                                                                                                                                                                             |
| FEATURE_NAME_EMAIL_RECOVERY   | Enables email recovery activities             | Enabled  | Can only be initiated by a parent organization for a sub-organization.                                                                                                                                                                                                             |
| FEATURE_NAME_WEBAUTHN_ORIGINS | The origin Webauthn credentials are scoped to | Disabled | Parent organization feature applies to all sub-organizations. <br></br><br></br> If not enabled, sub-organizations default to allowing all origins: "\*". For Passkey WaaS, we highly recommend enabling this feature. <br></br><br></br> Example value: "https://www.turnkey.com" |
| FEATURE_NAME_WEBHOOK          | A URL to receive activity notification events | Disabled | This feature is currently experimental. <br></br><br></br> Example value: "https://your.service.com/webhook"                                                                                                                                                                       |

## Permissions

All activity requests are subject to enforcement by Turnkey's policy engine. The policy engine determines if a request is allowed by checking the following:

- Does this request violate our feature set?
  - Email recovery cannot be initiated if disabled
  - Email auth cannot be initiated if disabled
- Should this request be denied by default?
  - All import requests must target your own user
- Does this request meet the root quorum threshold?
- What is the outcome of evaluating this request against all organization policies? Outcomes include:
  - `OUTCOME_ALLOW`: the request is allowed to process
  - `OUTCOME_REQUIRES_CONSENSUS`: the request needs additional approvals
  - `OUTCOME_REJECTED`: the request should be rejected
  - `OUTCOME_DENY_EXPLICIT`: the request has been explicitly denied via policies
  - `OUTCOME_DENY_IMPLICIT`: the request has been implicity denied as no policies grant the required permissions
- Should this request be allowed by default?
  - Users can manage their own credentials unless policies explicitly deny this

## Resource Limits

Organizations have [resource limits](../getting-started/resource-limits.md) for performance and security considerations. If you're bumping into these limits, check out sub-organizations below.

## Sub-Organizations

A sub-organization is an isolated organization that has a pointer to a parent organization. The parent organization has **read** access to all sub-organizations, but no **write** access. This means users within the parent organization have no ability to use wallets or alter any resources in the sub-organization.

For more information on sub-organizations and common use cases for this functionality, follow along in the next section 👉.
