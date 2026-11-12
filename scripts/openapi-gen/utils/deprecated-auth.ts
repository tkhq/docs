import { ApiEndpoint } from "./endpoint-parser/types";

// Keep old documentation URLs useful without publishing recipes for deprecated
// authentication flows. Generated query/history schemas still describe old data.
const OTP_GUIDE = "/features/authentication/otp-migration-guide";

export function getDeprecatedAuthNotice(endpoint: ApiEndpoint): string | undefined {
  let guide: string;
  let replacement: string;

  switch (endpoint.path) {
    case "/public/v1/submit/init_otp_auth":
    case "/public/v1/submit/otp_auth":
    case "/public/v1/submit/email_auth":
      guide = OTP_GUIDE;
      replacement = "Use encrypted OTP verification and client-bound sessions: `INIT_OTP_V3` → `VERIFY_OTP_V2` → `OTP_LOGIN_V2`.";
      break;
    case "/public/v1/submit/init_user_email_recovery":
    case "/public/v1/submit/recover_user":
      guide = `${OTP_GUIDE}#replace-email-recovery`;
      replacement = "Use encrypted OTP authentication, a recovery session with appropriate restrictions and MFA, and replacement authenticator enrollment with `CREATE_AUTHENTICATORS_V2`.";
      break;
    default:
      return undefined;
  }

  return `---
title: "${endpoint.title} (deprecated)"
description: "Migration guidance for this deprecated authentication flow."
---

<Warning>
  This authentication flow is deprecated. Do not use it for new integrations.
</Warning>

${replacement}

Follow the [replacement flow and migration guidance](${guide}) before updating your integration. The migration covers client-side encryption, client signing, and policy updates; plan them as one change.
`;
}
