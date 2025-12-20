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

const outPath = path.join(__dirname, 'seed-data.json');
fs.writeFileSync(outPath, JSON.stringify(seed, null, 2), 'utf8');
console.log('Wrote seed data to', outPath);
console.log('\nTo use this data you can inspect `scripts/seed-data.json` or copy values into the mock manually.');

process.exit(0);
