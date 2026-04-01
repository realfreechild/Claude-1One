/**
 * After `next build` with `output: 'standalone'`, the standalone server
 * does NOT include static assets automatically. This script copies them in.
 *
 * It also copies the Electron-rebuilt better-sqlite3 native module into
 * the standalone node_modules so the packaged app uses the right ABI.
 *
 * Must be run after `next build` + `electron-rebuild` and before `electron-builder`.
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

// Copy Electron-rebuilt better-sqlite3 native module into standalone
// This overwrites the system-Node.js version that `next build` copied,
// replacing it with the Electron-compatible .node binary.
const nativeModuleSrc = path.join(root, 'node_modules', 'better-sqlite3');
const nativeModuleDest = path.join(standalone, 'node_modules', 'better-sqlite3');
if (fs.existsSync(nativeModuleSrc) && fs.existsSync(nativeModuleDest)) {
  copyDir(nativeModuleSrc, nativeModuleDest);
  console.log('[copy] Overwrote standalone better-sqlite3 with Electron-rebuilt version');
}

console.log('[copy] Done — standalone is ready for packaging.');
