#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function log(...args) { console.log('[prepare-serve]', ...args); }

const argv = process.argv.slice(2);
const serveRoot = argv[0] || '/tmp/ai-interactive-model-serve';

const workspaceRoot = path.resolve(__dirname, '..');
const publicSeed = path.join(workspaceRoot, 'public', 'seed-data.json');

if (!fs.existsSync(publicSeed)) {
  console.error('[prepare-serve] public/seed-data.json not found in repo; nothing to copy.');
  process.exit(2);
}

try {
  if (!fs.existsSync(serveRoot)) {
    fs.mkdirSync(serveRoot, { recursive: true });
    log('created serve root:', serveRoot);
  }

  // copy to serveRoot/seed-data.json
  const destRootSeed = path.join(serveRoot, 'seed-data.json');
  fs.copyFileSync(publicSeed, destRootSeed);
  log('copied seed-data.json ->', destRootSeed);

  // also copy into serveRoot/ai-interactive-model/ if that folder exists
  const appSubdir = path.join(serveRoot, 'ai-interactive-model');
  if (fs.existsSync(appSubdir)) {
    const destSubSeed = path.join(appSubdir, 'seed-data.json');
    fs.copyFileSync(publicSeed, destSubSeed);
    log('copied seed-data.json ->', destSubSeed);
  } else {
    log('no ai-interactive-model subdir present at serve root; skipped subdir copy');
  }

  log('prepare-serve complete');
  process.exit(0);
} catch (err) {
  console.error('[prepare-serve] error:', err && err.message);
  process.exit(1);
}
