import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, 'dist');
const modules = path.join(root, 'node_modules');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of ['manifest.json', 'popup.html', 'popup.css', 'icon.svg']) await cp(path.join(root, file), path.join(out, file));
await build({ entryPoints: [path.join(root, 'popup.js')], bundle: true, outfile: path.join(out, 'popup.js'), format: 'iife', platform: 'browser', target: 'chrome120' });
const tess = path.join(modules, 'tesseract.js', 'dist');
const core = path.join(modules, 'tesseract.js-core');
const tessOut = path.join(out, 'tesseract');
await mkdir(tessOut, { recursive: true });
await cp(path.join(tess, 'worker.min.js'), path.join(tessOut, 'worker.min.js'));
for (const name of ['tesseract-core.wasm.js', 'tesseract-core-simd.wasm.js', 'tesseract-core-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js', 'tesseract-core.wasm', 'tesseract-core-simd.wasm', 'tesseract-core-lstm.wasm', 'tesseract-core-simd-lstm.wasm']) {
  try { await cp(path.join(core, name), path.join(tessOut, name)); } catch {}
}
console.log('Built unpacked extension in extension/dist');
