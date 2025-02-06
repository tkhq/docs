---
sidebar_position: 5
description: Enumerating all errors received using the Turnkey API
slug: /api-overview/errors
---

# Errors

An error returned by the Turnkey API might look something like this:
```
Turnkey error 3: organization mismatch: request is targeting organization ("USER SUB ORG"), but voters are in organization ("OUR MAIN ORG")
```
Within this error message there are a few different parts that are worth breaking down. First the GRPC Error code. This looks like this:
```
Turnkey error 3:
```
This GRPC error wraps what we call a Turnkey Error which looks something like:
```
organization mismatch: request is targeting organization ("USER SUB ORG"), but voters are in organization ("OUR MAIN ORG")
```
What is more important to you as a developer is the TurnkeyError. This will give you information about what error occured and how you can handle it. In fact, you should **not** perform error handling based on the GRPC code. More on that [here](#grpc-error-codes). This page enumerates all errors that might be received while using the Turnkey API and also provides information about causes for these errors and helpful troubleshooting tips.

## All Error Codes for Actions

The below table enumerates all errors across different actions that can be taken using the API. It contains both the GRPC codes as well as the HTTP codes corresponding with each error as well as the displayed error message. More on GRPC error codes below this table. Click on the message to view a details explanation of possible causes and trouble shooting tips for tha tspecific error

| GRPC Code | HTTP Code | Message |
| ------ | -------- | --------- |
| NotFound          | 404       | [no organization found with the given ID](#no-organization-found-with-the-given-ID) |
| InvalidArgument   | 400       | [malformed organization ID provided](#malformed-organization-id-provided) |
| InvalidArgument   | 400       | [bad request body](#bad-request-body) |
| PermissionDenied  | 403       | [api operations disabled](#api-operations-disabled) |
| ResourceExhausted | 429       | [this organization cannot execute activities because it is over its allotted quota. Please reach out to the Turnkey team (help@turnkey.com) for more information.](#this-organization-cannot-execute-activities-because-it-is-over-its-allotted-quota-please-reach-out-to-the-turnkey-team-helpturnkeycom-for-more-information) |
| ResourceExhausted | 429       | [this sub-organization cannot execute activities because its parent is over its allotted quota. Please reach out to the Turnkey team (help@turnkey.com) for more information.](#this-sub-organization-cannot-execute-activities-because-its-parent-is-over-its-allotted-quota-please-reach-out-to-the-turnkey-team-helpturnkeycom-for-more-information) |
| ResourceExhausted | 429       | [this organization cannot execute activities because it has been rate limited. Please reach out to the Turnkey team (help@turnkey.com) for more information.](#this-organization-cannot-execute-activities-because-it-has-been-rate-limited-please-reach-out-to-the-turnkey-team-helpturnkeycom-for-more-information) |
| ResourceExhausted | 429       | [this sub-organization cannot execute activities because its parent has been rate limited. Please reach out to the Turnkey team (help@turnkey.com) for more information.](#this-sub-organization-cannot-execute-activities-because-its-parent-has-been-rate-limited-please-reach-out-to-the-turnkey-team-helpturnkeycom-for-more-information) |
| PermissionDenied  | 403       | [request not authorized](#request-not-authorized) |
| Unauthenticated   | 401       | [no valid authentication signature found for request](#no-valid-authentication-signature-found-for-request) |
| Unauthenticated   | 401       | [could not find public key in organization](#could-not-find-public-key-in-organization) |
| Unauthenticated   | 401       | [failed while looking up public key in parent organization](#failed-while-looking-up-public-key-in-parent-organization) |
| Unauthenticated   | 401       | [could not find public key in organization or its parent organization](#could-not-find-public-key-in-organization-or-its-parent-organization) |
| Unauthenticated   | 401       | [could not verify WebAuthN signature](#could-not-verify-webauthn-signature) |
| Unauthenticated   | 401       | [credential ID could not be found in organization or its parent organization](#credential-id-could-not-be-found-in-organization-or-its-parent-organization) |
| Unauthenticated   | 401       | [public key could not be found in organization or its parent organization](#public-key-could-not-be-found-in-organization-or-its-parent-organization) |
| Unauthenticated   | 401       | [more than one suborg associated with a credential ID](#more-than-one-suborg-associated-with-a-credential-id) |
| Unauthenticated   | 401       | [more than one suborg associated with a public key](#more-than-one-suborg-associated-with-a-public-key) |
| Unauthenticated   | 401       | [could not verify api key signature](#could-not-verify-api-key-signature) |
| Unauthenticated   | 401       | [expired api key](#expired-api-key) |
| Unauthenticated   | 401       | [malformed activity stamp](#malformed-activity-stamp) |
| Unauthenticated   | 401       | [could not extract webauthn stamp](#could-not-extract-webauthn-stamp) |
| Unauthenticated   | 401       | [could not extract api key stamp](#could-not-extract-api-key-stamp) |
| Unauthenticated   | 401       | [cannot authenticate public API activity request without a stamp (X-Stamp/X-Stamp-Webauthn header)](#cannot-authenticate-public-api-activity-request-without-a-stamp-x-stampx-stamp-webauthn-header)|
| NotFound          | 404       | [webauthn authenticator not found in organization](#webauthn-authenticator-not-found-in-organization) |
| NotFound          | 404       | [webauthn authenticator not found in organization or parent organization](#webauthn-authenticator-not-found-in-organization-or-parent-organization) |
| InvalidArgument   | 400       | [invalid payload encoding](#invalid-payload-encoding) |
| InvalidArgument   | 400       | [invalid hash function](#invalid-hash-function) |
| InvalidArgument   | 400       | [invalid magic link template](#invalid-magic-link-template) |
| InvalidArgument   | 400       | [failed to get email template contents](#failed-to-get-email-template-contents) |
| InvalidArgument   | 400       | [failed to unmarshal template variables](#failed-to-unmarshal-template-variables) |
| PermissionDenied  | 403       | [authentication failed](#authentication-failed) |
| InvalidArgument   | 400       | [failed to load organizations](#failed-to-load-organizations) |
| InvalidArgument   | 400       | [policy label must be unique](#policy-label-must-be-unique) |
| InvalidArgument   | 400       | [invalid policy consensus](#invalid-policy-consensus) |
| InvalidArgument   | 400       | [invalid policy condition](#invalid-policy-condition) |
| InvalidArgument   | 400       | [quorum threshold must be non-zero integer](#quorum-threshold-must-be-non-zero-integer) |
| InvalidArgument   | 400       | [quorum users missing](#quorum-users-missing) |
| InvalidArgument   | 400       | [invalid api key expiration](#invalid-api-key-expiration) |
| InvalidArgument   | 400       | [missing parameter: user authenticator attestation](#missing-parameter-user-authenticator-attestation) |
| InvalidArgument   | 400       | [invalid authenticator attestation](#invalid-authenticator-attestation) |
| InvalidArgument   | 400       | [missing parameter: user authenticator attestation auth data](#missing-parameter-user-authenticator-attestation-auth-data) |
| ResourceExhausted | 429       | [user has exceeded maximum authenticators](#user-has-exceeded-maximum-authenticators) |
| ResourceExhausted | 429       | [user has exceeded maximum long-lived api keys](#user-has-exceeded-maximum-long-lived-api-keys) |
| ResourceExhausted | 429       | [user has exceeded maximum short-lived api keys](#user-has-exceeded-maximum-short-lived-api-keys) |
| InvalidArgument   | 400       | [missing wallet params](#missing-wallet-params) |
| InvalidArgument   | 400       | [invalid path format](#invalid-path-format) |
| InvalidArgument   | 400       | [invalid path](#invalid-path) |
| InvalidArgument   | 400       | [invalid address format](#invalid-address-format) |
| InvalidArgument   | 400       | [invalid curve](#invalid-curve) |
| InvalidArgument   | 400       | [curve required](#curve-required) |
| NotFound          | 404       | [No activity found with fingerprint. Consensus activities must target an existing activity by fingerprint](#no-activity-found-with-fingerprint-consensus-activities-must-target-an-existing-activity-by-fingerprint) |
| Internal          | 500       | [internal server error](#internal-server-error) |

## GRPC Error Codes

Turnkey uses GRPC internally to communicate with our internal services whenever an API request is made. Due to this some errors will be wrapped with GRPC error messages. These error codes are listed below for your convenience, however these will not remain in Turnkey error messages forever and you should **not** do error handling based on these codes as these could be removed at any time. In the following example `Turnkey error 3:` represents a grpc error (error code 3, INVALID_ARGUMENT) wrapping a Turnkey error.

Example

```
Turnkey error 3: organization mismatch: request is targeting organization ("USER SUB ORG"), but voters are in organization ("OUR MAIN ORG")
```

### GRPC Status Codes Reference

| Code                | Number | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OK                  | 0      | Not an error; returned on success.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| CANCELLED           | 1      | The operation was cancelled, typically by the caller.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| UNKNOWN             | 2      | Unknown error. For example, this error may be returned when a `Status` value received from another address space belongs to an error space that is not known in this address space. Also errors raised by APIs that do not return enough error information may be converted to this error.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| INVALID_ARGUMENT    | 3      | The client specified an invalid argument. Note that this differs from `FAILED_PRECONDITION`. `INVALID_ARGUMENT` indicates arguments that are problematic regardless of the state of the system (e.g., a malformed file name).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| DEADLINE_EXCEEDED   | 4      | The deadline expired before the operation could complete. For operations that change the state of the system, this error may be returned even if the operation has completed successfully. For example, a successful response from a server could have been delayed long                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| NOT_FOUND           | 5      | Some requested entity (e.g., file or directory) was not found. Note to server developers: if a request is denied for an entire class of users, such as gradual feature rollout or undocumented allowlist, `NOT_FOUND` may be used. If a request is denied for some users within a class of users, such as user-based access control, `PERMISSION_DENIED` must be used.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ALREADY_EXISTS      | 6      | The entity that a client attempted to create (e.g., file or directory) already exists.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| PERMISSION_DENIED   | 7      | The caller does not have permission to execute the specified operation. `PERMISSION_DENIED` must not be used for rejections caused by exhausting some resource (use `RESOURCE_EXHAUSTED` instead for those errors). `PERMISSION_DENIED` must not be used if the caller can not be identified (use `UNAUTHENTICATED` instead for those errors). This error code does not imply the request is valid or the requested entity exists or satisfies other pre-conditions.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| RESOURCE_EXHAUSTED  | 8      | Some resource has been exhausted, perhaps a per-user quota, or perhaps the entire file system is out of space.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| FAILED_PRECONDITION | 9      | The operation was rejected because the system is not in a state required for the operation's execution. For example, the directory to be deleted is non-empty, an rmdir operation is applied to a non-directory, etc. Service implementors can use the following guidelines to decide between `FAILED_PRECONDITION`, `ABORTED`, and `UNAVAILABLE`: (a) Use `UNAVAILABLE` if the client can retry just the failing call. (b) Use `ABORTED` if the client should retry at a higher level (e.g., when a client-specified test-and-set fails, indicating the client should restart a read-modify-write sequence). (c) Use `FAILED_PRECONDITION` if the client should not retry until the system state has been explicitly fixed. E.g., if an "rmdir" fails because the directory is non-empty, `FAILED_PRECONDITION` should be returned since the client should not retry unless the files are deleted from the directory. |
| ABORTED             | 10     | The operation was aborted, typically due to a concurrency issue such as a sequencer check failure or transaction abort. See the guidelines above for deciding between `FAILED_PRECONDITION`, `ABORTED`, and `UNAVAILABLE`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| OUT_OF_RANGE        | 11     | The operation was attempted past the valid range. E.g., seeking or reading past end-of-file. Unlike `INVALID_ARGUMENT`, this error indicates a problem that may be fixed if the system state changes. For example, a 32-bit file system will generate `INVALID_ARGUMENT` if asked to read at an offset that is not in the range [0,2^32-1], but it will generate `OUT_OF_RANGE` if asked to read from an offset past the current file size. There is a fair bit of overlap between `FAILED_PRECONDITION` and `OUT_OF_RANGE`. We recommend using `OUT_OF_RANGE` (the more specific error) when it applies so that callers who are iterating through a space can easily look for an `OUT_OF_RANGE` error to detect when they are done.                                                                                                                                                                                   |
| UNIMPLEMENTED       | 12     | The operation is not implemented or is not supported/enabled in this service.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| INTERNAL            | 13     | Internal errors. This means that some invariants expected by the underlying system have been broken. This error code is reserved for serious errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| UNAVAILABLE         | 14     | The service is currently unavailable. This is most likely a transient condition, which can be corrected by retrying with a backoff. Note that it is not always safe to retry non-idempotent operations.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| DATA_LOSS           | 15     | Unrecoverable data loss or corruption.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| UNAUTHENTICATED     | 16     | The request does not have valid authentication credentials for the operation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

Source: https://grpc.io/docs/guides/status-codes/

## Troubleshooting
### no organization found with the given ID
Causes:
- An unknown organization ID was passed in a request made to the Turnkey API
  
Troubleshooting Tips:
- Confirm that you are using the proper Organization ID. All Turnkey resources are identified with a UUID, so confirm you are not passing a different resource's UUID as the organization ID in your request.
---
### malformed organization ID provided
Causes:
- An improperly formatted organization ID UUID was passed in a request made to the Turnkey API
  
Troubleshooting Tips:
- Confirm the the UUID conforms to the UUID standard `XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`
---
### bad request body
Causes:
- A malformed request body was passed in a request made to the Turnky API
  
Troubleshooting Tips:
- A typical activity request has the `type`, `timestampMS`, and `organizationId` parameters at the top level and then a `parameters` parameter with more specific parameters based on the request type. For example a CREATE_WALLET activity request body might look something like this:
```
{
    "type": "ACTIVITY_TYPE_CREATE_WALLET",
    "timestampMs": "<string>",
    "organizationId": "string",
    "parameters": {
        "walletName": "string",
        "accounts": [
            {
                "curve": "CURVE_SECP256K1",
                "pathFormat": "PATH_FORMAT_BIP32",
                "path": "string",
                "addressFormat": "ADDRESS_FORMAT_UNCOMPRESSED"
            }
        ],
        "mnemonicLength": 0
    }
}
```
- A get resource request body might look slightly different with less fields. An example of a GET_WALLET request body looks something like this:
```
{
    "organizationId": "string",
    "walletId": "string"
}
```
---
### api operations disabled
Causes:
- This error occurs if Turnkey disables API operations globally. 
  
Troubleshooting Tips:
- This situation will only happen in the most extreme case and should not be something you need to worry about.
---
### this organization cannot execute activities because it is over its allotted quota. Please reach out to the Turnkey team (help@turnkey.com) for more information.
Causes:
- This error occurs if you have exceeded your monthly signing quota. The first 25 signatures a month are free for "free" users.
  
Troubleshooting Tips:
- If you need to increase your signature limit take a look at our [pricing page](https://www.turnkey.com/pricing) and contact us at help@turnkey.com!
---
### this sub-organization cannot execute activities because its parent is over its allotted quota. Please reach out to the Turnkey team (help@turnkey.com) for more information.
Causes:
Causes:
- This error occurs if you have exceeded your monthly signing quota. The first 25 signatures a month are free for "free" users.
  
Troubleshooting Tips:
- If you need to increase your signature limit take a look at our [pricing page](https://www.turnkey.com/pricing) and contact us at help@turnkey.com!
---
### this organization cannot execute activities because it has been rate limited. Please reach out to the Turnkey team (help@turnkey.com) for more information.
Causes:
- This error occurs if you have exceeded your rate limit. We need to maintain a per-customer rate limit to ensure that the service we provide to all of our customers service can be exceptional.
  
Troubleshooting Tips:
- If you are interested in increasing your rate limit reach out to us at help@turnkey.com!
---
### this sub-organization cannot execute activities because its parent has been rate limited. Please reach out to the Turnkey team (help@turnkey.com) for more information.
Causes:
- This error occurs if you have exceeded your rate limit. We need to maintain a per-customer rate limit to ensure that the service we provide to all of our customers service can be exceptional.
  
Troubleshooting Tips:
- If you are interested in increasing your rate limit reach out to us at help@turnkey.com!
---
### request not authorized
Causes:
- This error occurs when a user that created a request is not allowed to complete the action that was requested.
- For example a parent-organization trying to create a wallet within a sub-organization that does not have a delegated access API key.
  
Troubleshooting Tips:
- Confirm that you are using the correct credentials for the request you are making.
- Confirm that all necessary [policies](../concepts/policy-management/Policy-overview.md) are in place so that the action that is requested can be performed.
---
### no valid authentication signature found for request
Causes:
- This error occurs if no signature, or [stamp](../api-overview/stamps.md), is attached to a request. All requests made to Turnkey's api must be stamped so that Turnkey can authenticate and authorize the user who performed the request.
  
Troubleshooting Tips:
- Take a look at the page on [stamps](../api-overview/stamps.md) to get some inforamtion about stamps, what they are, and how they are created.
- At a base level our SDK's abstract away the complicated stamping process for you. [Here](https://github.com/tkhq/sdk/tree/main/examples) are some example projects with our JS/TS SDK to get you started!
---
### could not find public key in organization
Causes:
- This occurs if the public key corresponding to the signature in a stamp is not found in the organization the request is targeting. This means that a request was formatted properly, but the authenticator used to create the request is not associated with the organization that the request was made for.
  
Troubleshooting Tips:
- Ensure that you have added the proper authenticators to the organization you are targeting.
- Ensure that you are targeting the peroper organization.
---
### failed while looking up public key in parent organization
Causes:
- This occurs if the public key corresponding to the signature in a stamp is not found in the organization the request is targeting. This means that a request was formatted properly, but the authenticator used to create the request is not associated with the organization that the request was made for.
  
Troubleshooting Tips:
- Ensure that you have added the proper authenticators to the organization you are targeting.
- Ensure that you are targeting the peroper organization.
---
### could not find public key in organization or its parent organization
Causes:
- This occurs if the public key corresponding to the signature in a stamp is not found in the organization the request is targeting. This means that a request was formatted properly, but the authenticator used to create the request is not associated with the organization that the request was made for.
  
Troubleshooting Tips:
- Ensure that you have added the proper authenticators to the organization you are targeting.
- Ensure that you are targeting the peroper organization.
---
### could not verify WebAuthN signature
Causes:
- This error occurs when the signature used to create a stamp for a request cannot be verified for the organization the request is targeting. Again this means the request is formatted properly, but the authenticator used to create the request is not associated with the organization that the request was made for.
  
Troubleshooting Tips:
- Ensure that you have added the proper authenticators to the organization you are targeting.
- Ensure that you are targeting the peroper organization.
---
### credential ID could not be found in organization or its parent organization
Causes:
- This error occurs when Turnkey cannot translate a public key obtained from a stamp that was created with a WebAuthn authenticator to a parent organization or one of its corresponding sub-organizations that the request was made for.
  
Troubleshooting Tips:
- Ensure that you have added the proper authenticators to the organization you are targeting.
- Ensure that you are targeting the peroper organization.
---
### public key could not be found in organization or its parent organization
Causes:
- This error occurs when Turnkey cannot translate a public key obtained from a stamp to a parent organization or one of its corresponding sub-organizations that the request was made for.
  
Troubleshooting Tips:
- Ensure that you have added the proper authenticators to the organization you are targeting.
- Ensure that you are targeting the peroper organization.
---
### more than one suborg associated with a credential ID
Causes:
- This error occurs for requests like [whoami](https://docs.turnkey.com/api#tag/Sessions/operation/GetWhoami). In particular this request tries to go backwards from the stamp to the public key then to a corresponding sub-orgnaization under a parent organization. If there are multiple sub-organizations with the same public key corresponding to an authenticator it is unknown who is initiating that particular request without more context.
  
Troubleshooting Tips:
- Inlcude the sub-organization ID in the whoami request body.
- Avoid including the same authenticator in multiple sub-organizations
---
### more than one suborg associated with a public key
Causes:
- This error occurs for requests like [whoami](https://docs.turnkey.com/api#tag/Sessions/operation/GetWhoami). In particular this request tries to go backwards from the stamp to the public key then to a corresponding sub-orgnaization under a parent organization. If there are multiple sub-organizations with the same public key it is unknown who is initiating that particular request without more context.
  
Troubleshooting Tips:
- Inlcude the sub-organization ID in the whoami request body.
- Avoid including the same authenticator in multiple sub-organizations
---
### could not verify api key signature
Causes:
- This error occurs when the signature used to create a stamp for a request cannot be verified for the organization the request is targeting. This means the request is formatted properly, but the api-key used to create the request is not associated with the organization that the request was made for.
  
Troubleshooting Tips:
- Ensure that you have added the proper api-keys to the organization you are targeting.
- Ensure that you are targeting the peroper organization.
---
### expired api key
Causes:
- The API key used for the request has expired
  
Troubleshooting Tips:
- Create a new API key to use for the request
- Create an API key that doesn't expire
---
### malformed activity stamp
Causes:
- This error occurs when the stamp attached to a request is not formatted properly.
  
Troubleshooting Tips:
- Take a look at the page on [stamps](../api-overview/stamps.md) to get some inforamtion about stamps, what they are, and how they are created.
- At a base level our SDK's abstract away the complicated stamping process for you. [Here](https://github.com/tkhq/sdk/tree/main/examples) are some example projects with our JS/TS SDK to get you started!
---
### could not extract webauthn stamp
Causes:
- This error occurs when a stamp is not attached to a request.
  
Troubleshooting Tips:
- Take a look at the page on [stamps](../api-overview/stamps.md) to get some inforamtion about stamps, what they are, and how they are created.
- At a base level our SDK's abstract away the complicated stamping process for you. [Here](https://github.com/tkhq/sdk/tree/main/examples) are some example projects with our JS/TS SDK to get you started!
---
### could not extract api key stamp
Causes:
- This error occurs when a stamp is not attached to a request.
  
Troubleshooting Tips:
- Take a look at the page on [stamps](../api-overview/stamps.md) to get some inforamtion about stamps, what they are, and how they are created.
- At a base level our SDK's abstract away the complicated stamping process for you. [Here](https://github.com/tkhq/sdk/tree/main/examples) are some example projects with our JS/TS SDK to get you started!
---
### cannot authenticate public API activity request without a stamp (X-Stamp/X-Stamp-Webauthn header)
Causes:
- This error occurs when a stamp is not attached to a request.
  
Troubleshooting Tips:
- Take a look at the page on [stamps](../api-overview/stamps.md) to get some inforamtion about stamps, what they are, and how they are created.
- At a base level our SDK's abstract away the complicated stamping process for you. [Here](https://github.com/tkhq/sdk/tree/main/examples) are some example projects with our JS/TS SDK to get you started!
---
### webauthn authenticator not found in organization
Causes:
- This error occurs when the signature used to create a stamp for a request cannot be verified for the organization the request is targeting. This means the request is formatted properly, but the webauthn authenticator used to create the request is not associated with the organization that the request was made for.
  
Troubleshooting Tips:
- Ensure that you have added the proper authenticator to the organization you are targeting.
- Ensure that you are targeting the proper organization.
---
### webauthn authenticator not found in organization or parent organization
Causes:
- This error occurs when the signature used to create a stamp for a request cannot be verified for the organization the request is targeting. This means the request is formatted properly, but the webauthn authenticator used to create the request is not associated with the organization that the request was made for.
  
Troubleshooting Tips:
- Ensure that you have added the proper authenticator to the organization you are targeting.
- Ensure that you are targeting the proper organization.
---
### invalid payload encoding
Causes:
- This error is specific to the [sign_raw_payload](https://docs.turnkey.com/api#tag/Signing/operation/SignRawPayload) endpoint. A valid encoding needs to be passed so that Turnkey can properly sign the requested message.
  
Troubleshooting Tips:
- Use a valid encoding scheme from the following: `PAYLOAD_ENCODING_HEXADECIMAL`, `PAYLOAD_ENCODING_TEXT_UTF8`
---
### invalid hash function
Causes:
- This error is specific to the [sign_raw_payload](https://docs.turnkey.com/api#tag/Signing/operation/SignRawPayload) endpoint. A valid hash function needs to be passed so that Turnkey can properly hash and sign the requested message.
  
Troubleshooting Tips:
- Use a valid hash function scheme from the following: `HASH_FUNCTION_NO_OP`, `HASH_FUNCTION_SHA256`, `HASH_FUNCTION_KECCAK256`, `HASH_FUNCTION_NOT_APPLICABLE`
- More information about `HASH_FUNCTION_NO_OP` [here](../FAQ.md#what-does-hash_function_no_op-mean)
- More information about `HASH_FUNCTION_NOT_APPLICABLE` [here](../FAQ.md#what-is-hash_function_not_applicable-and-how-does-it-differ-from-hash_function_no_op)
---
### invalid magic link template
Causes:
- This error occurs if the email template provided for specific activities is invalid.
  
Troubleshooting Tips:
- Read more about [bespoke email templates](../../solutions/embedded-wallets/email-auth-for-sub-organizations.md#bespoke-email-templates)
- Reach out to Turnkey at help@turnkey.com!
---
### failed to get email template contents
Causes:
- This error occurs if there was an error getting the email template for an associated activity
  
Troubleshooting Tips:
- Reach out to Turnkey at help@turnkey.com
---
### failed to unmarshal template variables
Causes:
- This occurs if there are invalid template variables used in your email template.
  
Troubleshooting Tips:
- Read more about [bespoke email templates](../../solutions/embedded-wallets/email-auth-for-sub-organizations.md#bespoke-email-templates)
- Reach out to Turnkey at help@turnkey.com!
---
### authentication failed
Causes:
- This occurs if the user that performed the reuqest is not allowed to perform the action requested.
  
Troubleshooting Tips:
- Ensure that all proper authenticators and api-keys have been added to the organization.
- Confirm that all necessary [policies](../concepts/policy-management/Policy-overview.md) are in place so that the action that is requested can be performed.
---
### failed to load organizations
Causes:
- This error can occur if a request that is made targets an unknown organization ID.
  
Troubleshooting Tips:
- Ensure that the passed organization ID in the request is valid.
---
### policy label must be unique
Causes:
- A new policy that is to be created shares the same name as a different policy. Policy names must be unique, and names in general must be unique per resource, so that they can be properly identified.
  
Troubleshooting Tips:
- Change the label/name that will be used for the new policy.
- Delete the old policy.
- Update the old policy to have a new name.
---
### invalid policy consensus
Causes:
- This error occurs when an invalid consensus expression is passed. 
  
Troubleshooting Tips:
- Read more about policy structure [here](../concepts/policy-management/Policy-overview.md#policy-structure)
---
### invalid policy condition
Causes:
Causes:
- This error occurs when an invalid condition expression is passed. 
  
Troubleshooting Tips:
- Read more about policy structure [here](../concepts/policy-management/Policy-overview.md#policy-structure)
---
### quorum threshold must be non-zero integer
Causes:
- Quorum is the required amount of approvals by [root quorum members](../concepts/user-management/Root-quorum.md) needed for an action to take place within an organization.
  
Troubleshooting Tips:
- When creating a sub-organization or updating the root quroum amount, use a non-zero positive integer.
---
### quorum users missing
Causes:
- This issue occurs when a user marked as part of the root quorum is missing from the set of users within an organization. This is a validation error that can occur when trying to delete a user that is part of the root quorum.
  
Troubleshooting Tips:
- Before deleting the user, remove them from the root quroum using [Update Root Quorum](https://docs.turnkey.com/api#tag/Organizations/operation/UpdateRootQuorum)
---
### invalid api key expiration
Causes:
- An invalid expiration time was passed in for an api key's expiration time parameter when using [Create API Key](https://docs.turnkey.com/api#tag/API-Keys/operation/CreateApiKeys)
  
Troubleshooting Tips:
- The `expirationSeconds` parameter is passed as string of seconds of how long the key should last.
---
### missing parameter: user authenticator attestation
Causes:
- This error occurs when an attestation parameter is not passed when performing a request regarding an authenticator. For example [Create Authenticators](https://docs.turnkey.com/api#tag/Authenticators/operation/CreateAuthenticators)
  
Troubleshooting Tips:
- An example of getting the correct parameters needed to use the Create Authenticators endpoint can be found within our [react-components](https://github.com/tkhq/sdk/blob/main/examples/react-components/src/app/dashboard/page.tsx) SDK example
---
### invalid authenticator attestation
Causes:
- This error occurs when an attestation parameter is not valid when performing a request regarding an authenticator. For example [Create Authenticators](https://docs.turnkey.com/api#tag/Authenticators/operation/CreateAuthenticators)
  
Troubleshooting Tips:
- An example of getting the correct parameters needed to use the Create Authenticators endpoint can be found within our [react-components](https://github.com/tkhq/sdk/blob/main/examples/react-components/src/app/dashboard/page.tsx) SDK example
---
### missing parameter: user authenticator attestation auth data
Causes:
- This error occurs when an attestation auth data parameter is not valid when performing a request regarding an authenticator. For example [Create Authenticators](https://docs.turnkey.com/api#tag/Authenticators/operation/CreateAuthenticators). This parameter is obtained as part of the attestation object.
  
Troubleshooting Tips:
- An example of getting the correct parameters needed to use the Create Authenticators endpoint can be found within our [react-components](https://github.com/tkhq/sdk/blob/main/examples/react-components/src/app/dashboard/page.tsx) SDK example
---
### user has exceeded maximum authenticators
Causes:
- Turnkey allows for 10 authenticators per user. This is a hard resource limit. More information on resource limits [here](../getting-started/resource-limits.md).
  
Troubleshooting Tips:
- Delete any unecessary authenticators attached to a user.
- Create a new user within the same organization and attach the authenicator to that user.
---
### user has exceeded maximum long-lived api keys
Causes:
- Turnkey allows for 10 long-lived api keys per user. This is a hard resource limit. More information on resource limits [here](../getting-started/resource-limits.md).
  
Troubleshooting Tips:
- Delete any unecessary long-lived API keys attached to a user.
- Create a new user within the same organization and attach the API key to that user.
---
### user has exceeded maximum short-lived api keys
Causes:
Causes:
- Turnkey allows for 10 short-lived api keys per user. This is a hard resource limit. More information on resource limits [here](../getting-started/resource-limits.md). Short-lived API keys will automatically be deleted from an organization when they are expired.
  
Troubleshooting Tips:
- Delete any unecessary short-lived API keys attached to a user.
- Create a new user within the same organization and attach the API key to that user.
---
### missing wallet params
Causes:
- 
  
Troubleshooting Tips:
- 
---
### invalid path format
Causes:
- This error occurs when an invalid path format parameter is passed to a request like [Create Wallet Accounts](https://docs.turnkey.com/api#tag/Wallets/operation/CreateWalletAccounts).
  
Troubleshooting Tips:
- For now the path format must be: `PATH_FORMAT_BIP32`.
---
### invalid path
Causes:
Causes:
- This error occurs when an invalid path parameter is passed to a request like [Create Wallet Accounts](https://docs.turnkey.com/api#tag/Wallets/operation/CreateWalletAccounts). Paths cannot be reused within the same HD wallet.
  
Troubleshooting Tips:
- The path is a string that is used to derive a new account within an HD wallet. A list of default paths per address format can be found [here](../concepts/Wallets.md#hd-wallet-default-paths)
- Paths cannot be reused within the same HD wallet.
---
### invalid address format
Causes:
- This error occurs when an invalid address format parameter is passed to a request like [Create Wallet Accounts](https://docs.turnkey.com/api#tag/Wallets/operation/CreateWalletAccounts).
  
Troubleshooting Tips:
- Turnkey offers a wide range of support for many ecosystems. A list of valid address format's can be found in the table [here](../concepts/Wallets.md#address-formats-and-curves).
- More about Turnkey and general ecosystem support can be found [here](https://docs.turnkey.com/documentation/ecosystem-integrations/).
---
### invalid curve
Causes:
- This error occurs when an invalid curve parameter is passed to a request like [Create Wallet Accounts](https://docs.turnkey.com/api#tag/Wallets/operation/CreateWalletAccounts).
  
Troubleshooting Tips:
- Before ecosystem level integrtaions Turnkey offers support on a curve level. This makes us extendable to any ecosystem that is based on a curve we support. A list of valid curve parameters can be found in the table [here](../concepts/Wallets.md#address-formats-and-curves).
- More about Turnkey and general ecosystem support can be found [here](https://docs.turnkey.com/documentation/ecosystem-integrations/).
---
### curve required
Causes:
- This error occurs when a curve parameter is not passed to a request like [Create Wallet Accounts](https://docs.turnkey.com/api#tag/Wallets/operation/CreateWalletAccounts).
  
Troubleshooting Tips:
- Before ecosystem level integrtaions Turnkey offers support on a curve level. This makes us extendable to any ecosystem that is based on a curve we support. A list of valid curve parameters can be found in the table [here](../concepts/Wallets.md#address-formats-and-curves).
- More about Turnkey and general ecosystem support can be found [here](https://docs.turnkey.com/documentation/ecosystem-integrations/).
---
### No activity found with fingerprint. Consensus activities must target an existing activity by fingerprint
Causes:
- This error occurs during the [Approve/Reject Activity](https://docs.turnkey.com/api#tag/Consensus/operation/ApproveActivity) activity. A parameter passed into this activity is the fingerprint of the activity that is to be approved or rejected. If the fingerprint is not one of a valid activity this error occurs.
  
Troubleshooting Tips:
- Confirm that a valid fingerprint is passed as part of this activity. 
---
### internal server error
Causes:
- This error is thrown for a variety of internal server errors that are not due to user error. These activities will have an error id passed with them like: `internal server error (9fbfda54-7141-4192-ae72-8bac3512149a)`
  
Troubleshooting Tips:
- Retry the activity, this could be a fluke case and the following activity could pass without failure.
- If you think there is problem, or your service is degraded please reach out to Turnkey help@turnkey.com and provide the error id in the error message.
---