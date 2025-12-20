#!/usr/bin/env node
// Simple seed generator for the Supabase mock. Writes `scripts/seed-data.json`.
const fs = require('fs');
const path = require('path');

const seed = {
  user_profiles: [
    { id: 'user_1', email: 'alice@example.com', full_name: 'Alice Example', role: 'user', avatar_url: '', created_at: new Date().toISOString() },
    { id: 'user_2', email: 'bob@example.com', full_name: 'Bob Admin', role: 'admin', avatar_url: '', created_at: new Date().toISOString() }
  ],
  subscriptions: [
    { id: 'sub_1', user_email: 'alice@example.com', model_name: 'Luna', subscription_price: '9.99', payment_status: 'completed', subscription_start_date: new Date().toISOString(), subscription_end_date: new Date(Date.now() + 2592e6).toISOString() }
  ],
  chat_sessions: [
    { id: 'chat_1', user_email: 'alice@example.com', model_name: 'Luna', created_at: new Date().toISOString() }
  ],
  saved_images: [
    { id: 'img_1', user_email: 'alice@example.com', image_url: '/public/sample1.jpg', prompt: 'A beautiful portrait', created_at: new Date().toISOString() }
  ],
  email_logs: []
};

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
const outJson = path.join(publicDir, 'seed-data.json');
const outJs = path.join(publicDir, 'seed-data.js');
fs.writeFileSync(outJson, JSON.stringify(seed, null, 2), 'utf8');
fs.writeFileSync(outJs, `window.__SEED_DATA = ${JSON.stringify(seed, null, 2)};`, 'utf8');
console.log('Wrote seed data to', outJson);
console.log('Wrote seed loader to', outJs);
console.log('\nTo use this data, start the dev server and visit the app (the mock will read window.__SEED_DATA).');

process.exit(0);
