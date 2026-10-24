# `@lumvir/web-components`

Shared Angular UI primitives for [Lumvir](https://lumvir.com) and [Good Call](https://goodcallbingo.com). Secondary entry points, no brand colours, GitHub Release tarball distribution.

## Install

```bash
npm i https://github.com/robertkemplv/shared-public-web-components/releases/download/v0.1.0/lumvir-web-components-0.1.0.tgz
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
