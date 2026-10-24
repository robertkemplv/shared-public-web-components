/** One live (or soon-to-ship) language. Sites own the JSON; the library takes a config object. */
export interface LocaleDefinition {
  code: string;
  /** Endonym shown in the language menu — labels need no per-language translation. */
  nativeLabel: string;
  ogLocale?: string;
  hreflang?: string;
  dir?: 'ltr' | 'rtl';
  dateLocale?: string;
}

export interface DefineLocalesConfig {
  defaultCode: string;
  locales: readonly LocaleDefinition[];
}

export interface AlternateLink {
  hreflang: string;
  href: string;
}

export interface ParsedPath {
  lang: string;
  neutralPath: string;
}

export interface Locales {
  readonly codes: readonly string[];
  readonly defaultCode: string;
  readonly prefixed: readonly string[];
  isLang(value: string): boolean;
  get(code: string): LocaleDefinition | undefined;
  localizedPath(lang: string, neutralPath: string): string;
  parsePath(url: string): ParsedPath;
  alternates(origin: string, neutralPath: string, langs?: readonly string[]): AlternateLink[];
}

/**
 * Builds a locale helper bag from site config.
 * Default language is unprefixed; every other live locale uses `/{code}/...`.
 * Uses LV's segment-based `parsePath` so codes like `zh-hans` work.
 */
export function defineLocales(config: DefineLocalesConfig): Locales {
  const locales = Object.freeze([...config.locales]);
  const defaultCode = config.defaultCode;
  const codes = Object.freeze(locales.map((l) => l.code));
  const byCode = new Map(locales.map((l) => [l.code, l]));
  const prefixed = Object.freeze(codes.filter((c) => c !== defaultCode));

  if (!byCode.has(defaultCode)) {
    throw new Error(`defineLocales: defaultCode "${defaultCode}" is not in locales`);
  }

  const isLang = (value: string): boolean => byCode.has(value);

  const get = (code: string): LocaleDefinition | undefined => byCode.get(code);

  const localizedPath = (lang: string, neutralPath: string): string => {
    const path = neutralPath === '' ? '/' : neutralPath;
    if (lang === defaultCode || !isLang(lang)) {
      return path;
    }
    return path === '/' ? `/${lang}` : `/${lang}${path}`;
  };

  const parsePath = (urlPath: string): ParsedPath => {
    const path = (urlPath.split(/[?#]/)[0] || '/').replace(/\/+$/, '') || '/';
    const segments = path.split('/').filter(Boolean);
    const first = segments[0];
    if (first && isLang(first) && first !== defaultCode) {
      const rest = segments.slice(1).join('/');
      return { lang: first, neutralPath: rest ? `/${rest}` : '/' };
    }
    return { lang: defaultCode, neutralPath: path };
  };

  const alternates = (
    origin: string,
    neutralPath: string,
    langs: readonly string[] = codes,
  ): AlternateLink[] => {
    const list: AlternateLink[] = [];
    for (const lang of langs) {
      const def = get(lang);
      if (!def) continue;
      list.push({
        hreflang: def.hreflang ?? lang,
        href: absoluteUrl(origin, localizedPath(lang, neutralPath)),
      });
    }
    list.push({
      hreflang: 'x-default',
      href: absoluteUrl(origin, localizedPath(defaultCode, neutralPath)),
    });
    return list;
  };

  return {
    codes,
    defaultCode,
    prefixed,
    isLang,
    get,
    localizedPath,
    parsePath,
    alternates,
  };
}

export function absoluteUrl(origin: string, path: string): string {
  const base = origin.replace(/\/+$/, '');
  return path === '/' ? `${base}/` : `${base}${path}`;
}

/**
 * Absolute URL on another site that shares the same locale codes and URL pattern
 * (default unprefixed, others `/{lang}/...`). Pass `locales` when the default is not `en`.
 */
export function crossSiteUrl(
  origin: string,
  lang: string,
  neutralPath = '/',
  locales?: Pick<Locales, 'localizedPath'>,
): string {
  if (locales) {
    return absoluteUrl(origin, locales.localizedPath(lang, neutralPath));
  }
  const path = neutralPath === '' ? '/' : neutralPath;
  const localized = lang === 'en' ? path : path === '/' ? `/${lang}` : `/${lang}${path}`;
  return absoluteUrl(origin, localized);
}

export const LUMVIR_ORIGIN = 'https://lumvir.com';
export const GOOD_CALL_ORIGIN = 'https://goodcallbingo.com';

/** Official Lumvir social profiles (both marketing sites link these accounts). */
export const LUMVIR_SOCIAL_PROFILES = {
  x: 'https://x.com/lumvir',
  facebook: 'https://www.facebook.com/lumvir',
  instagram: 'https://www.instagram.com/lumvir',
  youtube: 'https://www.youtube.com/@lumvir',
} as const;
