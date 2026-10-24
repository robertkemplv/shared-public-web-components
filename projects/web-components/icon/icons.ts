import { InjectionToken, makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';
import { DEFAULT_ICON_GLYPHS } from './default-glyphs';

export interface IconGlyph {
  viewBox: string;
  d: string;
  fillRule?: 'nonzero' | 'evenodd';
}

/**
 * Augment this interface in a site to type-check `ui-icon` names against that site's glyphs:
 *
 * ```ts
 * declare module '@lumvir/web-components/icon' {
 *   interface IconNameRegistry {
 *     apple: true;
 *   }
 * }
 * ```
 */
export interface IconNameRegistry {
  'chevron-down': true;
  close: true;
  globe: true;
  sun: true;
  moon: true;
  system: true;
}

export type IconName = keyof IconNameRegistry;

export const ICON_GLYPHS = new InjectionToken<Readonly<Record<string, IconGlyph>>>('ICON_GLYPHS', {
  providedIn: 'root',
  factory: () => DEFAULT_ICON_GLYPHS,
});

/** Registers site glyphs (merged over library defaults). Call from `appConfig` providers. */
export function provideIcons(glyphs: Readonly<Record<string, IconGlyph>>): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ICON_GLYPHS,
      useFactory: () => ({ ...DEFAULT_ICON_GLYPHS, ...glyphs }),
    },
  ]);
}
