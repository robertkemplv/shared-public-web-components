/**
 * Cloudflare Turnstile client API surface used by `<ui-turnstile>`.
 *
 * The script must be loaded from Cloudflare's exact URL (do not proxy/cache).
 * @see https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
 */

export const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit' as const;

/** Cloudflare dummy sitekeys for local/playground use (any domain). */
export const TURNSTILE_TEST_SITEKEYS = {
  /** Visible widget; challenge always passes. */
  alwaysPasses: '1x00000000000000000000AA',
  /** Visible widget; challenge always fails. */
  alwaysBlocks: '2x00000000000000000000AB',
  /** Invisible widget; challenge always passes. */
  alwaysPassesInvisible: '1x00000000000000000000BB',
  /** Invisible widget; challenge always fails. */
  alwaysBlocksInvisible: '2x00000000000000000000BB',
  /** Forces an interactive challenge. */
  forcesInteractive: '3x00000000000000000000FF',
} as const;

export type TurnstileTheme = 'auto' | 'light' | 'dark';
export type TurnstileSize = 'normal' | 'flexible' | 'compact';
export type TurnstileAppearance = 'always' | 'execute' | 'interaction-only';
export type TurnstileExecution = 'render' | 'execute';

export interface TurnstileRenderOptions {
  sitekey: string;
  action?: string;
  cData?: string;
  theme?: TurnstileTheme;
  size?: TurnstileSize;
  language?: string;
  tabindex?: number;
  appearance?: TurnstileAppearance;
  execution?: TurnstileExecution;
  retry?: 'auto' | 'never';
  'retry-interval'?: number;
  'refresh-expired'?: 'auto' | 'manual' | 'never';
  'response-field'?: boolean;
  'response-field-name'?: string;
  callback?: (token: string) => void;
  'error-callback'?: (errorCode?: string) => void;
  'expired-callback'?: () => void;
  'timeout-callback'?: () => void;
  'unsupported-callback'?: () => void;
  'before-interactive-callback'?: () => void;
  'after-interactive-callback'?: () => void;
}

export interface TurnstileApi {
  ready(callback: () => void): void;
  render(container: string | HTMLElement, options: TurnstileRenderOptions): string | undefined;
  reset(widgetId?: string): void;
  remove(widgetId?: string): void;
  getResponse(widgetId?: string): string | undefined;
  isExpired(widgetId?: string): boolean;
  execute(container?: string | HTMLElement, options?: TurnstileRenderOptions): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loadPromise: Promise<TurnstileApi> | null = null;

/**
 * Loads Turnstile's script once and resolves with `window.turnstile`.
 * Safe to call from many components; concurrent callers share one promise.
 */
export function loadTurnstileScript(
  doc: Document = document,
  scriptUrl: string = TURNSTILE_SCRIPT_URL,
): Promise<TurnstileApi> {
  if (typeof window !== 'undefined' && window.turnstile) {
    return Promise.resolve(window.turnstile);
  }
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const existing = doc.querySelector<HTMLScriptElement>(
      `script[data-ui-turnstile-script="true"]`,
    );
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.turnstile) resolve(window.turnstile);
        else reject(new Error('Turnstile script loaded but window.turnstile is missing'));
      });
      existing.addEventListener('error', () => {
        loadPromise = null;
        reject(new Error('Failed to load Turnstile script'));
      });
      return;
    }

    const script = doc.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.defer = true;
    script.dataset['uiTurnstileScript'] = 'true';
    script.addEventListener('load', () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error('Turnstile script loaded but window.turnstile is missing'));
    });
    script.addEventListener('error', () => {
      loadPromise = null;
      reject(new Error('Failed to load Turnstile script'));
    });
    (doc.head ?? doc.documentElement).appendChild(script);
  });

  return loadPromise;
}

/** Test-only: clear the singleton so specs can re-load. */
export function resetTurnstileScriptLoaderForTests(): void {
  loadPromise = null;
}
