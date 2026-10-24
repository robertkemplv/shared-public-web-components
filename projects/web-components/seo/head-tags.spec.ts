import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { HeadTags } from './head-tags';

describe('HeadTags', () => {
  let head: HeadTags;
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HeadTags, { provide: DOCUMENT, useValue: document }],
    });
    head = TestBed.inject(HeadTags);
    doc = TestBed.inject(DOCUMENT);
    doc.head
      .querySelectorAll('meta, link[rel="canonical"], link[rel="alternate"], script')
      .forEach((el) => {
        if (
          el.id === 'test-json-ld' ||
          el.getAttribute('name') ||
          el.getAttribute('property') ||
          el.getAttribute('rel')
        ) {
          el.remove();
        }
      });
  });

  it('writes title, name, property, canonical and alternates', () => {
    head.setTitle('Hello');
    head.setName('description', 'Desc');
    head.setProperty('og:title', 'Hello');
    head.setCanonical('https://example.com/');
    head.setAlternates([
      { hreflang: 'en', href: 'https://example.com/' },
      { hreflang: 'x-default', href: 'https://example.com/' },
    ]);

    expect(doc.title).toBe('Hello');
    expect(doc.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Desc',
    );
    expect(doc.head.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
      'Hello',
    );
    expect(doc.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://example.com/',
    );
    expect(doc.head.querySelectorAll('link[rel="alternate"][hreflang]').length).toBe(2);
  });

  it('escapes < in JSON-LD', () => {
    head.setJsonLd('test-json-ld', { name: 'a<b>' });
    const script = doc.getElementById('test-json-ld');
    expect(script?.textContent).toContain('\\u003c');
    expect(script?.textContent).not.toContain('<b>');
  });

  it('sets document language and direction', () => {
    head.setDocumentLanguage('es', 'ltr');
    expect(doc.documentElement.lang).toBe('es');
    expect(doc.documentElement.dir).toBe('ltr');
  });

  it('replaces multi-value properties', () => {
    head.setProperties('og:locale:alternate', ['es_ES', 'fr_FR']);
    head.setProperties('og:locale:alternate', ['de_DE']);
    expect(doc.head.querySelectorAll('meta[property="og:locale:alternate"]').length).toBe(1);
    expect(
      doc.head.querySelector('meta[property="og:locale:alternate"]')?.getAttribute('content'),
    ).toBe('de_DE');
  });
});
