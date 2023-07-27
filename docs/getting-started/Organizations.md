---
sidebar_position: 4
description: Learn about Orgnaizations on Turnkey  
---
# Organizations

An organization is a logical grouping of the resources: policies, users, and private keys.  These resources are encapsulated by an organization and cannot be shared between organizations. Depending on the use case, the name organization may be misleading and often times it can help to think about organizations as accounts or entities since a single business (or even human) may have many organizations.

In general it is recommended to keep the number of resources in an organization, particularly policies, limited. Limited resources is recommended, in part, because it helps make it easier to reason about what actions will be accepted.

Organizations have resource limits, which are described in detail [here](https://turnkey.readme.io/docs/faq#bare-there-limits-on-how-many-resources-i-can-create-or-activities-i-can-execute-b)

## Sub Organization

A sub-organization is an segregated organization that is nested within a parent organization. By default, the parent organization has read access to all sub-organizations, but no write access. That means users in the parent organization have no ability to use private keys or alter any resources in the sub-org by default. For more information on sub-organizations and common use cases for this functionality, keep reading.  

