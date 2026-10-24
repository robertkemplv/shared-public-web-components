import { Directive, computed, inject, input } from '@angular/core';
import { ThemeService, type ThemeMode } from './theme';

export interface ThemeToggleLabels {
  toDark: string;
  toSystem: string;
  toLight: string;
}

const NEXT_MODE: Record<ThemeMode, keyof ThemeToggleLabels> = {
  light: 'toDark',
  dark: 'toSystem',
  system: 'toLight',
};

/**
 * Put on a `button` that cycles theme. Sets `aria-label` to the next action and
 * exposes `nextLabel()` for visible text (menu row).
 */
@Directive({
  selector: 'button[uiThemeToggle]',
  exportAs: 'uiThemeToggle',
  host: {
    type: 'button',
    '(click)': 'theme.toggle()',
    '[attr.aria-label]': 'nextLabel()',
  },
})
export class ThemeToggle {
  readonly theme = inject(ThemeService);
  readonly labels = input.required<ThemeToggleLabels>();

  readonly nextLabel = computed(() => {
    const key = NEXT_MODE[this.theme.theme()];
    return this.labels()[key];
  });
}
