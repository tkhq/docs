---
description: A guide to assessing your threat model and taking steps to mitigate risks. 
slug: /security/threat-modeling
sidebar_position: 7
---
# Threat modeling

## Background

At Turnkey, we believe the only way to maintain strong security is to avoid any hard requirements that any one human or system be fully trusted.

To enable that, and to protect the quality and integrity of what we have built, we wish to be maximally transparent about the generation, storage, and control of customer keys. Our goal over time is to ensure that any single security claim made by Turnkey also provides the means to verify it. In doing so, we also hope to change the status quo among security service providers, challenging others in our industry to do as well or better.

Our sincere hope is that you, as a user of this infrastructure, will distrust us first and seek to independently verify our security claims for yourself. As one form of support towards that aim, this document seeks to help you assess who and what you trust, and take steps to mitigate risks in your own implementation of Turnkey. This document also includes reference to our security roadmap within the sections labeled "Mitigations on our roadmap."  

## Trust levels

Turnkey supports a wide range of threat models, from developers rapidly prototyping new services with low value test keys to large financial institutions protecting production keys that gate access to large sums.

If you are like most users, you will probably start out at Level 1 as you get familiar with our offerings and graduate to higher levels in line with the level of risk you choose to take on. You can get started with Turnkey with a few clicks to create a key controlled by your laptop credentials, and later change policies to require a majority vote of several users to approve usage of that same key by tapping yubikeys.

It may be that your threat model exceeds your own technical ability to take the recommended steps, in which case we would strongly advise you invest in appropriate internal technical help rather than downgrade your threat model putting yourself or your customers at undue risk.

To avoid repetition, consider all recommendations from previous trust levels is inherited into successive ones.

Lastly, we would note that these threat models should be interpreted as simply examples of easy to reason about known risks to aid in decision making and intentionally omit many known complex risks for the sake of brevity.

### Level 1: Very high trust

**You trust us more than yourself, or have low value keys**

If you are experimenting, or dealing with low value key material, then this threat model is likely for you.

While this is the -default- threat model for most people, we do -not- recommend it if you are protecting keys that hold significant value.

#### Example threat model

* You partially distrust
    * Yourself
    * The long term stability of your computer
* You fully trust
    * Intel X86_64 CPUs
    * AWS Nitro hardware and firmware
    * Your endpoint hardware and operating system
    * All software on your operating system
    * All parties that control updates to your software
    * All LetsEncrypt production engineers
    * All Amazon production engineers
    * All Turnkey engineers
    * A quorum of Debian maintainers

#### Suggested mitigations

* Enroll at least two hardware devices on your account
* Store one hardware device somewhere safe from loss, theft, fire, etc.

### Level 2: High trust

**You mostly trust us, but wish to do some due diligence**

This threat model is a slight upgrade from "Very high trust". It assumes you still trust that nothing is malicious in your or Turnkey's stack, but you additionally want to do some due diligence to ensure we had sufficient accountability in our engineering process.

We do not recommend this threat model for keys of significant value. That said, it may be an appropriate choice for some teams. 

#### Example threat model

* You partially distrust
    * Yourself
    * Turnkey security engineering choices
* You fully trust
    * Intel X86_64 CPUs
    * AWS Nitro hardware and firmware
    * Your endpoint hardware and operating system
    * All software on your operating system
    * All parties that control updates to your software
    * All LetsEncrypt production engineers
    * All Amazon production engineers
    * All Turnkey production engineers
    * A quorum of Debian maintainers

#### Suggested mitigations

* Read and understand our security architecture documentation
* Read and understand our third party audits
* Avoid using plaintext API secrets
* If you must use plaintext API secrets, give them read-only permissions
* Ensure you require hardware device approval for all key operations

#### Mitigations on our roadmap

* We will reproducibly build and sign all webapp releases
* We will deploy Service Workers to browsers that verify webapp signatures
    * See: [Web Content Signing with Service Workers][wcswsw]

[wcswsw]: https://arxiv.org/pdf/2105.05551.pdf

### Level 3: Moderate trust

**You want to minimize single points of failure with only modest effort**

This is the threat model we would suggest as a minimum for keys of any significant value, and a quick follow for organizations currently operating under a "Level 2: High trust" threat model or similar.

#### Example threat model

* You partially distrust
    * Yourself
    * Any single member of your organization
* You fully distrust
    * All LetsEncrypt production engineers
    * Any single Turnkey production engineer
* You partially distrust
    * All Amazon production engineers
    * Turnkey security engineering choices
