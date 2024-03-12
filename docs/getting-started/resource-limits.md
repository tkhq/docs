---
sidebar_position: 10
description: Organization resource limits
slug: /getting-started/resource-limits
---

# Resource Limits

We have limits on the number of resources within a single organization to avoid performance slowdowns and overly complex permission models. You can scale your organizational resources beyond these limits via [sub-organizations](./Sub-Organizations.md). You can create an unlimited number of sub-organizations within a single organization.

Currently, the resource limits within a single organization are as follows:

| Resource                       | Maximum number allowed |
| :----------------------------- | :--------------------- |
| Private keys                   | 1,000                  |
| HD Wallets                     | 100                    |
| HD Wallet Accounts             | unlimited              |
| Users                          | 100                    |
| Policies                       | 100                    |
| Invitations                    | 100                    |
| Tags                           | 100                    |
| Authenticators per user        | 10                     |
| API keys per user (long-lived) | 10                     |
| API keys per user (expiring)   | 10                     |
| Sub-Organizations              | unlimited              |

If you are approaching any of these limits in your implementation and require support, reach out to the Turnkey team (<help@turnkey.com>).
