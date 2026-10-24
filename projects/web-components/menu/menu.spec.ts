import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuBackdrop } from './menu-backdrop';
import { MenuToggle, MobileMenu } from './mobile-menu';

@Component({
  selector: 'ui-host',
  imports: [MobileMenu, MenuToggle, MenuBackdrop],
  template: `
    <div uiMobileMenu #menu="uiMobileMenu" desktopQuery="(min-width: 64rem)">
      <ui-menu-backdrop [menu]="menu" styleClass="bg-ink/45" />
      <button
        uiMenuToggle
        [menu]="menu"
        panelId="site-menu"
        openLabel="Open menu"
        closeLabel="Close menu"
      ></button>
      <div id="site-menu" [hidden]="!menu.open()">Panel</div>
    </div>
  `,
})
class Host {}

describe('MobileMenu', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideRouter([])],
    });
  });

  it('toggles aria-expanded, locks scroll, and restores focus on backdrop close', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const toggle = host.querySelector('button[uiMenuToggle]') as HTMLButtonElement;
    const backdrop = host.querySelector('[data-menu-backdrop]') as HTMLButtonElement;
    const panel = host.querySelector('#site-menu') as HTMLElement;

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(panel.hidden).toBe(true);

    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hidden).toBe(false);
    expect(document.documentElement.style.overflow).toBe('hidden');

    backdrop.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle);
  });

  it('closes on Escape and returns focus to the toggle', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const toggle = host.querySelector('button[uiMenuToggle]') as HTMLButtonElement;

    toggle.click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle);
  });
});
