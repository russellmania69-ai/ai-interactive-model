#!/usr/bin/env node
const required = [
  'PROXY_JWT_SECRET',
  'ANTHROPIC_API_KEY'
];
const optional = [
  'SENTRY_DSN',
  'REDIS_URL'
];

const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('Missing required environment variables:', missing.join(', '));
  console.error('Set them in your runtime or CI secrets before deploying.');
  process.exit(1);
}

const presentOptional = optional.filter((k) => !!process.env[k]);
if (presentOptional.length) {
  console.log('Optional vars present:', presentOptional.join(', '));
}

console.log('Environment check passed. All required variables present.');
