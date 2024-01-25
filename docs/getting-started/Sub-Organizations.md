---
sidebar_position: 4
description: Learn about sub-orgs and how you can use them
slug: /getting-started/sub-organizations
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

[Sub-Organizations as Wallets](../integration-guides/sub-organizations-as-wallets.md) explains how you might want to use this primitive as a way to model end-user controlled wallets, or custodial wallets. If you have another use-case in mind, or questions/feedback on this page, reach out to [welcome@turnkey.com](mailto:welcome@turnkey.com)!

## Suggested policies

The next consideration when implementing sub-organizations is around ensuring end users (sub-orgs) are able to safely perform activities.

#### Example scenario

You have a backend that creates sub-orgs, and want to approve signing operations (i.e. not initiate, but approve users' transactions) to ensure that users cannot sign anything they want without a confirmation from our backend.

#### Potential solution

If you'd like a simple quorum for each of your end users, this doesn’t require policies and instead can leverage Root Quorum. This means upon sub-org creation you would have two root users: one controlled by your API key(s), and another by the end user, with a Root Quorum Threshold of 2 of 2. If you’re looking to have more complex policies, one thing we’ve seen folks do is first create the sub-org with a threshold of 1 of 2, create the policies with your business API key, and then change the threshold to 2 of 2, OR remove the business as a root user.
