---
description: Learn how we ensure an end-to-end audit trail
sidebar_position: 5
slug: /security/verifiable-data
---
# Verifiable data

Enclave applications in Turnkey’s infrastructure are stateless meaning, there is no persistent data held behind the enclave boundary. Instead, data is held in a PostgreSQL instance in our primary AWS account. Before any enclave applications operate on the data in a Turnkey account, it first verifies that that data has been recently notarized by Turnkey’s notarizer. A recent stamp could be the result of an update or initiated by the heartbeat service.

By verifying the authenticity of data using cryptographic signatures (no passwords!) and timestamping, we enable zero-risk data sharing between these apps and block man-in-the-middle or downgrade attacks. The combination of these features results in a system and an audit trail that is verifiable end-to-end.

The entire Turnkey architecture including this verifiable data flow is described below:

<p style={{textAlign: 'center'}}>
  <img
    src="/img/diagrams/architecture.png"
    alt="turnkey_architecture"
    style={{ width: 900 }} />
</p>