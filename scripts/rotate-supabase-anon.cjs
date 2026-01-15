#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function usage() {
  console.log('Usage: node scripts/rotate-supabase-anon.cjs <NEW_KEY> [--gh owner/repo]');
  process.exit(2);
}

const argv = process.argv.slice(2);
if (!argv[0]) usage();
const newKey = argv[0];
const ghIndex = argv.indexOf('--gh');
const ghRepo = ghIndex !== -1 ? argv[ghIndex + 1] : null;

const repoRoot = path.resolve(__dirname, '..');
const envFiles = ['.env', '.env.local', '.env.production', '.env.example'];

function replaceOrAppend(file, key, value) {
  const p = path.join(repoRoot, file);
  let content = '';
  if (fs.existsSync(p)) content = fs.readFileSync(p, 'utf8');
  const re = new RegExp(`^${key}=.*$`, 'm');
  const line = `${key}=${value}`;
  if (re.test(content)) {
    content = content.replace(re, line);
  } else {
    if (content && !content.endsWith('\n')) content += '\n';
    content += line + '\n';
  }
  fs.writeFileSync(p, content, 'utf8');
  console.log('[rotate] updated', file);
}

try {
  envFiles.forEach((f) => replaceOrAppend(f, 'VITE_SUPABASE_ANON_KEY', newKey));

  if (ghRepo) {
    try {
      console.log('[rotate] updating GitHub Actions secret VITE_SUPABASE_ANON_KEY for', ghRepo);
      execSync(`gh secret set VITE_SUPABASE_ANON_KEY --body "${newKey}" --repo ${ghRepo}`, { stdio: 'inherit' });
    } catch (e) {
      console.warn('[rotate] failed to set GitHub secret (ensure gh CLI is installed and authenticated):', e.message);
    }
  }

  console.log('[rotate] Done. Rebuild your frontend and redeploy. Example:');
  console.log('  VITE_BASE_PATH=/ai-interactive-model/ VITE_USE_SUPABASE_MOCK=seed VITE_SUPABASE_ANON_KEY="' + newKey + '" npm run build');
  process.exit(0);
} catch (err) {
  console.error('[rotate] error:', err && err.message);
  process.exit(1);
}
