# `@lumvir/web-components`

Shared Angular UI primitives for [Lumvir](https://lumvir.com) and [Good Call](https://goodcallbingo.com). Secondary entry points, no brand colours, GitHub Release tarball distribution.

## Install

```bash
npm i https://github.com/robertkemplv/shared-public-web-components/releases/download/v0.2.0/lumvir-web-components-0.2.0.tgz
```

Pin the exact URL (and lockfile integrity). Bumps are a one-line PR.

## Entry points

| Import                            | Contents                                                                                |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| `@lumvir/web-components/locale`   | `defineLocales`, paths, hreflang, `crossSiteUrl`, origins, social profiles (no Angular) |
| `@lumvir/web-components/theme`    | `provideTheme`, `ThemeService`, `uiThemeToggle`, `ui-theme-icon`                        |
| `@lumvir/web-components/language` | `provideLanguage`, `LanguageService`, `ui-language-select`                              |
| `@lumvir/web-components/select`   | `ui-select`                                                                             |
| `@lumvir/web-components/icon`     | `ui-icon`, `provideIcons`                                                               |
| `@lumvir/web-components/menu`     | `uiMobileMenu`, `uiMenuToggle`, `ui-menu-backdrop`                                      |
| `@lumvir/web-components/seo`      | `HeadTags`                                                                              |
| `@lumvir/web-components/captcha`  | `<ui-turnstile>` (Cloudflare Turnstile; backend Siteverify required)                    |

## Captcha (Turnstile)

Real bot protection via [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/). The widget is not a decorative checkbox: it returns a **token** after Cloudflare’s challenge/risk check. Your **backend must verify** that token with Siteverify before trusting the request.

```ts
import { Turnstile, TURNSTILE_TEST_SITEKEYS } from '@lumvir/web-components/captcha';
```

```html
<ui-turnstile
  [siteKey]="siteKey"
  label="Verify you are human"
  theme="auto"
  action="contact"
  (tokenChange)="onToken($event)"
  (errored)="onCaptchaError($event)"
  (expired)="onCaptchaExpired()"
/>
```

| Input / API                                                                                                                       | Notes                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `siteKey` (required)                                                                                                              | Public key from the Turnstile dashboard (or `TURNSTILE_TEST_SITEKEYS.*` locally)   |
| `theme`                                                                                                                           | `auto` \| `light` \| `dark` (Turnstile’s own theme; bind site theme if you prefer) |
| `size`                                                                                                                            | `normal` \| `flexible` \| `compact`                                                |
| `language`, `action`, `cData`, `appearance`, `execution`, `tabIndex`, `responseField`, `responseFieldName`, `label`, `styleClass` | Optional widget / a11y options                                                     |
| `(tokenChange)`                                                                                                                   | Emit the token to send with the form/API call                                      |
| `(errored)`, `(expired)`, `(timedOut)`, `(unsupported)`, `(resetChange)`                                                          | Lifecycle                                                                          |
| `reset()`, `execute()`, `getResponse()`, `token()`                                                                                | Imperative helpers                                                                 |

### Keys and server verification

1. Cloudflare dashboard → **Turnstile** → create a **Managed** widget (checkbox UX). Add production hostnames plus `localhost` / `127.0.0.1` for local.
2. Put the **sitekey** in the frontend. Keep the **secret** only in backend env (`TURNSTILE_SECRET`).
3. On submit, POST the token to your backend. The backend calls:

`POST https://challenges.cloudflare.com/turnstile/v0/siteverify` with `secret`, `response` (token), optional `remoteip`.

Require `success === true` (and preferably matching `action` / `hostname`). Tokens last ~5 minutes and are **single-use** — call `reset()` before a retry. Never call Siteverify from the browser (it would expose the secret).

Playground demo uses Cloudflare’s always-pass test sitekey (`TURNSTILE_TEST_SITEKEYS.alwaysPasses`).

## Theme tokens

The library ships **no CSS file and no colours**. In your site `styles.css`:

```css
@import 'tailwindcss';
@source "../node_modules/@lumvir/web-components";

@theme inline {
  --color-canvas: /* … */;
  --color-surface: /* … */;
  --color-surface-hover: /* … */; /* e.g. GC: var(--color-sand) */
  --color-line: /* … */;
  --color-ink: /* … */;
  --color-ink-muted: /* … */;
  --color-focus: /* … */; /* e.g. GC brand-ink, LV amber-500 */
}
```

Define dark overrides on `.dark` the same way.

## Quick wire-up

```ts
import { defineLocales } from '@lumvir/web-components/locale';
import { provideTheme } from '@lumvir/web-components/theme';
import { provideLanguage } from '@lumvir/web-components/language';
import { provideIcons } from '@lumvir/web-components/icon';
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const locales = defineLocales({ defaultCode: 'en', locales: [/* from your JSON */] });

export const appConfig = {
  providers: [
    provideTheme({ storageKey: 'my-theme', themeColor: { light: '#…', dark: '#…' } }),
    provideLanguage({
      locales,
      storageKey: 'my-lang',
      apply: (l) => inject(TranslateService).use(l),
    }),
    provideIcons({/* site glyphs */}),
  ],
};
```

## Develop

```bash
npm ci
npm start          # playground
npm run ci         # full local gate
```

Requires Node from `.nvmrc` (24.22.0).

## License

MIT
