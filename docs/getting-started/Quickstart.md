---
id: quickstart
sidebar_position: 2
description: Get onboarded and sign your first ETH transaction 
slug: /getting-started/quickstart 
---
# Quickstart 

This quickstart will guide you through Turnkey’s onboarding, API key generation, and ETH signing via Turnkey’s CLI.

## Create your Turnkey Organization

- Visit [app.turnkey.com/dashboard/auth/initial](https://app.turnkey.com/dashboard/auth/initial) and enter your email address.
- Confirm your email by clicking on the link inside of the confirmation email
- Click "Continue" and choose your first authenticator (laptop biometrics or security key)
- Pick a name for your organization click "Continue"
- Log in by clicking the "Log in" button

Once your log in is successful, you will land on the dashboard screen. You'll initially be on the Activities tab, and can explore the Users, Private Keys, and Policies tabs.

## Find your Organization ID

All public API endpoints need an organization ID. You can copy your organization ID by clicking on the user dropdown in the top right corner of the app as shown in the image below.

![](https://files.readme.io/d8ff903-Screen_Shot_2022-12-12_at_2.15.04_PM.png "Screen Shot 2022-12-12 at 2.15.04 PM.png")

For convenience, it's worth setting this as a permanent shell variable:

```sh
export ORGANIZATION_ID="<Your Org ID>"
```

## Create a new API Key

Turnkey API Keys are generic public / private key pairs. To generate a new key, use our CLI.

#### Installing Turnkey's CLI, `turnkey`

```sh
brew install tkhq/tap/turnkey
```

Note: We are employing  [Homebrew](https://brew.sh/) in this guide as a quick and easy install path. For an installation path that requires no trust in external parties, refer to our [tkcli repo](https://github.com/tkhq/tkcli).

#### Generate a new API key

 In your Turnkey implementation, an API key authenticates all API requests.

When you run this command, Turnkey’s CLI generates a standard API key pair and **stores the API private key locally**. If you've run this command once already, add `-k keyname` to the end of the command below, replacing "keyname" with any name you'd like. Otherwise, run the command as written to use our default naming.

```sh
turnkey gen --organization $ORGANIZATION_ID --key-name quickstart
```

Copy the `publicKey` field in the output.

## Add your public API Key

Head to the "Users" tab and click on the Root User:

![](https://files.readme.io/d8fbe2b-Screen_Shot_2022-12-12_at_12.32.58_PM_2.png "Screen Shot 2022-12-12 at 12.32.58 PM_2.png")

Click on "Add new API keys" and enter a label for the public key you want to add. After this succeeds, you should be all set to interact with our Public API.

## Create a new Ethereum Private Key

Creating a new key is done with the `/private_keys` endpoint. We call this with the Turnkey CLI, which abstracts away API routes and signatures:

```
turnkey private-keys create --name "ETH Key" --address-format ADDRESS_FORMAT_ETHEREUM --curve CURVE_SECP256K1 -k quickstart
```

Once the activity transitions to COMPLETE, visit the "Private Keys" tab in your dashboard and take note of the Key ID (e.g. `e624996e-11c4-48fb-ad56-874ff5a84615`), this is what we'll use to sign.

![](https://files.readme.io/2812d13-Screen_Shot_2022-12-15_at_6.34.55_PM.png "Screen Shot 2022-12-15 at 6.34.55 PM.png")

Let's set it as a variable so we can use it to easily sign a transaction in the next step.

```sh
export KEY_ID="<Your Key ID>"
```

## Sign a Transaction

Now you can sign any Ethereum transaction you like with this new key with our [`sign_transaction` endpoint](https://turnkey.readme.io/reference/publicapiservice_signtransaction). Make sure to replace the `unsignedTransaction` below with your own. You can use our [simple transaction generator](https://build.tx.xyz) if you need a quick transaction for testing:

```sh
turnkey request --host api.turnkey.com --path /public/v1/submit/sign_transaction --body '{
    "timestampMs": "'"$(date +%s)"'000",
    "type": "ACTIVITY_TYPE_SIGN_TRANSACTION",
    "organizationId": "'"$ORGANIZATION_ID"'",
    "parameters": {
      "privateKeyId": "'"$KEY_ID"'",
      "type": "TRANSACTION_TYPE_ETHEREUM",
      "unsignedTransaction": "<Your Transaction>"
    }
}' -k quickstart
```

The activity immediately comes back as "COMPLETED" because Turnkey's signer works synchronously. We do not need to change any Organization data. You can find the signature in the output of the command, or by visiting the activity details page for the signature activity.

If you'd like to broadcast your transaction, you can easily do so via [Etherscan](https://etherscan.io/pushTx).

## Sign a Transaction with `Ethers.js`

Turnkey provides an `Ethers` signer via the [`@turnkey/ethers`](https://www.npmjs.com/package/@turnkey/ethers) package on npm. You can use the signer to sign transactions, and bring your own provider to broadcast them.

Check out the example on GitHub where we create a new Ethereum address, then sign and broadcast a transaction using the Turnkey signer: <https://github.com/tkhq/sdk/tree/main/examples/with-ethers/>
