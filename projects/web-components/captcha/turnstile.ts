import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  loadTurnstileScript,
  type TurnstileApi,
  type TurnstileAppearance,
  type TurnstileExecution,
  type TurnstileSize,
  type TurnstileTheme,
} from './turnstile-api';

let nextHostId = 0;

/**
 * Angular wrapper for Cloudflare Turnstile.
 *
 * Renders the official Turnstile widget (managed “I’m not a robot” UX when the
 * sitekey is configured for Managed mode). Emits a provider token that the
 * **site backend must verify** with Cloudflare’s Siteverify API — the client
 * checkbox alone is not a security check.
 *
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
@Component({
  selector: 'ui-turnstile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-ui-turnstile]': 'true',
    '[class]': 'hostClass()',
  },
  template: `
    @if (label()) {
      <p class="mb-2 text-sm text-ink-muted" [id]="labelId">{{ label() }}</p>
    }
    <div
      #container
      class="min-h-[65px]"
      role="group"
      [attr.aria-labelledby]="label() ? labelId : null"
      [attr.aria-busy]="loading() || null"
      [attr.aria-live]="'polite'"
    ></div>
  `,
})
export class Turnstile {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly container = viewChild.required<ElementRef<HTMLElement>>('container');

  readonly labelId = `ui-turnstile-label-${++nextHostId}`;

  /** Public sitekey from the Cloudflare Turnstile dashboard (or a test sitekey). */
  readonly siteKey = input.required<string>();
  /** Optional visible caption above the widget (accessibility). */
  readonly label = input<string | undefined>(undefined);
  /** Turnstile theme. Prefer binding site resolved theme (`light`/`dark`) or leave `auto`. */
  readonly theme = input<TurnstileTheme>('auto');
  readonly size = input<TurnstileSize>('normal');
  /** ISO 639-1 / region code, or `auto`. */
  readonly language = input<string>('auto');
  /** Action name verified server-side (1–32 chars: letters, numbers, `_`, `-`). */
  readonly action = input<string | undefined>(undefined);
  /** Customer data returned by Siteverify (≤255 alphanumeric / `_` / `-`). */
  readonly cData = input<string | undefined>(undefined);
  readonly appearance = input<TurnstileAppearance>('always');
  readonly execution = input<TurnstileExecution>('render');
  readonly tabIndex = input(0);
  readonly responseField = input(true);
  readonly responseFieldName = input('cf-turnstile-response');
  /** Extra host classes (token-based utilities only). */
  readonly styleClass = input('');

  protected readonly hostClass = computed(() =>
    ['block max-w-full', this.styleClass()].filter(Boolean).join(' '),
  );

  /** Token from a successful challenge — send to your backend for Siteverify. */
  readonly tokenChange = output<string>();
  readonly errored = output<string | undefined>();
  readonly expired = output<void>();
  readonly timedOut = output<void>();
  readonly unsupported = output<void>();
  /** Fires when the widget is reset (manual or config change). */
  readonly resetChange = output<void>();

  /** Current token (empty until success or after reset/expire). */
  readonly token = signal('');
  readonly loading = signal(true);

  private api: TurnstileApi | null = null;
  private widgetId: string | undefined;
  private disposed = false;
  private allowRerender = false;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading.set(false);
      return;
    }

    afterNextRender(() => {
      void this.mount();
    });

    effect(() => {
      this.siteKey();
      this.theme();
      this.size();
      this.language();
      this.action();
      this.cData();
      this.appearance();
      this.execution();
      this.tabIndex();
      this.responseField();
      this.responseFieldName();
      if (!this.allowRerender || !this.api) {
        return;
      }
      untracked(() => this.rerender());
    });

    this.destroyRef.onDestroy(() => {
      this.disposed = true;
      this.allowRerender = false;
      this.removeWidget();
    });
  }

  /** Clears the current token and asks Turnstile for a fresh challenge. */
  reset(): void {
    this.token.set('');
    this.resetChange.emit();
    if (this.api && this.widgetId !== undefined) {
      this.api.reset(this.widgetId);
    }
  }

  /** Runs the challenge when `execution` is `execute`. */
  execute(): void {
    if (this.api && this.widgetId !== undefined) {
      this.api.execute(this.container().nativeElement);
    }
  }

  /** Latest response token from the live widget, if any. */
  getResponse(): string | undefined {
    if (this.api && this.widgetId !== undefined) {
      return this.api.getResponse(this.widgetId);
    }
    return this.token() || undefined;
  }

  private async mount(): Promise<void> {
    try {
      this.loading.set(true);
      this.api = await loadTurnstileScript();
      if (this.disposed) return;
      this.renderWidget();
      this.allowRerender = true;
    } catch (err) {
      this.loading.set(false);
      const message = err instanceof Error ? err.message : 'Turnstile failed to load';
      this.errored.emit(message);
    }
  }

  private rerender(): void {
    this.removeWidget();
    this.token.set('');
    this.resetChange.emit();
    this.renderWidget();
  }

  private renderWidget(): void {
    if (!this.api || this.disposed) return;
    const el = this.container().nativeElement;
    el.replaceChildren();

    const language = this.language();
    const action = this.action();
    const cData = this.cData();

    this.widgetId = this.api.render(el, {
      sitekey: this.siteKey(),
      theme: this.theme(),
      size: this.size(),
      ...(language !== 'auto' ? { language } : {}),
      ...(action ? { action } : {}),
      ...(cData ? { cData } : {}),
      appearance: this.appearance(),
      execution: this.execution(),
      tabindex: this.tabIndex(),
      'response-field': this.responseField(),
      'response-field-name': this.responseFieldName(),
      callback: (token) => {
        this.token.set(token);
        this.tokenChange.emit(token);
      },
      'error-callback': (code) => {
        this.token.set('');
        this.errored.emit(code);
      },
      'expired-callback': () => {
        this.token.set('');
        this.expired.emit();
      },
      'timeout-callback': () => {
        this.token.set('');
        this.timedOut.emit();
      },
      'unsupported-callback': () => {
        this.unsupported.emit();
      },
    });
    this.loading.set(false);
  }

  private removeWidget(): void {
    if (this.api && this.widgetId !== undefined) {
      this.api.remove(this.widgetId);
      this.widgetId = undefined;
    }
  }
}
