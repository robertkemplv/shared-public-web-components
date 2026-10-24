import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ThemeService, provideTheme } from './theme';

describe('ThemeService', () => {
  let mediaMatches = false;
  let mediaListeners: EventListener[] = [];
  let documentElement: HTMLElement;

  const matchMedia = (query: string): MediaQueryList =>
    ({
      matches: mediaMatches,
      media: query,
      addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
        if (type === 'change' && typeof listener === 'function') {
          mediaListeners.push(listener);
        }
      },
      removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
        if (type === 'change' && typeof listener === 'function') {
          mediaListeners = mediaListeners.filter((l) => l !== listener);
        }
      },
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;

  beforeEach(() => {
    localStorage.clear();
    mediaMatches = false;
    mediaListeners = [];
    documentElement = document.documentElement;
    documentElement.classList.remove('dark');
    documentElement.removeAttribute('data-theme');
    documentElement.style.colorScheme = '';

    TestBed.configureTestingModule({
      providers: [
        provideTheme({ storageKey: 'test-theme' }),
        {
          provide: DOCUMENT,
          useValue: {
            documentElement,
            head: document.head,
            defaultView: { matchMedia },
          },
        },
      ],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    documentElement.classList.remove('dark');
    documentElement.removeAttribute('data-theme');
    documentElement.style.colorScheme = '';
  });

  it('defaults to system and resolves from OS preference', () => {
    mediaMatches = true;
    const theme = TestBed.inject(ThemeService);
    expect(theme.theme()).toBe('system');
    expect(theme.resolved()).toBe('dark');
    expect(theme.isDark()).toBe(true);
    expect(documentElement.classList.contains('dark')).toBe(true);
    expect(documentElement.getAttribute('data-theme')).toBe('system');
  });

  it('cycles light → dark → system', () => {
    const theme = TestBed.inject(ThemeService);
    theme.setTheme('light');
    expect(theme.theme()).toBe('light');
    theme.toggle();
    expect(theme.theme()).toBe('dark');
    theme.toggle();
    expect(theme.theme()).toBe('system');
    theme.toggle();
    expect(theme.theme()).toBe('light');
  });

  it('persists the choice under the configured storage key', () => {
    const theme = TestBed.inject(ThemeService);
    theme.setTheme('dark');
    expect(localStorage.getItem('test-theme')).toBe('dark');
  });
});
