/**
 * After `next build` with `output: 'standalone'`, the standalone server
 * does NOT include static assets automatically. This script copies them in.
 *
 * Must be run after `next build` and before `electron-builder`.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const standalone = path.join(root, '.next', 'standalone');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`[copy] Skipping (not found): ${src}`);
    return;
  }
  fs.cpSync(src, dest, { recursive: true, force: true });
  console.log(`[copy] ${path.relative(root, src)} → ${path.relative(root, dest)}`);
}

// .next/static → .next/standalone/.next/static
copyDir(
  path.join(root, '.next', 'static'),
  path.join(standalone, '.next', 'static')
);

// public → .next/standalone/public
copyDir(
  path.join(root, 'public'),
  path.join(standalone, 'public')
);

console.log('[copy] Done — standalone is ready for packaging.');
