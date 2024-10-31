---
sidebar_position: 10
description: Organization resource limits
slug: /getting-started/resource-limits
---

# Resource Limits

We have limits on the number of resources within a single organization to avoid performance slowdowns and overly complex permission models. You can scale your organizational resources beyond these limits via [sub-organizations](/concepts/Sub-Organizations). You can create an unlimited number of sub-organizations within a single organization.

Currently, the resource limits within a single organization are as follows:

| Resource                       | Maximum parent org allowance | Maximum sub-org allowance |
| :----------------------------- | :--------------------------: | :-----------------------: |
| Private keys                   |            1,000             |           1,000           |
| HD Wallets                     |             100              |            100            |
| HD Wallet Accounts             |          unlimited           |         unlimited         |
| Users                          |             100              |            100            |
| Policies                       |             100              |            100            |
| Invitations                    |             100              |            100            |
| Tags                           |             100              |            10             |
| Authenticators per user        |              10              |            10             |
| API keys per user (long-lived) |              10              |            10             |
| API keys per user (expiring)   |              10              |            10             |
| Sub-Organizations              |          unlimited           |             0             |

Note that if you create an expiring API key that would exceed the limit above, Turnkey automatically deletes one of your existing keys using the following priority:

1. Expired API keys are deleted first
2. If no expired keys exist, the oldest unexpired key is deleted

If you are approaching any of these limits in your implementation and require support, reach out to the Turnkey team (<help@turnkey.com>).
