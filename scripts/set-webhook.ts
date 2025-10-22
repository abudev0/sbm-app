#!/usr/bin/env node
/**
 * Script to set Telegram bot webhook
 * Usage: npx tsx scripts/set-webhook.ts
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
const WEBHOOK_URL = envVars.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN topilmadi. .env faylida BOT_TOKEN ni o\'rnating.');
  process.exit(1);
}

if (!WEBHOOK_URL) {
  console.error('❌ NEXT_PUBLIC_SITE_URL topilmadi. .env faylida NEXT_PUBLIC_SITE_URL ni o\'rnating.');
  process.exit(1);
}

const webhookEndpoint = `${WEBHOOK_URL.replace(/\/+$/, '')}/api/tg/webhook`;

async function setWebhook() {
  try {
    console.log('🔄 Webhook o\'rnatilmoqda...');
    console.log('📍 URL:', webhookEndpoint);

    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookEndpoint,
          allowed_updates: ['message', 'callback_query'],
          drop_pending_updates: true,
        }),
      }
    );

    const data = await response.json();

    if (data.ok) {
      console.log('✅ Webhook muvaffaqiyatli o\'rnatildi!');
      console.log('📝 Ma\'lumot:', data.description || data.result);
    } else {
      console.error('❌ Webhook o\'rnatishda xatolik:', data.description);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  }
}

async function getWebhookInfo() {
  try {
    console.log('\n🔍 Webhook ma\'lumotlari olinmoqda...');
    
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    );

    const data = await response.json();

    if (data.ok) {
      console.log('📊 Webhook holati:');
      console.log('  URL:', data.result.url || '(o\'rnatilmagan)');
      console.log('  Pending updates:', data.result.pending_update_count || 0);
      if (data.result.last_error_date) {
        console.log('  Oxirgi xatolik:', new Date(data.result.last_error_date * 1000).toLocaleString());
        console.log('  Xatolik matni:', data.result.last_error_message);
      }
    }
  } catch (error) {
    console.error('❌ Ma\'lumot olishda xatolik:', error);
  }
}

async function main() {
  await setWebhook();
  await getWebhookInfo();
}

main();
