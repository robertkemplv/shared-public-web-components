import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  InjectionToken,
  PLATFORM_ID,
  inject,
  makeEnvironmentProviders,
  signal,
  type EnvironmentProviders,
} from '@angular/core';
import { Router } from '@angular/router';
import type { Locales } from '@lumvir/web-components/locale';
import { from, type Observable } from 'rxjs';

export interface LanguageConfig {
  locales: Locales;
  storageKey: string;
  /**
   * Site hook for i18n libraries (e.g. `(l) => inject(TranslateService).use(l)`).
   * The library has no ngx-translate dependency.
   */
  apply?: (lang: string) => Observable<unknown> | Promise<unknown> | void;
}

export const LANGUAGE_CONFIG = new InjectionToken<LanguageConfig>('LANGUAGE_CONFIG');

export function provideLanguage(config: LanguageConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: LANGUAGE_CONFIG, useValue: config },
    LanguageService,
  ]);
}

/**
 * Language choice + URL twins.
 * Order: saved choice, then URL, then browser language. EN (default) unprefixed; no `?lang=`.
 */
@Injectable()
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly config = inject(LANGUAGE_CONFIG);

  private readonly current = signal<string>(this.config.locales.defaultCode);

  readonly language = this.current.asReadonly();
  readonly languages = this.config.locales.codes;
  readonly locales = this.config.locales;

  /** Language-neutral path of the current page, or null when the page has no twin (404). */
  readonly neutralPath = signal<string | null>('/');

  /** Runs once in the browser after the first page is shown (never while prerendering). */
  init(): void {
    const saved = this.savedChoice();
    if (saved) {
      void this.use(saved, { replaceUrl: true });
      return;
    }
    if (this.addressLanguage()) {
      return;
    }
    void this.use(this.browserLanguage(), { replaceUrl: true });
  }

  async use(lang: string, options: { replaceUrl?: boolean } = {}): Promise<void> {
    if (!this.config.locales.isLang(lang)) return;
    await this.runApply(lang);
    this.current.set(lang);
    this.document.documentElement.lang = lang;
    try {
      localStorage.setItem(this.config.storageKey, lang);
    } catch {
      /* ignore */
    }
    this.followUrl(lang, options.replaceUrl ?? false);
  }

  /** Shows the language of the page being opened, without saving a choice. */
  applyPage(lang: string): Observable<unknown> {
    const code = this.config.locales.isLang(lang) ? lang : this.config.locales.defaultCode;
    this.current.set(code);
    this.document.documentElement.lang = code;
    return from(Promise.resolve(this.runApply(code)));
  }

  pathFor(lang: string, neutralPath: string): string {
    return this.config.locales.localizedPath(lang, neutralPath);
  }

  /** Current-language URL for a neutral path (nav links). */
  link(neutralPath: string): string {
    return this.config.locales.localizedPath(this.current(), neutralPath);
  }

  dateLocale(): string {
    return this.config.locales.get(this.current())?.dateLocale ?? this.current();
  }

  private async runApply(lang: string): Promise<void> {
    const result = this.config.apply?.(lang);
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      await result;
      return;
    }
    if (result && typeof (result as Observable<unknown>).subscribe === 'function') {
      await new Promise<void>((resolve, reject) => {
        (result as Observable<unknown>).subscribe({
          next: () => undefined,
          error: reject,
          complete: () => resolve(),
        });
      });
    }
  }

  private followUrl(lang: string, replaceUrl: boolean): void {
    const neutral = this.neutralPath();
    if (!this.isBrowser || neutral === null) return;
    if (this.config.locales.parsePath(this.router.url).lang === lang) return;
    void this.router.navigateByUrl(this.config.locales.localizedPath(lang, neutral), {
      replaceUrl,
    });
  }

  private savedChoice(): string | null {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored && this.config.locales.isLang(stored)) return stored;
    } catch {
      /* ignore */
    }
    return null;
  }

  private addressLanguage(): string | null {
    return this.config.locales.parsePath(this.router.url).lang;
  }

  private browserLanguage(): string {
    const browser = (
      this.document.defaultView?.navigator?.language ?? this.config.locales.defaultCode
    ).toLowerCase();
    const codes = [...this.config.locales.codes].sort((a, b) => b.length - a.length);
    for (const code of codes) {
      if (browser === code || browser.startsWith(`${code}-`)) return code;
    }
    return this.config.locales.defaultCode;
  }
}
