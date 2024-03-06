---
sidebar_position: 3
description: Fetching data from Turnkey
slug: /api-design/queries
---

# Queries

Queries are read requests to Turnkey's API. Query URL paths are prefixed with `/public/v1/query`. Queries are not subject to enforcement of the policy engine. This means that there are currently no read permissions within an organization. All users within an organization can read any data within the organization.

Additionally, parent organizations have the ability to query data for all of their child organizations.
