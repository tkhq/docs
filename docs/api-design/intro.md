---
sidebar_position: 1
description: Getting started with the Turnkey API
slug: /api-introduction
---

# Introduction

## RPC/HTTP

Turnkey's API is a remote procedure call (RPC) API. We chose RPC-over-HTTP for convenience and ease-of-use. Most of our users should be able to integrate with our API without a major re-architecture of their existing systems.

Many client libraries are available to make requests to a RPC/HTTP API, across many languages. Turnkey will provide SDKs for the most popular programming languages. For other languages, a RPC/HTTP API ensures there is an easy integration path available via raw http clients.

## POST-only

If you look at the [API reference](./api) you'll notice that all API calls to Turnkey are HTTP POST requests. Requests contain a POST body and a header with a digital signature over the POST body. We call this digitial signature a [Stamp](./stamps.md).

Requests must be stamped by registered user credentials and verified by Turnkey's secure enclaves before they are processed. This ensures cryptographic integrity end-to-end which eliminates the ability for any party to modify a user's request.

### Queries and Submissions
Turnkey's API is divided into 2 broad categories: queries and submissions.
- Queries are read requests (e.g. `get_users`, `list_users`)
- Submissions are requests to execute a workload (e.g. `create_policy`, `sign_transaction`, `delete_user`)

## Dive Deeper
- Creating your first [Stamp](./stamps.md)
- Fetching data with [Queries](./queries.md)
- Executing workloads with [Submissions](./submissions.md)
