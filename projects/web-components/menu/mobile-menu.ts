import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  InjectionToken,
  effect,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

/** Shared handle so toggle / backdrop can talk to the menu host. */
export const UI_MOBILE_MENU = new InjectionToken<MobileMenu>('UI_MOBILE_MENU');

/**
 * Headless mobile nav behaviour. Put on the sticky header host (`exportAs: 'uiMobileMenu'`).
 * Handles Escape, scroll lock, desktop auto-close, and close on router navigation.
 *
 * `open` is a readonly signal (use `menu.open()` in templates). Use `openMenu()` / `toggle()` /
 * `close()` to change state.
 */
@Directive({
  selector: '[uiMobileMenu]',
  exportAs: 'uiMobileMenu',
  providers: [{ provide: UI_MOBILE_MENU, useExisting: forwardRef(() => MobileMenu) }],
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class MobileMenu {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router, { optional: true });

  /** Required media query for the desktop (inline) nav, e.g. `(min-width: 64rem)`. */
  readonly desktopQuery = input.required<string>();

  private readonly opened = signal(false);
  private toggleEl: HTMLElement | null = null;
  private panelIdValue = 'site-menu';

  /** Whether the mobile panel is open. */
  readonly open = this.opened.asReadonly();

  constructor() {
    effect((onCleanup) => {
      if (!this.opened()) return;
      const root = this.document.documentElement;
      const previous = root.style.overflow;
      root.style.overflow = 'hidden';
      onCleanup(() => {
        root.style.overflow = previous;
      });
    });

    effect((onCleanup) => {
      const query = this.desktopQuery();
      const media = this.document.defaultView?.matchMedia?.(query);
      if (!media) return;
      const onChange = (event: MediaQueryListEvent): void => {
        if (event.matches) this.close();
      };
      media.addEventListener('change', onChange);
      onCleanup(() => media.removeEventListener('change', onChange));
    });

    if (this.router) {
      this.router.events
        .pipe(
          filter((e): e is NavigationEnd => e instanceof NavigationEnd),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(() => this.close());
    }
  }

  /** Called by `uiMenuToggle` so Escape / backdrop can restore focus. */
  registerToggle(el: HTMLElement, panelId: string): void {
    this.toggleEl = el;
    this.panelIdValue = panelId;
  }

  panelId(): string {
    return this.panelIdValue;
  }

  openMenu(): void {
    this.opened.set(true);
  }

  toggle(): void {
    this.opened.update((v) => !v);
  }

  close(returnFocus = false): void {
    if (!this.opened()) return;
    this.opened.set(false);
    if (returnFocus) {
      this.toggleEl?.focus();
    }
  }

  /** Backdrop tap: close and return focus to the toggle. */
  closeAndRestoreFocus(): void {
    this.close(true);
  }

  protected onEscape(): void {
    if (!this.opened()) return;
    this.close(true);
  }
}

/**
 * Hamburger control: sets aria attrs and renders the three-bar → X animation
 * (respects `prefers-reduced-motion` via `motion-reduce:transition-none`).
 */
@Component({
  // Attribute selector on button so sites keep native button semantics.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[uiMenuToggle]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    type: 'button',
    class:
      'group inline-flex size-12 items-center justify-center rounded-sm border border-line bg-surface text-ink',
    '[attr.aria-expanded]': 'menuRef.open()',
    '[attr.aria-controls]': 'panelId()',
    '[attr.aria-label]': 'menuRef.open() ? closeLabel() : openLabel()',
    '(click)': 'menuRef.toggle()',
  },
  template: `
    <span class="flex h-5 w-6 flex-col justify-center gap-1.5" aria-hidden="true">
      <span
        class="block h-0.5 w-full origin-center rounded-full bg-current transition-[translate,rotate,scale] duration-500 ease-out motion-reduce:transition-none group-aria-expanded:translate-y-2 group-aria-expanded:rotate-45"
      ></span>
      <span
        class="block h-0.5 w-full origin-center rounded-full bg-current transition-[translate,rotate,scale] duration-500 ease-out motion-reduce:transition-none group-aria-expanded:scale-x-0"
      ></span>
      <span
        class="block h-0.5 w-full origin-center rounded-full bg-current transition-[translate,rotate,scale] duration-500 ease-out motion-reduce:transition-none group-aria-expanded:-translate-y-2 group-aria-expanded:-rotate-45"
      ></span>
    </span>
  `,
})
export class MenuToggle {
  private readonly host = inject(ElementRef<HTMLButtonElement>);

  readonly menu = input.required<MobileMenu>();
  readonly panelId = input('site-menu');
  readonly openLabel = input.required<string>();
  readonly closeLabel = input.required<string>();

  protected get menuRef(): MobileMenu {
    return this.menu();
  }

  constructor() {
    effect(() => {
      this.menu().registerToggle(this.host.nativeElement, this.panelId());
    });
  }
}
