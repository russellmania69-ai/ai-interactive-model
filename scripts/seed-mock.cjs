#!/usr/bin/env node
// CommonJS copy of seed generator for projects that use "type": "module"
const fs = require('fs');
const path = require('path');

const now = new Date();
const in30days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

const seed = {
  user_profiles: [
    { id: 'user_1', email: 'alice@example.com', full_name: 'Alice Example', role: 'user', avatar_url: '/avatars/alice.png', created_at: now.toISOString() },
    { id: 'user_2', email: 'bob@example.com', full_name: 'Bob Admin', role: 'admin', avatar_url: '/avatars/bob.png', created_at: now.toISOString() },
    { id: 'user_3', email: 'carol@example.com', full_name: 'Carol Tester', role: 'user', avatar_url: '/avatars/carol.png', created_at: now.toISOString() },
    { id: 'user_4', email: 'dave@example.com', full_name: 'Dave Dev', role: 'developer', avatar_url: '/avatars/dave.png', created_at: now.toISOString() }
  ],
  subscriptions: [
    { id: 'sub_1', user_email: 'alice@example.com', model_name: 'Luna', subscription_price: '9.99', payment_status: 'completed', subscription_start_date: now.toISOString(), subscription_end_date: in30days.toISOString() },
    { id: 'sub_2', user_email: 'carol@example.com', model_name: 'Orion', subscription_price: '4.99', payment_status: 'trialing', subscription_start_date: now.toISOString(), subscription_end_date: in30days.toISOString() }
  ],
  chat_sessions: [
    { id: 'chat_1', user_email: 'alice@example.com', model_name: 'Luna', created_at: now.toISOString(), last_message: 'Hello, Luna!' },
    { id: 'chat_2', user_email: 'carol@example.com', model_name: 'Orion', created_at: now.toISOString(), last_message: 'Tell me about the cosmos.' }
  ],
  chat_messages: [
    { id: 'msg_1', session_id: 'chat_1', role: 'user', content: 'Hi!', created_at: now.toISOString() },
    { id: 'msg_2', session_id: 'chat_1', role: 'assistant', content: 'Hello! How can I help?', created_at: now.toISOString() }
  ],
  saved_images: [
    { id: 'img_1', user_email: 'alice@example.com', image_url: '/images/sample1.jpg', prompt: 'A beautiful portrait', created_at: now.toISOString() },
    { id: 'img_2', user_email: 'dave@example.com', image_url: '/images/sample2.jpg', prompt: 'A retro sci-fi poster', created_at: now.toISOString() }
  ],
  email_logs: [
    { id: 'email_1', to: 'alice@example.com', subject: 'Welcome', body: 'Welcome to the app', sent_at: now.toISOString() }
  ]
};

function writeFileSafe(targetPath, content) {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(targetPath, content, 'utf8');
}

const scriptOut = path.join(__dirname, 'seed-data.json');
const publicJsonOut = path.join(__dirname, '..', 'public', 'seed-data.json');
const publicJsOut = path.join(__dirname, '..', 'public', 'seed-data.js');

writeFileSafe(scriptOut, JSON.stringify(seed, null, 2));
writeFileSafe(publicJsonOut, JSON.stringify(seed, null, 2));
// Write a small JS file that sets window.__SEED_DATA for synchronous dev loading
writeFileSafe(publicJsOut, `window.__SEED_DATA = ${JSON.stringify(seed, null, 2)};`);

console.log('Wrote seed data to:', scriptOut);
console.log('Wrote public seed JSON to:', publicJsonOut);
console.log('Wrote public seed JS to:', publicJsOut);

console.log('\nRun `VITE_USE_SUPABASE_MOCK=seed npm run dev` and the mock will pick up the data.');
process.exit(0);
