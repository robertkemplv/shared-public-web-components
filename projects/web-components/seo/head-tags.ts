import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

export interface AlternateLink {
  hreflang: string;
  href: string;
}

/**
 * Low-level document head writer. Each site's SeoService decides *what* to write
 * and calls these helpers. No site policy, copy, or structured-data builders here.
 */
@Injectable({ providedIn: 'root' })
export class HeadTags {
  private readonly document = inject(DOCUMENT);

  setTitle(title: string): void {
    this.document.title = title;
  }

  setName(name: string, content: string): void {
    this.upsertMeta(`meta[name="${cssEscape(name)}"]`, { name, content });
  }

  setProperty(property: string, content: string): void {
    this.upsertMeta(`meta[property="${cssEscape(property)}"]`, { property, content });
  }

  /** Replaces all metas with the given property (e.g. multiple `og:locale:alternate`). */
  setProperties(property: string, values: readonly string[]): void {
    this.remove(`meta[property="${cssEscape(property)}"]`);
    for (const content of values) {
      const meta = this.document.createElement('meta');
      meta.setAttribute('property', property);
      meta.setAttribute('content', content);
      this.document.head.appendChild(meta);
    }
  }

  remove(selector: string): void {
    this.document.head.querySelectorAll(selector).forEach((el) => el.remove());
  }

  setCanonical(url: string | null): void {
    this.remove('link[rel="canonical"]');
    if (!url) return;
    this.addLink({ rel: 'canonical', href: url });
  }

  setAlternates(list: readonly AlternateLink[]): void {
    this.remove('link[rel="alternate"][hreflang]');
    for (const item of list) {
      this.addLink({ rel: 'alternate', hreflang: item.hreflang, href: item.href });
    }
  }

  /** Writes (or removes) a JSON-LD script. Escapes `<` in the serialized payload. */
  setJsonLd(id: string, data: object | null): void {
    this.document.getElementById(id)?.remove();
    if (!data) return;
    const script = this.document.createElement('script');
    script.id = id;
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
    this.document.head.appendChild(script);
  }

  setDocumentLanguage(lang: string, dir?: 'ltr' | 'rtl'): void {
    this.document.documentElement.lang = lang;
    if (dir) {
      this.document.documentElement.dir = dir;
    }
  }

  private upsertMeta(selector: string, attrs: Record<string, string>): void {
    let meta = this.document.head.querySelector(selector) as HTMLMetaElement | null;
    if (!meta) {
      meta = this.document.createElement('meta');
      this.document.head.appendChild(meta);
    }
    for (const [k, v] of Object.entries(attrs)) {
      meta.setAttribute(k, v);
    }
  }

  private addLink(attrs: Record<string, string>): void {
    const link = this.document.createElement('link');
    for (const [k, v] of Object.entries(attrs)) link.setAttribute(k, v);
    this.document.head.appendChild(link);
  }
}

function cssEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
