---
sidebar_position: 1
description: Learn about Users on Turnkey
slug: /concepts/users/introduction
---

# Introduction to users

Turnkey Users are resources within an Organization. Their attributes are:

- UUID: a globally unique ID (e.g. `fc6372d1-723d-4f7e-8554-dc3a212e4aec`), used as a unique identifier for a User in the context of Policies or User Tags, or Quorums.
- Name and email
- Authenticators: a list of authenticators (see below for information)
- API key: a list of API keys (see below for information)
- User tags: a list of User Tag UUIDs

A **user belongs to one organization**, and one organization can have many (**up to 100**) users. If you need to create more users, consider using Sub-Organizations.
