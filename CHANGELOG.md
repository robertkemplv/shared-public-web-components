# Changelog

All notable changes to `@lumvir/web-components` are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [SemVer](https://semver.org/) (0.x while the API settles).

## [0.1.0] - 2026-10-24

### Added

- **`locale`** — `defineLocales`, path helpers, hreflang `alternates`, `absoluteUrl`, `crossSiteUrl`, `LUMVIR_ORIGIN`, `GOOD_CALL_ORIGIN`, `LUMVIR_SOCIAL_PROFILES` (framework-free).
- **`theme`** — `provideTheme`, `ThemeService`, `button[uiThemeToggle]`, `<ui-theme-icon>`.
- **`language`** — `provideLanguage`, `LanguageService`, `<ui-language-select>`.
- **`select`** — `<ui-select>` with `model()` value, CVA, clear/loading, token-based focus styles, 44 px / 16 px a11y minimums.
- **`icon`** — `<ui-icon>`, `provideIcons`, `IconNameRegistry` augmentation, default glyphs for library controls.
- **`menu`** — headless `[uiMobileMenu]`, `button[uiMenuToggle]`, `<ui-menu-backdrop>` (Escape, scroll lock, desktop auto-close, router close, focus return).
- **`seo`** — `HeadTags` writer (`setTitle`, meta name/property, canonical, alternates, JSON-LD, document language).
- CI (`lint`, format, typecheck, tests, build, no-colors) and release workflow that attaches `lumvir-web-components-*.tgz` to the GitHub Release.
