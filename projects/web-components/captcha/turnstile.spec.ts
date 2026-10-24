import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  TURNSTILE_SCRIPT_URL,
  TURNSTILE_TEST_SITEKEYS,
  loadTurnstileScript,
  resetTurnstileScriptLoaderForTests,
  type TurnstileApi,
  type TurnstileRenderOptions,
} from './turnstile-api';
import { Turnstile } from './turnstile';

class MockTurnstileApi implements TurnstileApi {
  readonly rendered: TurnstileRenderOptions[] = [];
  readonly resetCalls: string[] = [];
  readonly removeCalls: string[] = [];
  readonly executeCalls: (string | HTMLElement | undefined)[] = [];
  private seq = 0;
  private responses = new Map<string, string>();

  ready(callback: () => void): void {
    callback();
  }

  render(_container: string | HTMLElement, options: TurnstileRenderOptions): string {
    const id = `widget-${++this.seq}`;
    this.rendered.push(options);
    return id;
  }

  reset(widgetId?: string): void {
    if (widgetId) this.resetCalls.push(widgetId);
  }

  remove(widgetId?: string): void {
    if (widgetId) this.removeCalls.push(widgetId);
  }

  getResponse(widgetId?: string): string | undefined {
    return widgetId ? this.responses.get(widgetId) : undefined;
  }

  isExpired(): boolean {
    return false;
  }

  execute(container?: string | HTMLElement): void {
    this.executeCalls.push(container);
  }

  succeed(token = 'test-token'): void {
    const opts = this.rendered.at(-1);
    const id = `widget-${this.seq}`;
    this.responses.set(id, token);
    opts?.callback?.(token);
  }

  fail(code = '400020'): void {
    this.rendered.at(-1)?.['error-callback']?.(code);
  }

  expire(): void {
    this.rendered.at(-1)?.['expired-callback']?.();
  }
}

@Component({
  selector: 'ui-host',
  imports: [Turnstile],
  template: `
    <ui-turnstile
      #widget
      [siteKey]="siteKey()"
      [label]="label"
      [theme]="theme"
      [size]="size"
      [action]="action"
      [cData]="cData"
      (tokenChange)="onToken($event)"
      (errored)="onError($event)"
      (expired)="onExpired()"
      (resetChange)="onReset()"
    />
  `,
})
class Host {
  readonly widget = viewChild.required(Turnstile);
  readonly siteKey = signal<string>(TURNSTILE_TEST_SITEKEYS.alwaysPasses);
  label = 'Verify you are human';
  theme: 'auto' | 'light' | 'dark' = 'light';
  size: 'normal' | 'flexible' | 'compact' = 'normal';
  action: string | undefined = 'contact';
  cData: string | undefined = undefined;
  tokens: string[] = [];
  errors: (string | undefined)[] = [];
  expiredCount = 0;
  resetCount = 0;

  onToken(token: string): void {
    this.tokens.push(token);
  }

  onError(code: string | undefined): void {
    this.errors.push(code);
  }

  onExpired(): void {
    this.expiredCount += 1;
  }

  onReset(): void {
    this.resetCount += 1;
  }
}

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('loadTurnstileScript', () => {
  afterEach(() => {
    resetTurnstileScriptLoaderForTests();
    document.querySelectorAll('script[data-ui-turnstile-script]').forEach((s) => s.remove());
    delete window.turnstile;
  });

  it('resolves immediately when window.turnstile already exists', async () => {
    const api = new MockTurnstileApi();
    window.turnstile = api;
    await expect(loadTurnstileScript()).resolves.toBe(api);
    expect(document.querySelectorAll('script[data-ui-turnstile-script]').length).toBe(0);
  });

  it('injects the official script URL once', async () => {
    const api = new MockTurnstileApi();
    const pending = loadTurnstileScript();
    const script = document.querySelector<HTMLScriptElement>('script[data-ui-turnstile-script]');
    expect(script?.getAttribute('src')).toBe(TURNSTILE_SCRIPT_URL);
    window.turnstile = api;
    script?.dispatchEvent(new Event('load'));
    await expect(pending).resolves.toBe(api);

    const again = loadTurnstileScript();
    expect(document.querySelectorAll('script[data-ui-turnstile-script]').length).toBe(1);
    await expect(again).resolves.toBe(api);
  });
});

describe('Turnstile', () => {
  let api: MockTurnstileApi;

  beforeEach(() => {
    resetTurnstileScriptLoaderForTests();
    document.querySelectorAll('script[data-ui-turnstile-script]').forEach((s) => s.remove());
    api = new MockTurnstileApi();
    window.turnstile = api;
    TestBed.configureTestingModule({ imports: [Host] });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    resetTurnstileScriptLoaderForTests();
    document.querySelectorAll('script[data-ui-turnstile-script]').forEach((s) => s.remove());
    delete window.turnstile;
  });

  it('renders with siteKey, theme, size, action and exposes an accessible label', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    await settle();
    fixture.detectChanges();

    expect(api.rendered.length).toBe(1);
    const opts = api.rendered[0]!;
    expect(opts.sitekey).toBe(TURNSTILE_TEST_SITEKEYS.alwaysPasses);
    expect(opts.theme).toBe('light');
    expect(opts.size).toBe('normal');
    expect(opts.action).toBe('contact');

    const hostEl = fixture.nativeElement as HTMLElement;
    const label = hostEl.querySelector('p');
    const group = hostEl.querySelector('[role="group"]');
    expect(label?.textContent).toBe('Verify you are human');
    expect(group?.getAttribute('aria-labelledby')).toBe(label?.id ?? null);
  });

  it('emits tokenChange on success and clears on reset', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    await settle();
    fixture.detectChanges();

    const host = fixture.componentInstance;
    api.succeed('tok-1');
    expect(host.tokens).toEqual(['tok-1']);
    expect(host.widget().token()).toBe('tok-1');

    host.widget().reset();
    expect(host.widget().token()).toBe('');
    expect(host.resetCount).toBe(1);
    expect(api.resetCalls.length).toBe(1);
  });

  it('emits errored and expired callbacks', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    await settle();
    fixture.detectChanges();

    const host = fixture.componentInstance;
    api.fail('600010');
    expect(host.errors).toEqual(['600010']);
    expect(host.widget().token()).toBe('');

    api.succeed('tok-2');
    api.expire();
    expect(host.expiredCount).toBe(1);
    expect(host.widget().token()).toBe('');
  });

  it('re-renders when siteKey changes and removes the previous widget on destroy', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    await settle();
    fixture.detectChanges();
    expect(api.rendered.length).toBe(1);

    fixture.componentInstance.siteKey.set(TURNSTILE_TEST_SITEKEYS.alwaysBlocks);
    fixture.detectChanges();
    await settle();
    fixture.detectChanges();

    expect(api.removeCalls.length).toBeGreaterThanOrEqual(1);
    expect(api.rendered.at(-1)?.sitekey).toBe(TURNSTILE_TEST_SITEKEYS.alwaysBlocks);

    fixture.destroy();
    expect(api.removeCalls.length).toBeGreaterThanOrEqual(2);
  });
});
