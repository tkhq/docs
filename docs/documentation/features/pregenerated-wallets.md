---
sidebar_position: 8
description: Learn about pre-generating wallets for users on Turnkey.
slug: /features/pregenerated-wallets
---

# Pre-generated wallets

Turnkey allows you to pre-generate wallets for your user before they authenticate. This is helpful if you already know the users email or phone number, and want to create a deposit address for them or airdrop a reward before they authenticate to Turnkey.

To accomplish this, create a new sub-org for that user with a single root user. This root user should only have the end user’s email or phone number associated with it, and no other authenticators, which ensures that only the end user can claim the pre-generated wallet. When the end user wants to claim the wallet, they can complete [email auth](../features/email-auth.md) or [OTP auth](../features/otp-auth.md) flows to authenticate and sign a transaction or add a new authenticator.
