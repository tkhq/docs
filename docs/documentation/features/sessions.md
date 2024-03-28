---
sidebar_position: 3
description: Learn about user sessions on Turnkey
slug: /features/sessions
---

# Sessions

Turnkey session keys are a flavor of API keys, with one key distinction: they expire. The expiration can be specified using the `expirationSeconds` parameter within a `CREATE_API_KEYS` request (or any other request which includes the creation of an API key). Expiring API keys, or session keys, are an effective way for an application to authenticate requests on behalf of a user for a specific duration.

Session keys can be used to create a **user session**, in which a user is able to perform multiple actions in succession (e.g. signing a series of transactions). This is the basis of [Email Auth](/features/email-auth), a Turnkey primitive through which a user can utilize their email to be granted a session of custom duration. See the [integration guide](/guides/sub-organization-auth) for how to get started with Email Auth.
