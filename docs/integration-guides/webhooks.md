---
sidebar_position: 9
description: Activity webhooks
slug: /integration-guides/webhooks
---

# Activity Webhooks

Webhooks provide a powerful mechanism to receive real-time notifications about activity requests in your Turnkey organization. Additionally, you'll be able to receive all activity requests for both the parent organization and all its child organizations. This functionality can be enabled via the organization feature capabilities of our platform, as detailed in the section on [organization features](/concepts/organizations#features).

This guide is designed to walk you through the process of setting up webhooks, from environment preparation to verification of successful event capturing.

## Prerequisites

Before diving into webhook configuration, ensure you have completed the necessary preliminary steps outlined in our [Quickstart Guide](/getting-started/quickstart#create-your-turnkey-organization). This guide will assist you in setting up a new organization and installing the Turnkey CLI. Note: We'll create a new API Key for testing webhooks below.

## Environment Setup

Begin by setting the necessary environment variables:

```shell
ORGANIZATION_ID=<your-organization-id>
KEY_NAME=webhook-test
```

### API Key Generation

Generate an new API key using the Turnkey CLI with the following command:

```shell
turnkey generate api-key --organization $ORGANIZATION_ID --key-name $KEY_NAME
```

### Ngrok Installation and Setup

Ngrok is a handy tool that allows you to expose your local server to the internet. Follow these steps to set it up:

1. Download Ngrok from [their website](https://ngrok.com/download).
2. Follow the provided instructions to install Ngrok and configure your auth token.

### Local Server Setup

Open a new terminal window and set up a local server to listen for incoming webhook events:

```shell
nc -l 8000
```

### Ngrok Tunneling

In another terminal, initiate Ngrok to forward HTTP requests to your local server:

```shell
ngrok http 8000
```

Here's an output of the above command:

```
Session Status                online
Account                       Satoshi Nakamoto (Plan: Free)
Update                        update available (version 3.7.0, Ctrl-U to update)
Version                       3.6.0
Region                        United States (us)
Latency                       22ms
Web Interface                 http://127.0.0.1:4041
Forwarding                    https://04b2-121-74-183-35.ngrok-free.app -> http://localhost:8000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

Save the ngrok URL as an environment variable:

```shell
WEBHOOK_URL=https://04•••35.ngrok-free.app # Replace with the URL provided by ngrok
```

### Verifying Ngrok Setup

To ensure Ngrok is correctly forwarding requests, perform a test using curl:

```shell
curl -X POST $WEBHOOK_URL -d "{}"
```

Example output:

```shell
POST / HTTP/1.1
Host:04b2-121-74-183-35.ngrok-free.app
User-Agent: curl/8.4.0
Content-Length: 2
Accept: */*
Content-Type: application/x-www-form-urlencoded
X-Forwarded-For: 195.88.127.47
X-Forwarded-Host: 04b2-121-74-183-35.ngrok-free.app
X-Forwarded-Proto: https
Accept-Encoding: gzip
{}
```

After executing this command, you should see the request appear in the terminal where `nc` is running.
Terminate the `nc` session by pressing CTRL+C and restart it by rerunning the `nc` command.

## Configuring the Webhook URL

Set your webhook URL using the Turnkey CLI with the following command:

```shell
turnkey request --path /public/v1/submit/set_organization_feature --body '{
  "timestampMs": "'"$(date +%s)"'000",
  "type": "ACTIVITY_TYPE_SET_ORGANIZATION_FEATURE",
  "organizationId": "'"$ORGANIZATION_ID"'",
  "parameters": {
    "name": "FEATURE_NAME_WEBHOOK",
    "value": "'"$WEBHOOK_URL"'"
  }
}' --key-name=$KEY_NAME
```

### Testing Your Webhook

Assuming the previous request executed successfully it's time to test out your webhook!
In order to verify that your webhook is correctly configured and receiving data,
we can simply execute the previous turnkey request command again which creates a new activity request that will be captured by your webhook.
Monitor the terminal with `nc` running to observe the incoming webhook data.

## Conclusion

By following these steps, you should now have a functioning webhook setup that captures all activity requests for your organization and its sub-organizations. If you encounter any issues or have feedback about this feature, reach out on [slack](https://join.slack.com/t/clubturnkey/shared_invite/zt-2837d2isy-gbH60kJ~XnXSSFHiqVOrqw)!