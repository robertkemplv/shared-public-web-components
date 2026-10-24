import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Icon } from '@lumvir/web-components/icon';
import { ThemeService } from './theme';

/** Sun / moon / system glyph for the current theme mode. */
@Component({
  selector: 'ui-theme-icon',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (theme.theme()) {
      @case ('dark') {
        <ui-icon name="moon" />
      }
      @case ('system') {
        <ui-icon name="system" />
      }
      @default {
        <ui-icon name="sun" />
      }
    }
  `,
})
export class ThemeIcon {
  protected readonly theme = inject(ThemeService);
}
