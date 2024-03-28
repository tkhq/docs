---
sidebar_position: 6
description: Common issues and errors using Turnkey's SDKs
slug: /sdk-troubleshooting
---

# Troubleshooting

## JS: Ethers

### Unable to send transaction using TurnkeySigner

Assuming the TurnkeySigner object was correctly instantiated, if you are running into difficulties submitting a transaction via `sendTransaction`, ensure that you've connected your TurnkeySigner to a valid provider. This provider is what offers a connection to a live node, and thereby the network at large.

### Using Sepolia for testing

Our current Ethers implementation has been upgraded to version 6, ensuring broader network compatibility, including Sepolia. For those using the previous version (Ethers v5), it's important to note that it only works with the Sepolia network when used in conjunction with Infura, as Ethers v5 does not support integration with Alchemy for Sepolia at this stage.
