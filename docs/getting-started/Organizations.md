---
sidebar_position: 4
---
# Organizations

An organization is a logical grouping of the resources: policies, users, and private keys.  These resources are encapsulated by an organization and cannot be shared between organizations. Depending on the use case, the name organization may be misleading and often times it can help to think about organizations as accounts or entities since a single business (or even human) may have many organizations.

In general it is recommended to keep the number of resources in an organization, particularly policies, limited. Limited resources is recommended, in part, because it helps make it easier to reason about what actions will be accepted.

Organizations have resource limits, which are described in detail [here](https://turnkey.readme.io/docs/faq#bare-there-limits-on-how-many-resources-i-can-create-or-activities-i-can-execute-b)

## Sub Organization

A sub-organization is just an organization that has read access by a parent organization. Generally you will setup one parent (or primary) organization and then set up any number of sub-organizations to create discrete resource groups. It is important to keep in mind that a sub-organization has the exact same behavior as any other organization,

For example, if you are a business building out building out end-user wallets, you would create (at least) one sub-organization per end user. Your business could create the sub-organization with an api user and the end user. To start, the business api user would be part the sole member of the org. The api user would then do various set up. The last two actions of the api user would be to change the root quorum to just the end-user. If the business wanted to still take some limited actions, they could add a policy granted themselves permissions prior to removing themselves from the root quorum.
