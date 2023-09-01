---
sidebar_position: 3
description: Common issues and errors using Turnkey's SDKs
slug: /sdk-troubleshooting
---

# Troubleshooting

## JS: Ethers

### Unable to send transaction using TurnkeySigner
Assuming the TurnkeySigner object was correctly instantiated, if you are running into difficulties submitting a transaction via `sendTransaction`, ensure that you've connected your TurnkeySigner to a valid provider. This provider is what offers a connection to a live node, and thereby the network at large.

### Using Sepolia for testing
Ethers v5, which is the version that Turnkey's Ethers implementation relies on, is only compatible with the Sepolia network if paired with Infura (Ethers v5 does not supported Alchemy with Sepolia at this time).
