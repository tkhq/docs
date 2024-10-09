---
sidebar_position: 2
description: Learn about sub-orgs and how you can use them
slug: /concepts/sub-organizations
---

# Sub-Organizations

Using Turnkey’s flexible infrastructure, you can programmatically create and manage sub-organizations for your end-users. sub-organizations aren't subject to size limits: you can create as many sub-organizations as needed. The parent organization has **read-only** visibility into all of its sub-organizations, and activities performed in sub-organizations roll up to the parent for billing purposes.

We envision sub-organizations being very useful to model your End-Users if you're a business using Turnkey for key management. Let's explore how.

## Creating Sub-Organizations

Creating a new sub-organization is an activity performed by the parent organization. The activity itself takes the following attributes as inputs:

- organization name
- a list of root users
- a root quorum threshold
- [optional] a wallet (note: in versions prior to V4, this was a private key)

Root users can be programmatic or human, with one or many credentials attached.

## Using Sub-Organizations

[Sub-Organizations as Wallets](/embedded-wallets/sub-organizations-as-wallets) explains how you might want to use this primitive as a way to model end-user controlled wallets, or custodial wallets. If you have another use-case in mind, or questions/feedback on this page, reach out to [welcome@turnkey.com](mailto:welcome@turnkey.com)!

## Deleting Sub-Organizations

To delete sub-organizations you can call the [delete sub-organization activity](https://docs.turnkey.com/api#tag/Organizations/operation/DeleteSubOrganization). Before deleting a sub-organization all private keys and wallets within the sub-organization must have been exported to prevent loss of funds, or you can pass in the `deleteWithoutExport` parameter with the value `true` to override this. The `deleteWithoutExport` parameter, if not passed in, is default `false`. Note that this activity must be initiated by the sub-organization that is to be deleted.