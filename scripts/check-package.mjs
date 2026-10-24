#!/usr/bin/env node
/**
 * Sanity-check the built package: version, secondary entry points, no accidental CSS.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/web-components/', import.meta.url).pathname;
const srcPkgPath = new URL('../projects/web-components/package.json', import.meta.url).pathname;
const pkgPath = join(dist, 'package.json');

if (!existsSync(pkgPath)) {
  console.error('check-package: dist/web-components/package.json missing — run build:lib first');
  process.exit(1);
}

const expectedVersion = JSON.parse(readFileSync(srcPkgPath, 'utf8')).version;
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
if (pkg.name !== '@lumvir/web-components') {
  console.error(`check-package: unexpected name ${pkg.name}`);
  process.exit(1);
}
if (pkg.version !== expectedVersion) {
  console.error(`check-package: expected version ${expectedVersion}, got ${pkg.version}`);
  process.exit(1);
}

const required = ['locale', 'theme', 'language', 'select', 'icon', 'menu', 'seo', 'captcha'];
for (const entry of required) {
  const entryPkg = join(dist, entry, 'package.json');
  if (!existsSync(entryPkg) && !existsSync(join(dist, `${entry}.d.ts`))) {
    // ng-packagr may flatten; check fesm or exports
    const exports = pkg.exports ?? {};
    if (!exports[`./${entry}`] && !existsSync(join(dist, entry))) {
      console.error(`check-package: missing secondary entry ./${entry}`);
      process.exit(1);
    }
  }
}

const css = readdirSync(dist, { recursive: true }).filter((f) => String(f).endsWith('.css'));
if (css.length) {
  console.error('check-package: package must not ship CSS files:', css);
  process.exit(1);
}

console.log('check-package: ok', pkg.name, pkg.version);
