---
sidebar_position: 1
description: Understand Turnkey's core features and fundamentals.
slug: /concepts/introduction
---

# Overview

Turnkey is flexible, scalable, and secure wallet infrastructure that can be used for transaction automation (e.g., payments flows, smart contract management), or non-custodial embedded wallets. Examples of such implementations can be found in our [sdk examples](https://github.com/tkhq/sdk?tab=readme-ov-file#code-examples). The platform offers low-level primitives that can be combined to accomplish a variety of goals. 

When you sign up to Turnkey, you create an **[organization](/concepts/organizations)**, which is a segregated collection of users (including root users), wallets, and policies that are controlled by your business. This top level organization that is initially created, often referred to as your parent organization, is generally meant to represent an entire Turnkey-powered application. **[Users](/concepts/users/introduction)** can access Turnkey via their **[credentials](/concepts/users/credentials)** (e.g., API key, passkey, email, phone number). There are two primary ways for users to interact with Turnkey -- via the [Turnkey Dashboard](https://app.turnkey.com/dashboard), and by sumbmitting activity requests via our public API. The Turnkey Dashboard, which is where you'll first create your Turnkey parent organization, is where root users of your parent organization will typically manage administrative activities. It supports passkey authentication only. On the other hand, interactions with Turnkey at scale (primarily, interactions initiatied by end users) can be done via programmatically calling the Turnkey public API and submitting activity requests, with a variety of authentication methods supported. Users can submit **[activities](/api-overview/submissions)** (e.g., sign transaction, create user) based on the permissions granted by **[policies](/concepts/policies/overview)**. Root users are a special type of user that can bypass our policy engine and take any action if the threshold of **[root quorum](/concepts/users/root-quorum)** is met. Finally, **[wallets](/concepts/wallets)** are HD seed phrases that can derive many wallet accounts (i.e., individual addresses) which are used for signing operations.

Parent organizations can create **[sub-organizations](/concepts/sub-organizations)**, a segregated set of users, policies, and wallets to which the parent has read access, but not write access. These sub-organizations typically map to an end user in an embedded wallet setup, but can be used wherever you may need full segregation of Turnkey resources. 

<p style={{ textAlign: "center" }}>
  <img
    src="/all_concepts.png"
    alt="all concepts screenshot"
    style={{ width: 800, borderRadius: "4px", boxShadow: "0 2px 5px 0 #0003" }}
  />
</p>

# Concepts Dictionary

## Organizations

An organization is a logical grouping of resources like users, policies, and wallets. There are two types of organization: 

| Organization Type | Description |
|-------------------|-------------|
| Parent Organization | When you first setup your implementation of Turnkey by signing up on the dashboard you create a parent organization controlled by your business. In most implementations, a top-level organization represents an entire Turnkey-powered implementation. For more information on Turnkey parent organizations [look here](/concepts/organizations).|
| Sub-Organization | A fully segregated organization nested under the parent organization. Parent organizations have read access to all their sub-organizations, but do not have write access. Each sub-organization typically maps to an individual end user in a Turnkey-powered application. Parent organizations can initiate limited actions for sub-organizations that then must be completed by the sub-organization (e.g., INITIATE_EMAIL_AUTH, INITIATE_OAUTH). For more information on Turnkey sub-organizations [look here](/concepts/sub-organizations).|


## Users 

Turnkey users are resources within organizations or sub-organizations that can submit activities to Turnkey via a valid credential (e.g., API key, passkey). These requests can be made either by making direct API calls or through the Turnkey Dashboard. Users must have at least one valid credential (one of API key, passkey), with upper limits on credentials defined here in our [resource limits](/getting-started/resource-limits). Users can also have associated “tags” which are logical groupings that can be referenced in policies. Users can only submit activities within their given organization — they cannot take action across organizations. 

There are two main types of users: 

| User Type | Description |
|-----------|-------------|
| Root Users | The first user(s) created in an organization will have root permissions, meaning they can bypass the policy engine to take any action within that specific organization. This ability can be limited via root quorum, which requires a threshold of root users to access root permissions. For example, if there are five root users and the threshold is three, at least three users must approve an activity for the root quorum to be reached. When you first create a Turnkey organization, your user is automatically created as the sole member of the root quorum by default. |
| Normal Users | Other than managing their own credentials, non-root users have no permissions unless explicitly granted by [policies](/concepts/policies/overview). By combining non-root users with policies granting permission for specific actions, you can build support for experiences like delegated access to an agent. |

In parent organizations, a user often maps to an individual from your team with administrative privileges and responsibilities. In sub-organizations, which are often used to manage an end user's resources, a user can represent an end user and their credentials. If there is only one user, representing the end user then this would be a non-custodial setup. However, this flexible primitive can often represent other aspects of your backend or application. For example, a Turnkey user might map to a:
- Backend service used to automate certain transactions
- Service with delegated access to take action on behalf of an end user
- Required co-signer for all end user transactions

For more information on Turnkey users [look here](/concepts/users/introduction).

## Credentials

Interacting with the Turnkey API requires each API call to be authenticated by cryptographically stamping it with a credential. This process is abstracted away in our SDKs and ensures that the request cannot be tampered with as it travels to the secure enclave. Credentials include API keys and passkeys / Webauthn devices for all Users, while sub-organization users can also use email or OAuth to authenticate. Email and OAuth leverage API keys under the hood. To prevent users from getting locked out of their account, every Turnkey user needs at least one long-lived credential.

For more information on Turnkey user credentials [look here](/concepts/users/credentials)

## Activities

Activities are specific actions taken by users, such as signing a transaction, adding a new user, or creating a sub-organization. Activity requests are always evaluated through our policy engine, and can evaluate to ALLOW, DENY, or REQUIRES_CONSENSUS (i.e., requires additional approvals before being allowed). 

For more information on Turnkey activities [look here](/api-overview/)

## Policies

“Policies”, enforced by Turnkey’s policy engine, grant users permissions to perform activities. These policies are a series of logical statements (e.g., User ID == 123 or ETH address == 0x543…9b34) that evaluate to either “ALLOW” or “DENY.” Through these policies you can set granular controls on which users can take which actions with which wallets. Policies can also require multi-party approval / consensus, meaning a threshold of certain users will be required to approve the activity. As mentioned above, the root quorum will bypass the policy engine.

For more information on Turnkey policies [look here](/concepts/policies/overview)

## Wallets and Private Keys

Resources used to generate crypto addresses and sign transactions or messages. We currently support secp256k1 and ed25519 curves and have two main types:

| Resource Type | Description |
|---------------|-------------|
| Wallets (preferred) | A hierarchical deterministic (HD) wallet, which is a collection of cryptographic key pairs derived from a common seed phrase. A wallet (i.e., a single seed phrase) can have many wallet accounts (i.e., a set of derived addresses). Wallets support various cryptographic curves and can be represented by a checksummed mnemonic phrase, making them easier to back up and recover. We limit each organization to 100 Wallets, but there is no limit on the total number of wallet accounts. For more information on Turnkey HD wallets [look here](/concepts/wallets)|
| Private Keys | Raw private keys represented by an alphanumeric string. We limit each organization to 1,000 private keys, therefore we recommend using wallets instead of private keys for better scalability. |

Learn more about leveraging Wallets across different crypto ecosystems on our [Ecosystem Support](/ecosystem-integrations/) page.

# Typical implementations

## Transaction Automation

Transaction automation entails a business signing transactions on its own behalf. For example, automating payments flows, managing smart contract deployment or programmatically trading in defi. 

<p style={{ textAlign: "center" }}>
  <img
    src="/transaction_automation_example.png"
    alt="transaction automation screenshot"
    style={{ width: 800, borderRadius: "4px", boxShadow: "0 2px 5px 0 #0003" }}
  />
</p>

In this setup, the business is in full control of its wallets at all times. This use case typically does not require the use of sub-organizations and everything can be managed from the parent organization. We suggest the following setup:
- **Root Users:** After initial setup of your parent organization, set a reasonable root quorum (e.g., 2 of 3), attach backup credentials to each user for safekeeping, and only use the root users in a “break glass” scenario.
- **Service Users:** Create different users for separate services and/or approval workflows. For example, you might have user A that can automatically sign any transaction with Wallet X, but require both user A and user B to approve transactions with Wallet B.
- **Service Policies:** Set appropriately restrictive policies based on your security needs. 
- **Wallets:** Create separate wallets where differentiated policies are needed, otherwise just leverage multiple wallet accounts within a single wallet. 

## Embedded Wallets

Embedded wallets entail a business creating non-custodial wallets controlled by its end users. For example, allowing an end user to create and use a wallet via Web2 authentication methods like email or OAuth. 

<p style={{ textAlign: "center" }}>
  <img
    src="/embedded_wallets_example.png"
    alt="embedded wallets screenshot"
    style={{ width: 800, borderRadius: "4px", boxShadow: "0 2px 5px 0 #0003" }}
  />
</p>

This is a non-custodial setup where the end user is in control of its wallet at all times. This use case requires the use of sub-organizations which map to an individual end user, and does not require any wallets in the parent organization. The parent organization will be used by your backend service for onboarding new users and initiating certain authentication methods (e.g., email, SMS), while the sub-organizations will be used by the end users for day-to-day signing. We suggest the following setup:
- **Root Users:** After initial setup of your parent organization, set a reasonable root quorum (e.g., 2 of 3), attach backup credentials to each user for safekeeping, and only use the root users in a “break glass” scenario.
- **Normal Users:** Create a single service user used for user onboarding and authentication.
- **Policies:** Set a policy granting the user permission to `CREATE_SUB_ORGANIZATION`, `EMAIL_AUTH`, `OAUTH`, `​INIT_USER_EMAIL_RECOVERY`. For examples of how to create such policies [look here](/concepts/policies/examples). 
- **Sub-organizations:** Create individual sub-organizations for each user that contain a single root user with any relevant credentials, and a single wallet with any relevant wallet accounts. 