* You fully trust
    * Your operating system
    * All software on your operating system
    * All parties that control updates to your software
    * A quorum of Debian maintainers
    * A quorum of Turnkey production engineers
    * A quorum of people of your choosing

#### Suggested mitigations

* Ensure three or more people have equal control of any important keys
* Ensure each participant has two or more hardware devices registered
* Ensure participants use a virtual machine or dedicated computer with Turnkey
* Ensure no API keys exist with privileges that could do significant harm
* Install the Turnkey CLI with reproducible build verification
    * Prove the Turnkey CLI was verified by multiple people
    * See TkCLI [Moderate Trust](https://github.com/tkhq/tkcli/#moderate-trust) steps
* Verify public keys and policies with Turnkey CLI
    * A manipulated web interface could display false information to trick you

#### Mitigations on our roadmap 

The following mitigations are not quite rolled out yet. If you want to use them, please let us know as it will help expedite engineering investment here.

* Exclusively use the Turnkey CLI with hardware signing, instead of API keys
* Perform all security critical operations in the Turnkey CLI
    * Hardware registration, public key verification, approvals, etc.
* Avoid using the Turnkey Web UI for all use cases
    * Supply chain or MITM attacks can manipulate most web UIs, including ours.
    * We -do- hope to reduce this risk with reproducible builds in the future


### Level 4: Low trust

**You trust no single human or system other than cloud provider enclaves**

If you are willing to trust a single cloud provider, such as Amazon, we provide a path to at least fully distrust any single human or endpoint otherwise with only moderate effort. We feel this is the path most organizations responsible for significant value should be targeting.

#### Example threat model

* You fully distrust
    * All LetsEncrypt production engineers
    * All CDNs
    * Any single Turnkey engineer
    * Any single endpoint
* You partially distrust
    * All Amazon production engineers
    * Turnkey security engineering choices
* You fully trust
    * Intel X86_64 CPUs
    * AWS Nitro hardware and firmware
    * A quorum of Debian maintainers
    * A quorum of Turnkey production engineers
    * A quorum of people of your choosing

#### Suggested mitigations

* Install Turnkey CLI binaries you personally built and verified
    * Prove the Turnkey CLI was verified by multiple people
    * Review relevant source code
    * Compile and sign binaries yourself
    * See TkCLI [Zero Trust](https://github.com/tkhq/tkcli/#zero-trust) steps

#### Mitigations on our roadmap

* Compile QuorumOS and Signer artifacts yourself
* Compare Turnkey CLI attestation hashes to your own builds
* Use Turnkey CLI to verify entire cryptographic trust chain:
    - Amazon Nitro Enclave CA keys
    - Amazon account Turnkey controls
    - Amazon role our enclaves are deployed into
    - Hash of QuorumOS that was booted on our Signing Enclaves
    - Hash of the Signer binary loaded into QuorumOS
    - Public Quorum keys for all of our our Signing Enclaves
    - Public Quorum keys for all of our our Policy Enclaves
    - Signatures of Turnkey Operators that generated Signing Enclave Quorum keys
    - Signatures of Turnkey Engineers that reviewed and built current binaries
    - Signatures of Turnkey Operators that approved current enclave deployments
    - Links to external sources verify the legitimacy of Turnkey employee keys
    - Organization Member hardware device signing public keys
        - You can confirm these against any connected devices
    - Organization Member signature approving generation of your keys
    - Organization Member signatures on other members
    - Organization Member devices signed current policies
    - Policy Enclaves signatures approving all Organization Member devices

### Level 5: Minimal trust

**You have significant resources to minimize single points of failure**

This is a path our foundation is built to support, though it notably it adds significant up-front engineering cost and operational overhead for all parties involved.

If you have a lot to lose and a capable security engineering team of your own, then there exists a viable path to effectively remove all single points of failure from your stack.

If this is you, please contact us at hello@turnkey.io!

#### Example threat model

* You fully distrust
    * Any single human
    * Any single machine
* You fully trust
    * A quorum of open source programming language authors
    * A quorum of mixed cloud providers and CPU architectures
    * A quorum of Turnkey production engineers
    * A quorum of people of your choosing

#### Mitigations on our roadmap

* Support users self hosting partial signers and custom policy engines
* Support multisig/MPC operations across multiple cloud providers/architectures
    * Azure, GCP, and baremetal are all on the roadmap.
* Compile QuorumOS and Signer artifacts yourself
    * We plan to open source these, but contact us for early source code access
* Compare Turnkey CLI attestation hashes to your own builds of signer/qos