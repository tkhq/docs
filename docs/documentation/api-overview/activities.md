---
sidebar_position: 4
description: Secure execution with Turnkey
slug: /api-overview/activities
---

# Activities

Activities are created after submitting requests to securely execute a workload via our public API. Activity submission URL paths are prefixed with `/public/v1/submit`. Request submissions, if valid, produce an `Activity`.

Activities typically create, modify, or utilize a resource within Turnkey and are subject to consensus or condition enforcement via the policy engine. Activities are executed optimistically synchronous. This means that if we can process the request synchronously, we will. Otherwise, we'll fallback to asynchronous processing. Your services or applications should account for this by checking the response for the activity state:

- If `activity.status == ACTIVITY_STATUS_COMPLETED`, `activity.result` field will be populated with a successful response.
- If `activity.status == ACTIVITY_STATUS_FAILED`, `activity.failure` field will be populated with a failure reason.
- If `activity.status == ACTIVITY_STATUS_CONSENSUS_NEEDED`, additional signatures are required to process the request.
- If `activity.status == ACTIVITY_STATUS_PENDING`, the request is processing asynchronously.

You can get activity status updates by:

- Re-submitting the request. See the notes on idempotency below.
- Polling `get_activity` with the `activity.id`

### Idempotency

The submission API is idempotent. For each request, the POST body is hashed into a fingerprint. Any two requests with the same fingerprint are considered the same request. If you resubmit the request, you'll get the same activity. If you want a new activity, you should modify the request timestamp `timestampMs` to produce a new fingerprint.
