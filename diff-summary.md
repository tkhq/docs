# Diff Summary: main-legacy vs 1451aade6296393c77371190e056b0fb4daec420

This document summarizes the changes between the main-legacy branch and commit 1451aade6296393c77371190e056b0fb4daec420. The changes primarily reflect a major documentation restructuring from a Mintlify-based documentation system to a Docusaurus-based system.

## Overview of Changes

The diff shows a large-scale restructuring of the documentation with:

1. Migration from Mintlify to Docusaurus documentation framework
2. Relocation of files from root directories to a more structured `/docs/documentation/` directory pattern
3. Addition of several new features including Algolia search integration
4. Updates to README and configuration files
5. Addition of Docker and Vercel deployment configurations
6. Significant content reorganization and expansion

## Key File Changes

### README.md

**Changes:**

- Replaced Mintlify starter kit instructions with Turnkey-specific documentation
- Added information about Algolia search integration and crawling
- Added instructions for local development with both yarn and Docker
- Added information about Vercel builds and deployment

**Specific content changes:**

```diff
- # Mintlify Starter Kit
+ # Turnkey docs

- Click on `Use this template` to copy the Mintlify starter kit. The starter kit contains examples including
+ This repo hosts the documentation hosted at https://docs.turnkey.com.

- - Guide pages
- - Navigation
- - Customizations
- - API Reference pages
- - Use of popular components
+ It's built with [Docusaurus](https://docusaurus.io/).
```

### Documentation Structure

**Major change pattern:**

- Files previously at the root level (e.g., `concepts/organizations.mdx`) have been moved to a structured directory hierarchy under `docs/documentation/` (e.g., `docs/documentation/concepts/organizations.md`)
- The content format has also changed from `.mdx` to `.md` in many cases

### Content Migration Examples

#### API Documentation

The API overview file (`api-overview.mdx`) was removed from the root and restructured into multiple files under the `docs/documentation/developer-reference/api-overview/` directory, with individual files for:

- Introduction
- Stamps
- Queries
- Submissions
- Errors

**Specific content removal:**

```diff
---
- title: API Overview
- mode: wide
- sidebarTitle: Overview
---

- <CardGroup>
-   <Card title="Introduction" href="/developer-reference/api-overview/intro" icon="file-lines" iconType="solid" horizontal>
-     Getting started with the Turnkey API
-   </Card>
-   <Card title="Stamps" href="/developer-reference/api-overview/stamps" icon="file-lines" iconType="solid" horizontal>
-     Creating your first signed request
-   </Card>
-   // ... More card content removed
- </CardGroup>
```

#### Concepts Documentation

The concepts documentation (e.g., `concepts/organizations.mdx`) was expanded and moved to `docs/documentation/concepts/` with a more comprehensive structure:

- Added a detailed "Overview" introduction page with concepts dictionary
- Enhanced explanation of organizations, users, credentials, activities, policies, wallets, and private keys
- Added visual diagrams and examples of typical implementations (Transaction Automation and Embedded Wallets)

**Content from `organizations.mdx` that was moved and enhanced:**

```diff
- ---
- title: "Organizations"
- description: "An organization is a logical grouping of resources (e.g. users, policies, wallets). These resources can only be accessed by authorized and permissioned users within the organization. Resources are not shared between organizations."
- ---

- ## Root Quorum

- All organizations are controlled by a [Root Quorum](/concepts/users/root-quorum) which contains the root users and the required threshold of approvals to take any action. Only the root quorum can update the root quorum or feature set.
```

**New enhanced Overview page (`Introduction.md`) with expanded content:**

```markdown
---
sidebar_position: 1
sidebar_label: Overview
description: Understand Turnkey's core features and fundamentals.
slug: /concepts/overview
---

import DocCardList from '@theme/DocCardList';

# Overview

Turnkey is flexible, scalable, and secure wallet infrastructure that can be used for transaction automation (e.g., payments flows, smart contract management), or non-custodial embedded wallets. Turnkey offers low-level primitives that can be combined to accomplish a variety of goals.

When you sign up to Turnkey, you create an **[organization](/concepts/organizations)**, which is a segregated collection of users (including root users), wallets, and policies that are controlled by your business.
```

## Significant New and Changed Content Files

### Newly Added Documentation Files

