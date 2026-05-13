import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { embed } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end).trim());
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks.filter(Boolean);
}

export async function POST(req: Request) {
  const { title, content } = await req.json();
  if (!title || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const supabase = createAdminClient();

  // Insert with status pending first
  const { data: inserted } = await supabase
    .from('chatbot_knowledge' as never)
    .insert({ title, content, status: 'pending' } as never)
    .select('id')
    .single();

  const id = (inserted as { id: string } | null)?.id;
  if (!id) return NextResponse.json({ error: 'Insert failed' }, { status: 500 });

  // Embed chunks if OpenAI key available
  if (process.env.OPENAI_API_KEY) {
    try {
      const oai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const rawChunks = chunkText(content);
      const chunks: { text: string; embedding: number[] }[] = [];

      for (const text of rawChunks) {
        const { embedding } = await embed({
          model: oai.embedding('text-embedding-3-small'),
          value: text,
        });
        chunks.push({ text, embedding });
      }

      await supabase
        .from('chatbot_knowledge' as never)
        .update({ chunks, status: 'ready' } as never)
        .eq('id', id);
    } catch (e) {
      console.error('[Knowledge embed]', e);
    }
  }

  return NextResponse.json({ ok: true, id });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = createAdminClient();
  await supabase.from('chatbot_knowledge' as never).delete().eq('id', id);

  return NextResponse.json({ ok: true });
}
