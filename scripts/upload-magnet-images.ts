#!/usr/bin/env node
import { resolve } from 'node:path';
import { config } from 'dotenv';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'node:fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const dir = '/tmp/magnets-individual';
  const files = readdirSync(dir).filter(f => f.endsWith('.webp') || f.endsWith('.jpg'));

  console.log(`Uploading ${files.length} magnet images...\n`);

  for (const file of files) {
    const name = file.replace(/\.(webp|jpg)$/, '');
    const buffer = readFileSync(`${dir}/${file}`);

    // Skip tiny files (404 responses)
    if (buffer.length < 500) {
      console.log(`  ⚠️  ${name} — trop petit (${buffer.length}B), skip`);
      continue;
    }

    const ext = file.split('.').pop();
    const path = `magnets-rond/${name}.${ext}`;
    const contentType = ext === 'webp' ? 'image/webp' : 'image/jpeg';

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, buffer, { contentType, upsert: true });

    if (error) {
      console.log(`  ❌ ${name}: ${error.message}`);
    } else {
      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      console.log(`  ✓ ${name} → ${data.publicUrl}`);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
