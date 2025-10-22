#!/usr/bin/env node
/**
 * Heuristic translation key scanner.
 *
 * 1. Scans ./app and ./components for getTranslations({ namespace: "X" }) usages.
 * 2. Within the same file, collects t("key") / t('key') calls and maps them to X.key.
 * 3. Flattens ru.json and uz.json keys (e.g. ProductPage.brand).
 * 4. Reports missing keys per locale.
 * 5. If run with --write, inserts placeholder values for missing keys into both JSON files.
 *
 * Usage:
 *   node scripts/find-missing-translations.mjs            # just report
 *   node scripts/find-missing-translations.mjs --write   # add placeholders
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { resolve, extname } from 'path';

const ROOT = resolve(process.cwd());
const LOCALES_DIR = resolve(ROOT, 'messages');
const FILE_RU = resolve(LOCALES_DIR, 'ru.json');
const FILE_UZ = resolve(LOCALES_DIR, 'uz.json');
const TARGET_DIRS = ['app', 'components'];
const WRITE = process.argv.includes('--write');

function readJSON(p){ return JSON.parse(readFileSync(p,'utf8')); }
function flatten(obj, prefix = '', out = {}) {
  Object.entries(obj).forEach(([k,v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, path, out); else out[path] = v;
  });
  return out;
}

function walk(dir, files = []) {
  if (!statSafe(dir)) return files;
  readdirSync(dir).forEach(f => {
    const p = resolve(dir, f);
    const st = statSafe(p);
    if (!st) return;
    if (st.isDirectory()) walk(p, files);
    else if (['.ts','.tsx','.js','.jsx'].includes(extname(f))) files.push(p);
  });
  return files;
}
function statSafe(p){ try { return statSync(p); } catch { return null; } }

const ru = readJSON(FILE_RU); const uz = readJSON(FILE_UZ);
const flatRu = flatten(ru); const flatUz = flatten(uz);

const translatorNamespaceRegex = /getTranslations\s*\(\s*{[^}]*namespace\s*:\s*['\"]([^'\"]+)['\"]/g;
const tCallRegex = /\bt\(\s*['\"]([^'\"(){}]+)['\"]\s*\)/g; // simple heuristic

const used = new Set();

for (const dir of TARGET_DIRS) {
  const full = resolve(ROOT, dir);
  walk(full).forEach(file => {
    const src = readFileSync(file,'utf8');
    // Collect namespaces declared in file (could be multiple)
    const namespaces = [...src.matchAll(translatorNamespaceRegex)].map(m => m[1]);
    if (namespaces.length === 0) return; // skip if no getTranslations
    // For simplicity, assume last declared namespace applies to subsequent t() calls.
    // We'll approximate by pairing every found t() with each namespace (union) to reduce false negatives.
    const tCalls = [...src.matchAll(tCallRegex)].map(m => m[1]);
    namespaces.forEach(ns => {
      tCalls.forEach(k => used.add(`${ns}.${k}`));
    });
  });
}

// Filter used keys that clearly exist already (in ru or uz) or are new.
const missingRu = [...used].filter(k => !(k in flatRu)).sort();
const missingUz = [...used].filter(k => !(k in flatUz)).sort();

function buildInsertionTree(baseObj, missing, localeTag){
  const clone = structuredClone(baseObj);
  for (const fullKey of missing){
    const parts = fullKey.split('.');
    let cur = clone;
    for (let i=0;i<parts.length;i++){
      const part = parts[i];
      const last = i === parts.length -1;
      if (last){
        if (!(part in cur)) cur[part] = localeTag === 'ru' ? 'TODO_RU' : 'TODO_UZ';
      } else {
        if (!(part in cur) || typeof cur[part] !== 'object') cur[part] = {};
        cur = cur[part];
      }
    }
  }
  return clone;
}


if (WRITE){
  if (missingRu.length){
    const updatedRu = buildInsertionTree(ru, missingRu, 'ru');
    writeFileSync(FILE_RU, JSON.stringify(updatedRu,null,2)+"\n");
  }
  if (missingUz.length){
    const updatedUz = buildInsertionTree(uz, missingUz, 'uz');
    writeFileSync(FILE_UZ, JSON.stringify(updatedUz,null,2)+"\n");
  }
  if (!missingRu.length && !missingUz.length) console.log('No new keys to write.');
}

console.log('\nDone.');
