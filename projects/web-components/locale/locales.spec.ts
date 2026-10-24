import {
  GOOD_CALL_ORIGIN,
  LUMVIR_ORIGIN,
  LUMVIR_SOCIAL_PROFILES,
  absoluteUrl,
  crossSiteUrl,
  defineLocales,
} from './locales';

describe('defineLocales', () => {
  const locales = defineLocales({
    defaultCode: 'en',
    locales: [
      { code: 'en', nativeLabel: 'English', hreflang: 'en', ogLocale: 'en_US', dir: 'ltr' },
      { code: 'es', nativeLabel: 'Español', hreflang: 'es', ogLocale: 'es_ES', dir: 'ltr' },
    ],
  });

  it('exposes codes with an unprefixed default', () => {
    expect(locales.defaultCode).toBe('en');
    expect(locales.codes).toEqual(['en', 'es']);
    expect(locales.prefixed).toEqual(['es']);
    expect(locales.isLang('en')).toBe(true);
    expect(locales.isLang('fr')).toBe(false);
    expect(locales.get('es')?.nativeLabel).toBe('Español');
  });

  it('builds localized paths without trailing slashes', () => {
    expect(locales.localizedPath('en', '/')).toBe('/');
    expect(locales.localizedPath('es', '/')).toBe('/es');
    expect(locales.localizedPath('en', '/privacy')).toBe('/privacy');
    expect(locales.localizedPath('es', '/terms')).toBe('/es/terms');
  });

  it('parses language from the URL with segment prefixes', () => {
    expect(locales.parsePath('/')).toEqual({ lang: 'en', neutralPath: '/' });
    expect(locales.parsePath('/es')).toEqual({ lang: 'es', neutralPath: '/' });
    expect(locales.parsePath('/es/')).toEqual({ lang: 'es', neutralPath: '/' });
    expect(locales.parsePath('/es/privacy?x=1')).toEqual({ lang: 'es', neutralPath: '/privacy' });
    expect(locales.parsePath('/estate')).toEqual({ lang: 'en', neutralPath: '/estate' });
    expect(locales.parsePath('/es/player')).toEqual({ lang: 'es', neutralPath: '/player' });
  });

  it('builds hreflang alternates including x-default', () => {
    expect(locales.alternates(GOOD_CALL_ORIGIN, '/privacy')).toEqual([
      { hreflang: 'en', href: 'https://goodcallbingo.com/privacy' },
      { hreflang: 'es', href: 'https://goodcallbingo.com/es/privacy' },
      { hreflang: 'x-default', href: 'https://goodcallbingo.com/privacy' },
    ]);
  });

  it('rejects a defaultCode missing from locales', () => {
    expect(() =>
      defineLocales({ defaultCode: 'fr', locales: [{ code: 'en', nativeLabel: 'English' }] }),
    ).toThrow(/defaultCode/);
  });
});

describe('absoluteUrl / crossSiteUrl', () => {
  it('joins origin and path', () => {
    expect(absoluteUrl(LUMVIR_ORIGIN, '/')).toBe('https://lumvir.com/');
    expect(absoluteUrl(LUMVIR_ORIGIN, '/es')).toBe('https://lumvir.com/es');
  });

  it('builds same-language cross-site URLs (EN-default convention)', () => {
    expect(crossSiteUrl(LUMVIR_ORIGIN, 'en')).toBe('https://lumvir.com/');
    expect(crossSiteUrl(LUMVIR_ORIGIN, 'es')).toBe('https://lumvir.com/es');
    expect(crossSiteUrl(LUMVIR_ORIGIN, 'es', '/products')).toBe('https://lumvir.com/es/products');
    expect(crossSiteUrl(GOOD_CALL_ORIGIN, 'en', '/about')).toBe('https://goodcallbingo.com/about');
  });

  it('exports Lumvir social profiles', () => {
    expect(LUMVIR_SOCIAL_PROFILES.x).toBe('https://x.com/lumvir');
    expect(LUMVIR_SOCIAL_PROFILES.youtube).toContain('youtube.com');
  });
});
