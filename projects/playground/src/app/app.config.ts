import { provideZonelessChangeDetection, type ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { defineLocales } from '@lumvir/web-components/locale';
import { provideLanguage } from '@lumvir/web-components/language';
import { provideTheme } from '@lumvir/web-components/theme';
import { App } from './app';

const locales = defineLocales({
  defaultCode: 'en',
  locales: [
    { code: 'en', nativeLabel: 'English', hreflang: 'en', dir: 'ltr' },
    { code: 'es', nativeLabel: 'Español', hreflang: 'es', dir: 'ltr' },
  ],
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter([{ path: '**', component: App }]),
    provideTheme({
      storageKey: 'playground-theme',
      themeColor: { light: '#f7f4ef', dark: '#14121a' },
    }),
    provideLanguage({ locales, storageKey: 'playground-lang' }),
  ],
};