1. **Passkey Authentication Documentation**

   - New comprehensive documentation about passkeys added in:
     - `docs/documentation/authentication/passkeys/introduction.md`
     - `docs/documentation/authentication/passkeys/integration.md`
     - `docs/documentation/authentication/passkeys/discoverable.md`
     - `docs/documentation/authentication/passkeys/native.md`
     - `docs/documentation/authentication/passkeys/options.md`

2. **Ecosystem Support Documentation**

   - Added detailed documentation for various blockchain ecosystems:
     - `docs/documentation/ecosystems/bitcoin.md`
     - `docs/documentation/ecosystems/ethereum.md`
     - `docs/documentation/ecosystems/solana.md`
     - `docs/documentation/ecosystems/framework.mdx`
     - `docs/documentation/ecosystems/others.md`

3. **Security Documentation**

   - Expanded security documentation:
     - `docs/documentation/security/our-approach.md`
     - `docs/documentation/security/non-custodial-key-management.md`
     - `docs/documentation/security/enclave-secure-channels.md`
     - `docs/documentation/security/vulnerability-reporting.md`

4. **Solution-Specific Guides**
   - New solution-focused documentation:
     - `docs/solutions/embedded-wallets/overview.md`
     - `docs/solutions/embedded-wallets/account-abstraction.md`
     - `docs/solutions/signing-automation/overview.md`

### Significant Content Changes

1. **Getting Started Documentation**

   - Previous quickstart content was restructured and expanded into:
     - `docs/documentation/getting-started/quickstart/quickstart.mdx`
     - `docs/documentation/getting-started/quickstart/embedded-wallet-quickstart.mdx`
     - `docs/documentation/getting-started/quickstart/signing-automation-quickstart.mdx`
     - `docs/documentation/getting-started/launch-checklist.md`

2. **Code Examples**

   - Added comprehensive code examples for common implementation patterns:
     - Embedded wallet examples: `docs/solutions/embedded-wallets/code-examples/`
     - Signing automation examples: `docs/solutions/signing-automation/code-examples/`

3. **React Components Documentation**

   - Added documentation for React-specific components:
     - `docs/solutions/embedded-wallets/react-components.md`

4. **Policy Documentation**
   - Enhanced policy documentation with examples:
     - `docs/documentation/concepts/policy-management/Policy-examples.mdx`
     - `docs/documentation/concepts/policy-management/Policy-language.md`
     - `docs/documentation/concepts/policy-management/Policy-quickstart.md`

### New Features and Assets

- Added support for Algolia search with documentation on how to use and update the crawler
- Added many new images and diagrams under the `static/img/` directory:
  - Added organization diagrams (`/static/img/diagrams/org-diagram.png`)
  - Added authentication flow diagrams (`/static/img/diagrams/email_auth_authorization.png`)
  - Added wallet export/import step visualizations (`/static/img/wallet_export_steps.png`, `/static/img/wallet_import_steps.png`)
  - Added passkey-related screenshots in `/static/img/passkeys/`
  - Added quickstart-related screenshots in `/static/img/quickstart/`
- Added Docker and Vercel configuration for development and deployment

### New Directories

New structured directories were added for better organization:

- `/docs/documentation/` - Main documentation content
- `/docs/sdks/` - SDK-specific documentation
- `/docs/solutions/` - Solution-oriented guides
  - `/docs/solutions/embedded-wallets/` - Embedded wallet implementation guides
  - `/docs/solutions/signing-automation/` - Signing automation guides

### Configuration Changes

- Added Docusaurus configuration files (`docusaurus.config.js`)
- Updated build and deployment scripts (Dockerfile, Makefile)
- Added tsconfig and babel configuration
- Added Vercel deployment configuration (`vercel.json`)

## Conclusion

This change represents a major refactoring of the documentation system, moving from Mintlify to Docusaurus. The content has been reorganized, expanded, and structured in a more hierarchical manner. The migration also includes substantial additions to development tooling, deployment configuration, and search functionality.

Many content files have been relocated and in some cases reformatted from `.mdx` to `.md`, but the core documentation content has been preserved and enhanced with more comprehensive explanations, examples, and visual aids. The documentation now provides a more intuitive navigation structure with dedicated sections for different user needs (general documentation, SDKs, solutions) and includes more visual elements to aid understanding.

The migration to Docusaurus has enabled the addition of important new content areas, particularly around passkey authentication, security practices, and ecosystem-specific implementation guides. The restructuring makes the documentation easier to navigate for users with different implementation goals and facilitates ongoing maintenance and updates.
