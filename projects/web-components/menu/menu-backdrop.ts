import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MobileMenu } from './mobile-menu';

/**
 * Pointer-only dismiss layer. Site sets the dim colour via `styleClass`
 * (library ships no brand colours).
 */
@Component({
  selector: 'ui-menu-backdrop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'contents',
  },
  template: `
    <button
      type="button"
      tabindex="-1"
      aria-hidden="true"
      data-menu-backdrop
      [class]="
        'fixed inset-0 cursor-default transition-[opacity,visibility] duration-300 ease-out motion-reduce:transition-none ' +
        styleClass()
      "
      [class.invisible]="!menu().open()"
      [class.opacity-0]="!menu().open()"
      (click)="menu().closeAndRestoreFocus()"
    ></button>
  `,
})
export class MenuBackdrop {
  readonly menu = input.required<MobileMenu>();
  /** Dim / blur classes — e.g. `bg-ink/45` or site-specific. */
  readonly styleClass = input('');
}
