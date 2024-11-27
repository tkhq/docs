---
id: concepts
title: "Concepts"
sidebar_position: 2
description: Understand all Turnkey Concepts like Organizations, Users, Policies and more
slug: /getting-started/concepts
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import Parameter from "@site/src/components/parameter";

# Overview

Turnkey is flexible, scalable, and secure wallet infrastructure that can be used for transaction automation (e.g., payments flows, smart contract management), or non-custodial embedded wallets. The platform offers low-level primitives that can be combined to accomplish a variety of goals. 

When you sign up to Turnkey, you create a Parent Organization, which is a segregated collection of Users (including Root Users), Wallets, and Policies that are controlled by your business. Users can access Turnkey via their Credentials (e.g., API Key, Passkey, Email, Phone Number). Users can submit Activities (e.g., sign transaction, create user) based on the permissions granted by Policies. Root Users are a special type of user that can bypass our Policy Engine and take any action if the threshold of Root Quorum is met. Finally, Wallets are HD seed phrases that can derive many Wallet Accounts (i.e., individual addresses) which are used for signing operations.

Parent Organizations can create Sub Organizations, a segregated set of Users, Policies, and Wallets to which the Parent has read access, but not write access. These Sub Organizations typically map to an end user in an embedded wallet setup, but can be used wherever you may need full segregation of Turnkey resources. 


# [IMAGE 1 HERE]

# Concepts Dictionary

## Organizations

An Organization is a logical grouping of resources like users, policies, and wallets. There are two types of organization: 

| Parent Organization | When you first create your Turnkey instance by signing up on the dashboard you create a Parent Organization controlled by your business. In most implementations, a top-level organization represents an entire Turnkey-powered implementation. |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Sub-Organization    | A fully segregated Organization nested under the Parent Organization. Parent Organizations have read access to all their Sub-Organizations, but do not have write access. Each Sub-Organization typically maps to an individual end user in a Turnkey-powered application. Parent Organizations can initiate limited actions for Sub-Organizations that then must be completed by the Sub-Organization (e.g., INITIATE_EMAIL_AUTH, INITIATE_OAUTH). |

## Users 

Turnkey Users are resources within Organizations or Sub-Organizations that can submit activities to Turnkey via a valid Credential (e.g., API key, Passkey, Email). These requests can be made either by making direct API calls or through the Turnkey Dashboard, which operates on the API behind the scenes. Users must have at least one valid credential (one of API key, Passkey, Email, or OAuth), but can also have many associated credentials. Users can also have associated Tags which are logical groupings that can be referenced in policies. Users can only submit activities within their given Organization — they cannot take action across Organizations. 

There are two main types of Users: 

| Root Users | The first User(s) created in an Organization will have root permissions, meaning they can bypass the Policy Engine to take any action within that specific organization. This ability can be limited via Root Quorum, which requires a threshold of Root Users to access root permissions. For example, if there are five root users and the threshold is three, at least three users must approve an activity for the root quorum to be reached. When you first create a Turnkey organization, your user is automatically created as the sole member of the root quorum by default. |
|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Normal Users | Non-Root Users have no permissions unless explicitly granted by Policies. By combining non-root users with policies granting permission for specific actions, you can build support for experiences like delegated access to an agent. |

In parent organizations, a user often maps to an individual from your team with administrative privileges and responsibilities related to your Turnkey instance. In sub-organizations a user often maps to an end user. However, this flexible primitive can often represent other aspects of your backend or application. For example, a Turnkey user might map to a:
- Backend service used to automate certain transactions
- Service with delegated access to take action on behalf of an end user
- Required co-signer for all end user transactions

## Activities

Activities are specific actions taken by Users, such as signing a transaction, adding a new user, or creating a sub-organization. Activity requests are always evaluated through our policy engine, and can evaluate to ALLOW, DENY, or REQUIRES_CONSENSUS (i.e., requires additional approvals before being allowed). 

