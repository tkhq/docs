---
sidebar_position: 1
description: Learn about Turnkey's unique security framework
---
# Overview

At turnkey we’ve developed a security framework that allows, us and eventually our users to prove that all systems with security critical workloads are running exactly the software we expect at any given time, no single engineer can access any enclave or reconstruct a secret, and the system is always safe as long as enclaves are not compromised

At the highest level, Turnkey runs all secure workloads in **“Secure Enclaves,”** a type of Trusted Execution Environment. To run our secure enclaves we have built an OS from the ground up that gives us the ability to remotely attest to the integrity of the machines and the code running. Every time we deploy, we attest to the code running in the enclaves prior to posting shares of core secrets into the enclave. This helps to **ensure that we can trust the secure applications running in the enclaves,** such as private key generation, transaction signing, and policy evaluation.

In order to easily deploy these enclave applications, we’ve created our own deterministic operating system called Quorum OS. Quorum OS gives us end-to-end transparency into the code we’re running and ensures **no single developer at Turnkey can alter deploy enclaves or reconstruct core secrets.**

We augment that trust in the application layer by **ensuring the applications only act on verifiable data;** every single change to a client’s Organization data has been approved and cryptographically stamped within an enclave before it is considered by the policy engine. The system architecture ensures that even if all systems outside of the enclaves fail, your crypto remains safe.

Over time, we plan to open source more of this stack to enable other developers to remotely attest to our stack themselves, and to allow clients to bring outside data into the policy engine via their own Quorum OS instance.

Our security architecture is the foundation of the Turnkey product. Read on for deeper dives on each of the topics referenced above.
