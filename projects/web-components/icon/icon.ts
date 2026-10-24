import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ICON_GLYPHS, type IconName } from './icons';

/**
 * Inline SVG icon. Size via font-size, colour via currentColor. Decorative by default.
 * Glyphs come from `provideIcons` (plus library defaults).
 */
@Component({
  selector: 'ui-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex size-[1em] shrink-0 items-center justify-center leading-none',
    '[attr.aria-hidden]': 'decorative() ? "true" : null',
    '[attr.role]': 'decorative() ? null : "img"',
    '[attr.aria-label]': 'decorative() ? null : label()',
  },
  template: `
    @if (glyph(); as g) {
      <svg
        class="block size-full"
        [attr.viewBox]="g.viewBox"
        fill="currentColor"
        [attr.fill-rule]="g.fillRule ?? null"
        aria-hidden="true"
        focusable="false"
      >
        <path [attr.d]="g.d" />
      </svg>
    }
  `,
})
export class Icon {
  private readonly glyphs = inject(ICON_GLYPHS);

  readonly name = input.required<IconName | string>();
  readonly decorative = input(true);
  readonly label = input<string | undefined>(undefined);

  protected readonly glyph = computed(() => this.glyphs[this.name()] ?? null);
}
