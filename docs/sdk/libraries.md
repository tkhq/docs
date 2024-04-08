---
sidebar_position: 5
description: Turnkey clients and libraries
slug: /sdk/libraries
---

# Libraries

Turnkey currently has SDK implementations in [JavaScript](https://github.com/tkhq/sdk) and [Go](https://github.com/tkhq/go-sdk).

---

The following are libraries we have direct compatibility with:

## Ethers

[`@turnkey/ethers`](https://www.npmjs.com/package/@turnkey/ethers) exports a `TurnkeySigner` that serves as a drop-in replacement for an Ethers signer. Out of the box, it supports `{ signTransaction | signMessage | signTypedData }`. See full implementation [here](https://github.com/tkhq/sdk/tree/main/packages/ethers) for more details and examples. Note that you must **bring your own provider and connect it** to the TurnkeySigner.

```node
// Initialize a Turnkey Signer
const turnkeySigner = new TurnkeySigner({
  ...
});

// Bring your own provider (such as Alchemy or Infura: https://docs.ethers.org/v6/api/providers/)
const network = "goerli";
const provider = new ethers.providers.InfuraProvider(network);
const connectedSigner = turnkeySigner.connect(provider);
```

## Viem

[`@turnkey/viem`](https://www.npmjs.com/package/@turnkey/viem) provides a Turnkey [Custom Account](https://viem.sh/docs/accounts/custom.html#custom-account) (signer) which implements the signing APIs expected by Viem clients.

See [`with-viem`](https://github.com/tkhq/sdk/tree/main/examples/with-viem) and [`with-viem-and-passkeys`](https://github.com/tkhq/sdk/tree/main/examples/with-viem-and-passkeys) for examples.

## CosmJS

Similarly, [`@turnkey/cosmjs`](https://www.npmjs.com/package/@turnkey/cosmjs) exports a `TurnkeyDirectWallet` that serves as a drop-in replacement for a CosmJS direct wallet. It includes support for `signDirect`. See full implementation [here](https://github.com/tkhq/sdk/tree/main/packages/cosmjs) for more details and examples.

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

We have released a package that you can use to sign transactions and messages: [`@turnkey/solana`](https://www.npmjs.com/package/@turnkey/solana). See [here](https://github.com/tkhq/sdk/tree/main/examples/with-solana) for an example.

## EIP-1193 

[`@turnkey/eip-1193-provider`](https://www.npmjs.com/package/@turnkey/eip-1193-provider) provides a Turnkey-compatible Ethereum provider that adheres to the EIP-1193 standards. It's build to seamlessly integrate with a broad spectrum of EVM-compatible chains, offering capabilities like account management, transaction signin, and blockchain interaction. 

See [`with-eip-1193-provider`](https://github.com/tkhq/sdk/tree/main/examples/with-eip-1193-provider) for an example.