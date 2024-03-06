---
sidebar_position: 4
description: Learn about Organizations on Turnkey
slug: /getting-started/organizations
---
# Organizations

An organization is a logical grouping of resources (e.g. users, policies, wallets). These resources can only be accessed by authorized and permissioned users within the organization. Resources are not shared between organizations.

## Root Quorum

All organizations are controlled by a [Root Quorum](/users/root-quorum) which contains the root users and the required threshold of approvals to take any action. Only the root quorum can update the root quorum or feature set.

## Features

Organizations can opt-in or opt-out of the following features:

| Name                           | Description                                    | Default   | Notes                                                                  |
| ------------------------------ | ---------------------------------------------- | --------- | ---------------------------------------------------------------------- |
| FEATURE_NAME_EMAIL_AUTH        | Enables email authentication activities        | Enabled   | Can only be initiated by a parent organization for a sub-organization  |
| FEATURE_NAME_EMAIL_RECOVERY    | Enables email recovery activities              | Enabled   | Can only be initiated by a parent organization for a sub-organization  |
| FEATURE_NAME_WEBAUTHN_ORIGINS  | The origin Webauthn credentials are scoped to  | Disabled  | Also applies to all sub-organizations (e.g. "https://www.turnkey.com") |
| FEATURE_NAME_WEBHOOK           | A URL to receive activity notification events  | Disabled  | Experimental (e.g. "https://your.service.com/webhook")                 |

## Permissions

All activity requests are subject to enforcement by Turnkey's policy engine. The policy engine determines if a request is allowed by checking the following:
- Does this request violate our feature set? (e.g. cannot attempt email recovery if email recovery is disabled)
- Does this request meet the root quorum threshold?
- What is the outcome of evaluating this request against all organization policies?
- Should this request be denied by default? (e.g. import activities can only target your own user)
- Should this request be allowed by default? (e.g. all users can add credentials unless policies specifically disallow it)

## Resource Limits

Organizations have [resource limits](/getting-started/resource-limits) for performance and security considerations. If you're bumping into these limits, check out sub-organizations below.

## Sub-Organizations

A sub-organization is an isolated organization that has a pointer to a parent organization. By default, the parent organization has **read** access to all sub-organizations, but no **write** access. This means users within the parent organization have no ability to use wallets or alter any resources in the sub-organization.

For more information on sub-organizations and common use cases for this functionality, follow along in the next section 👉.
