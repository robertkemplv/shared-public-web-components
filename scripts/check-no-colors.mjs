#!/usr/bin/env node
/**
 * Fails if library source (outside tests) hard-codes colours or Tailwind palette utilities.
 * Sites own brand colour via the CSS token contract.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('../projects/web-components/', import.meta.url);
const rootPath = ROOT.pathname;

const HEX_RGB =
  /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|\b(?:rgb|rgba|hsl|hsla)\s*\(/;
const PALETTE =
  /\b(?:amber|purple|violet|indigo|fuchsia|pink|rose|orange|yellow|lime|green|emerald|teal|cyan|sky|blue|red|stone|zinc|neutral|gray|grey|slate|brand|sand|charcoal)-[0-9]{2,3}\b/;

const IGNORE_NAME = /\.spec\.ts$/;

/** @param {string} dir */
function walk(dir) {
  /** @type {string[]} */
  const files = [];
  for (const name of readdirSync(dir)) {
    if (name === 'default-glyphs.ts') continue; // path data only
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) files.push(...walk(full));
    else if (/\.(ts|html|css)$/.test(name) && !IGNORE_NAME.test(name)) files.push(full);
  }
  return files;
}

const offenders = [];
for (const file of walk(rootPath)) {
  const text = readFileSync(file, 'utf8');
  const rel = relative(process.cwd(), file);
  if (HEX_RGB.test(text)) offenders.push(`${rel}: hex/rgb/hsl colour`);
  if (PALETTE.test(text)) offenders.push(`${rel}: Tailwind palette utility`);
}

if (offenders.length) {
  console.error('check-no-colors failed:\n' + offenders.map((o) => `  - ${o}`).join('\n'));
  process.exit(1);
}

console.log('check-no-colors: ok');
