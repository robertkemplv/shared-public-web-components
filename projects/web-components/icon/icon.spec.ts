import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Icon } from './icon';
import { provideIcons } from './icons';

@Component({
  selector: 'ui-host',
  imports: [Icon],
  template: `<ui-icon [name]="name" [decorative]="decorative" [label]="label" />`,
})
class Host {
  name = 'globe';
  decorative = true;
  label: string | undefined;
}

describe('Icon', () => {
  it('renders a registered glyph as decorative by default', async () => {
    TestBed.configureTestingModule({ imports: [Host] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const icon = host.querySelector('ui-icon');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(host.querySelector('path')).not.toBeNull();
  });

  it('exposes a label when not decorative', async () => {
    TestBed.configureTestingModule({ imports: [Host] });
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.decorative = false;
    fixture.componentInstance.label = 'Language';
    fixture.detectChanges();
    const icon = (fixture.nativeElement as HTMLElement).querySelector('ui-icon');
    expect(icon?.getAttribute('aria-hidden')).toBeNull();
    expect(icon?.getAttribute('role')).toBe('img');
    expect(icon?.getAttribute('aria-label')).toBe('Language');
  });

  it('merges site glyphs over defaults', async () => {
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [
        provideIcons({
          spark: { viewBox: '0 0 10 10', d: 'M0 0h10v10H0z' },
        }),
      ],
    });
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.name = 'spark';
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('path')).not.toBeNull();
  });
});
