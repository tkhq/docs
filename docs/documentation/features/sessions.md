---
sidebar_position: 6
description: Learn about user sessions on Turnkey
slug: /features/sessions
---

# Sessions

## What is a session?

Turnkey sessions allow a user to take multiple, contiguous actions in a defined period of time. Such actions can be divided into two buckets:

- Read operations: Retrieving data (e.g., viewing wallet balances)
- Write operations: Modifying data or performing sensitive actions (e.g., signing transactions)

## How can I create a session?

### Read-only sessions

In terms of end-user experience, a read-only session might make sense in low-touch applications where users are primarily reading data (think viewing wallets and their balances). As for implementation, there are a few ways a developer can achieve read-only access on behalf of a user. Note: an end-user (sub-organization) falls hierarchically under the developer (parent-organization).

#### Parent organization access

By default, a parent organization has read access to all of its sub-organizations’ data. This means you can set up a federated model where the client makes requests to a backend (containing the parent organization’s API key credentials), the backend populates the requested data, and returns it back to the client. From an implementation perspective, each read request (i.e. `get` or `list`) requires an `organizationId` parameter. Populate that field with the sub-organization’s ID in order to get its data.

#### Client side access

Separately, if you would like the client to have all read requests encapsulated (instead of reading data via a proxy like in the previous approach), the client can initiate a read-only session via a [CreateReadOnlySession activity](https://docs.turnkey.com/api#tag/Sessions/operation/CreateReadOnlySession). This activity returns a session string that, if passed into an HTTP request via `X-Session` header, gives permission to perform reads. Note that because this is an activity performed by an end-user, it requires authentication (e.g. via passkey).

If you’d like to do this via our SDK abstractions, you can leverage the [login](https://github.com/tkhq/sdk/blob/6b3ea14d1184c5394449ecaad2b0f445e373823f/packages/sdk-browser/src/sdk-client.ts#L231-L255)<sup>1</sup> method, which creates a `CreateReadOnlySession` activity under the hood. It stores the resulting session string in [Local Storage](https://github.com/tkhq/sdk/blob/6b3ea14d1184c5394449ecaad2b0f445e373823f/packages/sdk-browser/src/sdk-client.ts#L242-L252)<sup>2</sup>, and subsequent requests to fetch data from Turnkey injects the session stored here at [call time](https://github.com/tkhq/sdk/blob/6b3ea14d1184c5394449ecaad2b0f445e373823f/packages/sdk-browser/src/__generated__/sdk-client-base.ts#L45-L47)<sup>3</sup> within `@turnkey/sdk-browser`.

### Read-write sessions

In contrast to read-only sessions, a read-write session makes sense when a user would like to make several write requests in a window of time without having to manually authenticate each one via passkey. There are a few ways to achieve this:

#### Creating a read-write session

Developers can leverage the [CreateReadWriteSession](https://docs.turnkey.com/api#tag/Sessions/operation/CreateReadWriteSession) activity, which requires a target embedded key and returns a credential bundle. This is a pattern that many core, secure flows follow, including Email Recovery, Email Auth, and OTP Auth. See [documentation](https://docs.turnkey.com/features/email-auth#mechanism-and-cryptographic-details) for more details.

<p style={{textAlign: 'center'}}>
    <img src="/img/read_write_sessions.png" width="500" height="200"/>
</p>

As illustrated above, once you have a target embedded key in place on the client side, you can call `CreateReadWriteSession`, get the resulting credential bundle, and decrypt it on the client side using the “TEK”. Upon decryption, the result is a usable Turnkey API key that can be used to make both read and write requests.

Our SDK contains an abstraction called [loginWithReadWriteSession](https://github.com/tkhq/sdk/blob/6b3ea14d1184c5394449ecaad2b0f445e373823f/packages/sdk-browser/src/sdk-client.ts#L257-L284). Crucially, it is able to infer the organization (or sub-organization) based on a stamp, and create a read-write session on behalf of that organization. From an end-user experience perspective, this means that a developer can request an end-user’s passkey approval once, and subsequently give that user a read-write session.

Note that `loginWithReadWriteSession` stores the resulting credential bundle (returned by Turnkey) in Local Storage. We store this credential bundle in Local Storage as it can be used across various React components and pages – as long as both the target embedded key and credential bundle exist, they can be used as a credential to create Turnkey requests. For details on the shape of this stored artifact, see [here](https://github.com/tkhq/sdk/blob/9e9943387123d077fa3b7f38ef3be007291a2c8a/packages/sdk-browser/src/storage.ts#L64-L117).

### Mechanisms

Your next question might be: where can I get the target embedded key? There are two primary mechanisms we offer that provide such embedded keys:

#### iframes:

Turnkey hosts an iframe for use cases such as this one at https://auth.turnkey.com (see [here](https://github.com/tkhq/frames/tree/main/auth) for code implementation). It’s to be used in conjunction with our [@turnkey/iframe-stamper](https://docs.turnkey.com/sdks/advanced/iframe-stamper), but note that some complexity can be abstracted away if using @turnkey/sdk-react. See this [code example](https://docs.turnkey.com/embedded-wallets/code-examples/create-passkey-session) for more.

The iframe is responsible for holding the “TEK” mentioned in the previous diagram. In addition to housing the TEK, it exposes some methods to be able to interact with (but not extract!) the TEK. The end result is that the iframe can safely and securely sign requests to Turnkey. If you would like to take a look at lower level implementation details, see [here](https://github.com/tkhq/sdk/blob/main/packages/iframe-stamper/src/index.ts).

There are a few considerations to note when using sessions with iframes:
- Sessions only last as long as the iframe is maintained on the browser 
- On desktop, this generally is as long as the user doesn’t completely quit the browser 
- On mobile, specifically iOS devices, this behavior is much more finicky as iOS is aggressive in clearing out data contained within iframes
- In either case, sessions are indeed shared across different browser tabs and windows
- May be more difficult to set up to use in conjunction with React Native or other frameworks

#### Local Storage:
Another potential host for a TEK is directly in Local Storage. We’ve created libraries to create a target embedded key (P-256 implementation [here](https://github.com/tkhq/sdk/blob/6b3ea14d1184c5394449ecaad2b0f445e373823f/packages/crypto/src/crypto.ts#L268-L284)). Mechanically, it operates much like the iframe. However, unlike the iframe approach, anyone with access to your application’s domain also has direct access to items stored in Local Storage.

Here are some considerations for using Local Storage:
- Generally more durable than using iframes in various contexts (i.e. web on both desktop and mobile)
- Can be used in other settings such as React Native, Flutter, etc.
- As mentioned, the developer has complete control over the target embedded key. As a result, it’s important to manage this credential with caution.

For an example that leverages Local Storage with Email Auth, see [here](https://github.com/tkhq/sdk/tree/main/examples/email-auth-local-storage).

#### API Key:

Another option is to create an API key and store it directly within Local Storage. However, this is a riskier setup than via TEK (as mentioned in the above Local Storage section), as anyone who is able to access this client-side API key has full access to a User.

<!-- Optional: coverage of createPasskeySession -->

### Sessions FAQ

#### How can I refresh a session?

Once a user has a valid session, it is trivial to use that session to create a new session. It is possible to reuse the same loginWithReadWriteSession abstraction, as this will create a brand new session and automatically store the resulting credential bundle in local storage.

#### How can I delete a session?

In order to delete a session, simply remove all user-related artifacts from Local Storage. See implementation in context [here](https://github.com/tkhq/sdk/blob/9e9943387123d077fa3b7f38ef3be007291a2c8a/packages/sdk-browser/src/sdk-client.ts#L242-L255).

```javascript
/**
 * Clears out all data pertaining to a user session.
 *
 * @returns {Promise<boolean>}
 */
logoutUser = async (): Promise<boolean> => {
  await removeStorageValue(StorageKeys.AuthBundle); // DEPRECATED
  await removeStorageValue(StorageKeys.CurrentUser);
  await removeStorageValue(StorageKeys.UserSession);
  await removeStorageValue(StorageKeys.ReadWriteSession);

  return true;
};
```

#### How long are sessions? 

The expiration of session keys can be specified to any amount of time using the `expirationSeconds` parameter. The default length is 900 seconds (15 minutes). 

#### How many session keys can be active at once?

A user can have up to 10 expiring API keys at any given time. If you create an expiring API key that exceeds that limit, Turnkey automatically deletes one of your existing keys using the following priority: 
- Expired API keys are deleted first
- If no expired keys exist, the oldest unexpired key is deleted

If you are looking to invalidate existing sessions, you can use the `invalidateExisting` parameter for Email Auth and OTP Auth activities. This will clear all existing session keys.

#### Can I use the same sessions implementation for web and mobile?

This is not recommended, because: 
- iOS Safari handles iframes differently. Specifically, it very aggressively evicts data stored within the iframe's local storage.
- React Native doesn’t support iframes natively at all
- Mobile browsers have different storage behaviors generally

Instead, implement platform-specific session management using Local Storage for mobile. 
