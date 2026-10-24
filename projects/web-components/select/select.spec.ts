import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Select } from './select';

@Component({
  selector: 'ui-host',
  imports: [Select],
  template: `
    <ui-select
      [options]="options"
      [showClear]="true"
      clearLabel="Clear"
      [(value)]="value"
      (cleared)="cleared = true"
    />
  `,
})
class Host {
  options = [
    { label: 'One', value: '1' },
    { label: 'Two', value: '2' },
  ];
  value: string | null = '1';
  cleared = false;
}

describe('Select', () => {
  it('meets the 44 px / 16 px a11y minimums', async () => {
    TestBed.configureTestingModule({ imports: [Host] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const select = root.querySelector('select');
    const wrap = root.querySelector('[class*="rounded-md"]');
    expect(select?.className).toContain('min-h-11');
    expect(wrap?.className).toContain('text-[16px]');
  });

  it('uses token focus classes, not brand palette utilities', async () => {
    TestBed.configureTestingModule({ imports: [Host] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const wrap = (fixture.nativeElement as HTMLElement).querySelector('[class*="focus-within"]');
    expect(wrap?.className).toContain('focus-within:border-focus');
    expect(wrap?.className).not.toMatch(/amber-|purple-|brand-/);
  });

  it('clears the value when showClear is used', async () => {
    TestBed.configureTestingModule({ imports: [Host] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const clear = (fixture.nativeElement as HTMLElement).querySelector(
      'button[aria-label="Clear"]',
    ) as HTMLButtonElement;
    clear.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBeNull();
    expect(fixture.componentInstance.cleared).toBe(true);
  });
});