## Policies

Policies, enforced by Turnkey’s Policy Engine, grant Users permissions to perform activities. These Policies are a series of logical statements (e.g., User ID == 123 or ETH address == 0x543…9b34) that evaluate to either “ALLOW” or “DENY.” Through these policies you can set granular controls on which Users can take which actions with which wallets. Policies can also require multi-party approval / consensus, meaning a threshold of certain users will be required to approve the activity. As mentioned above, the Root Quorum will bypass the policy engine.  

## Credentials

Interacting with the Turnkey API requires each API call to be authenticated by cryptographically stamping it with a credential. This process is abstracted away in our SDKs and ensures that the request cannot be tampered with as it travels to the secure enclave. Credentials include API keys and Passkeys / WebAuthN devices for all Users, while Sub-Organization Users can also use Email or OAuth to authenticate. Email and OAuth leverage API keys under the hood. To prevent users from getting locked out of their account, every Turnkey user needs at least one long-lived credential.

## Wallets and Private Keys

Resources used to generate crypto addresses and sign transactions or messages. We currently support secp256k1 and ed25519 curves and have two main types:

| Wallets (preferred) | A hierarchical deterministic (HD) wallet, which is a collection of cryptographic key pairs derived from a common seed phrase. Wallets (i.e., a single seed phrase) can have many Wallet Accounts (i..e, a set of derived addresses). Wallets support various cryptographic curves and can be represented by a checksummed mnemonic phrase, making them easier to back up and recover. We limit each organization to 100 Wallets, but there is no limit on the total number of wallet accounts. |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Private Keys | Raw private keys represented by an alphanumeric string. We limit each organization to 1,000 private keys, therefore we recommend using Wallets instead of Private keys for better scalability. |

# Typical implementations

## Transaction Automation

Transaction automation entails a business signing transactions on its own behalf. For example, automating payments flows, managing smart contract deployment or programmatically trading in defi. 

## [IMAGE HERE]

In this setup, the business is in full control of its Wallets at all times. This use case typically does not require the use of sub-orgs and everything can be managed from the parent organization. We suggest the following setup:
- Root Users: After initial setup of your parent organization, set a reasonable root quorum (e.g., 2 of 3), attach backup credentials to each user for safekeeping, and only use the root users in a “break glass” scenario.
- Normal Users: Create different users for separate services and/or approval workflows. For example, you might have User A that can automatically sign any transaction with Wallet X, but require both User A and User B to approve transactions with Wallet B.
- Policies: Set appropriately restrictive policies based on your security needs. 
- Wallets: Create separate wallets where differentiated policies are needed, otherwise just leverage multiple wallet accounts within a single wallet. 

## Embedded Wallets

Embedded wallets entail a business creating non-custodial wallets controlled by its end users. For example, allowing an end user to onboard with a wallet via Web2 authentication methods like email or OAuth. 

This is a non-custodial setup where the end user is in control of its wallet at all times. This use case requires the use of sub-orgs which map to an individual end user, and does not require any wallets in the parent organization. The parent organization will be used by your backend service for onboarding new users and initiating certain authentication methods (e.g., email, SMS), while the sub-orgs will be used by the end users for day-to-day signing. We suggest the following setup:
- Root Users: After initial setup of your parent organization, set a reasonable root quorum (e.g., 2 of 3), attach backup credentials to each user for safekeeping, and only use the root users in a “break glass” scenario.
- Normal Users: Create a single service user used for user onboarding and authentication.
- Policies: Set a policy granting the user permission to CREATE_SUBORGANIZATION, INITIATE_EMAIL_AUTH, INITIATE_OAUTH, INITIATE_EMAIL_RECOVERY. 

## [ADD POLICIES HERE]

- Sub-orgs: Create individual sub-orgs for each user that contain a single root user with any relevant credentials (e.g., passkeys, email, OAuth, phone number), and a single wallet with any relevant wallet accounts. 