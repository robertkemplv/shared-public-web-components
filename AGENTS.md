# Agent rules for `@lumvir/web-components`

## Scope

Shared Angular UI primitives for the Lumvir and Good Call marketing sites. See `consumers.md`.

## Must

- **No brand colours in the library.** Templates use the CSS token contract only: `canvas`, `surface`, `surface-hover`, `line`, `ink`, `ink-muted`, `focus`. Sites define these in `@theme`. `npm run check:no-colors` must pass (no hex/rgb/hsl, no Tailwind palette utilities outside tests).
- **No site copy and no translation dependency.** Every visible string is an input. Language `apply` is a site-supplied hook.
- **Keep a11y behaviours**, each covered by a test: theme cycle labels, select 44 px / 16 px minimums and solid focus ring, mobile menu Escape / scroll lock / focus return / hamburger → X (reduced motion), head-tag writer escapes `<` in JSON-LD.
- Standalone OnPush components, `input()` / `model()` / `output()`, `host: {}`, zoneless and SSR/prerender-safe. No `any`.
- Public API changes need a `CHANGELOG.md` entry. Breaking changes bump major (minor while 0.x).
- Exact dependency pins. MIT/Apache-2.0 dependencies only. No third-party requests from library code, **except** the `captcha` entry, which loads Cloudflare Turnstile’s official `api.js` from `challenges.cloudflare.com` (required for a real bot check; do not proxy/cache that script).
- All CI steps must pass before merge.

## Layout

- Secondary entry points: `locale` (no Angular), `theme`, `language`, `select`, `icon`, `menu`, `seo`, `captcha`.
- Distribution: GitHub Release tarball (not GitHub Packages / npmjs).

## Do not

- Share header/footer/button/card shells — sites compose from these primitives.
- Ship a CSS file or default theme colours.
- Add ngx-translate or other i18n frameworks as dependencies.
