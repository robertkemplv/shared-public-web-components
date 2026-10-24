import { DOCUMENT } from '@angular/common';
import {
  DestroyRef,
  Injectable,
  InjectionToken,
  computed,
  inject,
  makeEnvironmentProviders,
  signal,
  type EnvironmentProviders,
} from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeConfig {
  storageKey: string;
  /** When set, syncs every `meta[name=theme-color]` (GC behaviour). */
  themeColor?: { light: string; dark: string };
}

export const THEME_CONFIG = new InjectionToken<ThemeConfig>('THEME_CONFIG');

const THEME_CYCLE: readonly ThemeMode[] = ['light', 'dark', 'system'];

export function provideTheme(config: ThemeConfig): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: THEME_CONFIG, useValue: config }, ThemeService]);
}

@Injectable()
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly config = inject(THEME_CONFIG);

  private readonly mode = signal<ThemeMode>(this.readInitialTheme());
  private readonly systemDark = signal(this.readSystemPrefersDark());

  readonly theme = this.mode.asReadonly();
  readonly resolved = computed<ResolvedTheme>(() => {
    const preference = this.mode();
    if (preference === 'system') {
      return this.systemDark() ? 'dark' : 'light';
    }
    return preference;
  });
  readonly isDark = computed(() => this.resolved() === 'dark');

  constructor() {
    this.apply(this.mode(), this.resolved());
    this.listenForSystemPreference();
  }

  /** Cycles light → dark → system → light. */
  toggle(): void {
    const current = this.mode();
    const index = THEME_CYCLE.indexOf(current);
    const next = THEME_CYCLE[(index + 1) % THEME_CYCLE.length]!;
    this.setTheme(next);
  }

  setTheme(theme: ThemeMode): void {
    this.mode.set(theme);
    this.apply(theme, this.resolved());
    try {
      localStorage.setItem(this.config.storageKey, theme);
    } catch {
      /* private browsing / storage blocked */
    }
  }

  private readInitialTheme(): ThemeMode {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      /* ignore */
    }
    return 'system';
  }

  private readSystemPrefersDark(): boolean {
    return this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }

  private listenForSystemPreference(): void {
    const media = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return;

    const onChange = (event: MediaQueryListEvent): void => {
      this.systemDark.set(event.matches);
      if (this.mode() === 'system') {
        this.apply('system', this.resolved());
      }
    };

    media.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => media.removeEventListener('change', onChange));
  }

  private apply(preference: ThemeMode, resolved: ResolvedTheme): void {
    const root = this.document.documentElement;
    root.classList.toggle('dark', resolved === 'dark');
    root.style.colorScheme = resolved;
    root.setAttribute('data-theme', preference);

    const colors = this.config.themeColor;
    if (!colors || !this.document.head) return;
    this.document.head
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => {
        const scheme: ResolvedTheme = meta.getAttribute('media')?.includes('dark')
          ? 'dark'
          : 'light';
        meta.setAttribute('content', colors[preference === 'system' ? scheme : resolved]);
      });
  }
}
