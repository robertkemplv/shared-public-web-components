import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LanguageSelect, LanguageService } from '@lumvir/web-components/language';
import { MenuBackdrop, MenuToggle, MobileMenu } from '@lumvir/web-components/menu';
import { Select } from '@lumvir/web-components/select';
import { ThemeIcon, ThemeService, ThemeToggle } from '@lumvir/web-components/theme';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LanguageSelect, Select, ThemeToggle, ThemeIcon, MobileMenu, MenuToggle, MenuBackdrop],
  template: `
    <div
      class="min-h-dvh bg-canvas text-ink"
      uiMobileMenu
      #menu="uiMobileMenu"
      desktopQuery="(min-width: 48rem)"
    >
      <ui-menu-backdrop [menu]="menu" styleClass="bg-ink/40 md:hidden" />
      <header class="sticky top-0 z-50 border-b border-line bg-canvas/90 backdrop-blur-md">
        <div class="mx-auto flex min-h-16 max-w-3xl items-center justify-between gap-3 px-4">
          <strong class="font-display text-lg tracking-tight">@lumvir/web-components</strong>
          <div class="flex items-center gap-2">
            <ui-language-select label="Language" />
            <button
              uiThemeToggle
              class="hidden size-11 items-center justify-center rounded-sm border border-line bg-surface text-ink sm:inline-flex"
              [labels]="{ toDark: 'Dark', toSystem: 'System', toLight: 'Light' }"
            >
              <ui-theme-icon class="text-[22px]" />
            </button>
            <button
              uiMenuToggle
              class="md:hidden"
              [menu]="menu"
              openLabel="Open menu"
              closeLabel="Close menu"
            ></button>
          </div>
        </div>
        <div
          id="site-menu"
          class="border-t border-line bg-canvas md:hidden"
          [hidden]="!menu.open()"
        >
          <div class="mx-auto max-w-3xl px-4 py-3">
            <p class="text-ink-muted">Mobile panel (headless menu demo)</p>
            <button
              uiThemeToggle
              class="mt-2 flex w-full min-h-11 items-center justify-between border-b border-line text-left"
              [labels]="{
                toDark: 'Use dark theme',
                toSystem: 'Use system theme',
                toLight: 'Use light theme',
              }"
            >
              <span>{{ theme.theme() }}</span>
              <ui-theme-icon class="text-[22px] text-ink-muted" />
            </button>
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-3xl space-y-8 px-4 py-10">
        <section class="space-y-3">
          <h1 class="font-display text-3xl tracking-tight">Playground</h1>
          <p class="text-ink-muted">
            Token contract demo. Lang: <code>{{ language.language() }}</code
            >, theme: <code>{{ theme.theme() }}</code> → <code>{{ theme.resolved() }}</code>
          </p>
        </section>
        <section class="space-y-3">
          <h2 class="text-xl font-semibold">Select</h2>
          <ui-select
            [options]="platforms"
            placeholder="Choose a platform"
            [showClear]="true"
            clearLabel="Clear"
            [fluid]="true"
          />
        </section>
      </main>
    </div>
  `,
})
export class App {
  protected readonly theme = inject(ThemeService);
  protected readonly language = inject(LanguageService);
  protected readonly platforms = [
    { label: 'iOS', value: 'ios' },
    { label: 'Android', value: 'android' },
    { label: 'Windows', value: 'windows' },
  ];
}
