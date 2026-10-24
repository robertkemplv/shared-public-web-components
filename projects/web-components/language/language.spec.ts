import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { defineLocales } from '@lumvir/web-components/locale';
import { LanguageService, provideLanguage } from './language';

const locales = defineLocales({
  defaultCode: 'en',
  locales: [
    { code: 'en', nativeLabel: 'English', dateLocale: 'en-US' },
    { code: 'es', nativeLabel: 'Español', dateLocale: 'es-ES' },
  ],
});

describe('LanguageService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        provideLanguage({ locales, storageKey: 'test-lang' }),
        {
          provide: DOCUMENT,
          useValue: {
            documentElement: document.documentElement,
            defaultView: { navigator: { language: 'en-US' }, matchMedia: () => null },
          },
        },
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('builds pathFor / link / dateLocale', () => {
    const lang = TestBed.inject(LanguageService);
    expect(lang.pathFor('es', '/privacy')).toBe('/es/privacy');
    expect(lang.link('/products')).toBe('/products');
    expect(lang.dateLocale()).toBe('en-US');
  });

  it('use() saves and navigates to the twin URL', async () => {
    const lang = TestBed.inject(LanguageService);
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    lang.neutralPath.set('/privacy');
    await lang.use('es');
    expect(lang.language()).toBe('es');
    expect(localStorage.getItem('test-lang')).toBe('es');
    expect(navigate).toHaveBeenCalledWith('/es/privacy', { replaceUrl: false });
  });

  it('applyPage does not persist a choice', async () => {
    const lang = TestBed.inject(LanguageService);
    lang.applyPage('es').subscribe();
    expect(lang.language()).toBe('es');
    expect(localStorage.getItem('test-lang')).toBeNull();
  });
});
