import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { Select, type SelectOptionValue } from '@lumvir/web-components/select';
import { LanguageService } from './language';

/**
 * Compact header language control: labelled native select with a globe icon.
 * Endonym options; changing language navigates to the URL twin.
 */
@Component({
  selector: 'ui-language-select',
  imports: [Select],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="sr-only" [attr.for]="inputId()">{{ label() }}</label>
    <ui-select
      [inputId]="inputId()"
      size="sm"
      variant="filled"
      leftIcon="globe"
      [styleClass]="styleClass()"
      [value]="selected()"
      (valueChange)="setLanguage($event)"
    >
      @for (code of language.languages; track code) {
        <option [value]="code" [attr.selected]="code === language.language() ? '' : null">
          {{ endonym(code) }}
        </option>
      }
    </ui-select>
  `,
})
export class LanguageSelect {
  protected readonly language = inject(LanguageService);
  protected readonly selected = signal<SelectOptionValue>(this.language.language());

  /** Visually hidden label (required; sites pass translated copy). */
  readonly label = input.required<string>();
  readonly inputId = input('lang-select');
  readonly styleClass = input('max-w-[12rem]');

  constructor() {
    effect(() => this.selected.set(this.language.language()));
  }

  protected endonym(code: string): string {
    return this.language.locales.get(code)?.nativeLabel ?? code;
  }

  protected setLanguage(lang: SelectOptionValue): void {
    if (typeof lang === 'string' && this.language.locales.isLang(lang)) {
      this.selected.set(lang);
      void this.language.use(lang);
    }
  }
}
