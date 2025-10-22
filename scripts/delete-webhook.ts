#!/usr/bin/env node
/**
 * Script to delete Telegram bot webhook
 * Usage: npx tsx scripts/delete-webhook.ts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env
const envPath = resolve(process.cwd(), '.env');
const envContent = readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const BOT_TOKEN = envVars.BOT_TOKEN || process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN topilmadi. .env faylida BOT_TOKEN ni o\'rnating.');
  process.exit(1);
}

async function deleteWebhook() {
  try {
    console.log('🔄 Webhook o\'chirilmoqda...');

    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drop_pending_updates: true,
        }),
      }
    );

    const data = await response.json();

    if (data.ok) {
      console.log('✅ Webhook muvaffaqiyatli o\'chirildi!');
      console.log('📝 Bot endi polling rejimida ishlaydi.');
    } else {
      console.error('❌ Webhook o\'chirishda xatolik:', data.description);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  }
}

async function getWebhookInfo() {
  try {
    console.log('\n🔍 Webhook holati tekshirilmoqda...');
    
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    );

    const data = await response.json();

    if (data.ok) {
      console.log('📊 Webhook holati:');
      console.log('  URL:', data.result.url || '(o\'rnatilmagan)');
    }
  } catch (error) {
    console.error('❌ Ma\'lumot olishda xatolik:', error);
  }
}

async function main() {
  await deleteWebhook();
  await getWebhookInfo();
}

main();
