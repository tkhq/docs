---
sidebar_position: 1
description: Turnkey clients and libraries
slug: /sdk/libraries
---

# Libraries

Turnkey currently has SDK implementations in [JavaScript](https://github.com/tkhq/sdk) and [Go](https://github.com/tkhq/go-sdk). 

---

The following are libraries we have direct compatibility with:

## Ethers
`@turnkey/ethers` exports a `TurnkeySigner` that serves as a drop-in replacement for an Ethers signer. Out of the box, it supports `{ signTransaction | signMessage | signTypedData }`. See full implementation [here](https://github.com/tkhq/sdk/tree/main/packages/ethers) for more details and examples. Note that you must **bring your own provider and connect it** to the TurnkeySigner.

```node
// Initialize a Turnkey Signer
const turnkeySigner = new TurnkeySigner({
  ...
});

// Bring your own provider (such as Alchemy or Infura: https://docs.ethers.org/v5/api/providers/)
const network = "goerli";
const provider = new ethers.providers.InfuraProvider(network);
const connectedSigner = turnkeySigner.connect(provider);
```

## CosmJS
Similarly, `@turnkey/cosmjs` exports a `TurnkeyDirectWallet` that serves as a drop-in replacement for a CosmJS direct wallet. It includes support for `signDirect`. See full implementation [here](https://github.com/tkhq/sdk/tree/main/packages/cosmjs) for more details and examples.

```node
// Initialize a Turnkey Signer
const turnkeySigner = await TurnkeyDirectWallet.init({
  config: {
    ...
  },
  prefix: "celestia", // can be replaced with other Cosmos chains
});

const account = refineNonNull((await turnkeySigner.getAccounts())[0]);
const compressedPublicKey = toHex(account.pubkey);
const selfAddress = account.address;
```

## @solana/web3
While Turnkey does not yet export a package that wraps `@solana/web3.js` functionality, you can still sign Solana transactions using the Turnkey API directly. See [here](https://github.com/tkhq/sdk/tree/main/examples/with-solana) for an example.
