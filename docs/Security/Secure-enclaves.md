---
description: Overview of secure enclaves and how we use them
slug: /security/secure-enclaves
sidebar_position: 3
---
# Secure enclaves

A core security anchor at Turnkey is the ability to prove to ourselves and our users that all systems within secure enclaves are running exactly the software we expect at any given time. To accomplish this, all security-critical Turnkey services, including key generation, signing, and our policy engine, are deployed in secure enclaves. 

Secure enclaves, also called Trusted Execution Environments, are highly constrained compute environments that support cryptographic attestation to verify the enclave’s identity and ensure only authorized code is running. These enclaves operate in hardware-enforced isolation - they have no persistent storage, no interactive access, and no external networking. 

The following outlines the structure of a single enclave application:

<p style={{textAlign: 'center'}}>
  <img src="/img/diagrams/secure_enclaves.png" alt="secure-enclaves" width="500px" />
</p>

In this diagram _Host_ represents a standard AWS virtual machine. We run a basic application that receives traffic from the network and calls into the enclave. This creates a layer of insulation from our most secure environment and offers a convenient place to gather metrics and other operational information about the enclaves.

_Enclave_ represents a machine with no external connectivity. The only connection it can have is a virtual serial connection to the host and its own secure co-processor. In AWS this is called the Nitro Security Module (NSM). This runs an instance of Turnkey’s enclave operating system, QuorumOS (QOS), and a secure application running on top of QOS.