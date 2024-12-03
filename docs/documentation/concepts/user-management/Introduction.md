---
sidebar_position: 1
description: Learn about Users on Turnkey
slug: /concepts/users/introduction
---

# Introduction to users

Turnkey users are resources within organizations or sub-organizations that can submit activities to Turnkey via a valid credential (e.g., API key, passkey). These requests can be made either by making direct API calls or through the Turnkey Dashboard. Users must have at least one valid credential (one of API key, passkey), with upper limits on credentials defined here in our [resource limits](https://docs.turnkey.com/getting-started/resource-limits). Users can also have associated “tags” which are logical groupings that can be referenced in policies. Users can only submit activities within their given organization — they cannot take action across organizations. 

A User's attributes are:

- UUID: a globally unique ID (e.g. `fc6372d1-723d-4f7e-8554-dc3a212e4aec`), used as a unique identifier for a User in the context of Policies or User Tags, or Quorums.
- Name and email
- Authenticators: a list of authenticators (see below for information)
- API key: a list of API keys (see below for information)
- User tags: a list of User Tag UUIDs

A **user belongs to one organization**, and one organization can have many (**up to 100**) users. If you need to create more users, consider using Sub-Organizations.
