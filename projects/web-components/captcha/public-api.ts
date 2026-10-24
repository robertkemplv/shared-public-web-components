/**
 * Cloudflare Turnstile captcha entry (`@lumvir/web-components/captcha`).
 *
 * This is a **real** bot check: the widget obtains a token from Cloudflare after
 * a challenge/risk check. Your site’s **backend must verify** that token with
 * Cloudflare’s Siteverify API before trusting the request. A checked box alone
 * is not protection.
 *
 * ## Get keys
 * 1. Cloudflare dashboard → Turnstile → Add widget (Managed mode for the
 *    “I’m not a robot” checkbox UX).
 * 2. Add your production hostnames (and `localhost` / `127.0.0.1` for local).
 * 3. Copy the **sitekey** into the frontend (`siteKey` input). Store the
 *    **secret** only in your backend environment (never in the browser bundle).
 *
 * ## Verify server-side (high level)
 * POST `https://challenges.cloudflare.com/turnstile/v0/siteverify` with
 * `secret`, `response` (the token from `(tokenChange)` / `cf-turnstile-response`),
 * and optionally `remoteip`. Require `success === true`, and preferably match
 * `action` / `hostname` to what you expect. Tokens expire (~5 minutes) and are
 * single-use — call `widget.reset()` before allowing a retry.
 *
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export { Turnstile } from './turnstile';
export {
  TURNSTILE_SCRIPT_URL,
  TURNSTILE_TEST_SITEKEYS,
  loadTurnstileScript,
  type TurnstileApi,
  type TurnstileAppearance,
  type TurnstileExecution,
  type TurnstileRenderOptions,
  type TurnstileSize,
  type TurnstileTheme,
} from './turnstile-api';
