import { streamText, embed } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAdminClient } from '@/lib/supabase/admin';
import { cosineSimilarity } from '@/lib/chatbot/rag';

const TOP_K = 6;
const SIMILARITY_THRESHOLD = 0.3;

function extractText(msg: Record<string, unknown>): string {
  if (typeof msg.content === 'string') return msg.content;
  if (Array.isArray(msg.parts)) {
    return (msg.parts as Array<{ type: string; text?: string }>)
      .filter((p) => p.type === 'text')
      .map((p) => p.text ?? '')
      .join('');
  }
  return '';
}

export async function POST(req: Request) {
  const { messages: rawMessages, conversationId } = await req.json();

  const messages = (rawMessages as Record<string, unknown>[]).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: extractText(m),
  }));

  const supabase = createAdminClient();

  // Charger config
  const { data: configData } = await supabase
    .from('chatbot_config' as never)
    .select('*')
    .limit(1)
    .single();

  const config = configData as {
    is_enabled: boolean;
    system_prompt: string;
    model: string;
    temperature: number;
  } | null;

  if (!config?.is_enabled) {
    return new Response('Chatbot désactivé', { status: 503 });
  }

  const oai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // RAG — embed la question et chercher dans la base de connaissance
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  let contextChunks: string[] = [];

  if (lastUser?.content && process.env.OPENAI_API_KEY) {
    try {
      const { embedding: queryEmbedding } = await embed({
        model: oai.embedding('text-embedding-3-small'),
        value: lastUser.content,
      });

      const { data: docs } = await supabase
        .from('chatbot_knowledge' as never)
        .select('chunks')
        .eq('status', 'ready');

      const scored: { text: string; score: number }[] = [];

      for (const doc of (docs ?? []) as { chunks: { text: string; embedding: number[] }[] }[]) {
        for (const chunk of doc.chunks ?? []) {
          if (!chunk.embedding || !chunk.text) continue;
          const score = cosineSimilarity(queryEmbedding, chunk.embedding);
          scored.push({ text: chunk.text, score });
        }
      }

      contextChunks = scored
        .sort((a, b) => b.score - a.score)
        .filter((c) => c.score >= SIMILARITY_THRESHOLD)
        .slice(0, TOP_K)
        .map((c) => c.text);
    } catch (e) {
      console.error('[Chat RAG]', e);
    }
  }

  // System prompt enrichi
  let systemPrompt = config.system_prompt;
  if (contextChunks.length > 0) {
    systemPrompt += `\n\n---\nContexte de la base de connaissance :\n${contextChunks.map((c, i) => `[${i + 1}] ${c}`).join('\n\n')}\n---\nBas ta réponse sur ces extraits. N'invente pas d'informations non présentes dans ce contexte.`;
  }

  // Créer ou récupérer conversation
  let activeConversationId = conversationId as string | undefined;
  if (!activeConversationId) {
    const { data: conv } = await supabase
      .from('chat_conversations' as never)
      .insert({
        first_message: (lastUser?.content ?? '').slice(0, 500),
        status: 'active',
      } as never)
      .select('id')
      .single();
    activeConversationId = (conv as { id: string } | null)?.id;
  }

  // Streamer
  const result = streamText({
    model: oai(config.model || 'gpt-4o-mini'),
    system: systemPrompt,
    messages,
    temperature: config.temperature ?? 0.7,
    maxOutputTokens: 1024,
  });

  // Sauvegarder en background
  if (activeConversationId) {
    const convId = activeConversationId;
    result.text.then(async (assistantText) => {
      try {
        const { data: existing } = await supabase
          .from('chat_conversations' as never)
          .select('messages, message_count')
          .eq('id', convId)
          .single();

        const prev = (existing as { messages: unknown[]; message_count: number } | null);
        const existingMsgs = Array.isArray(prev?.messages) ? prev.messages : [];
        const now = new Date().toISOString();
        const updated = [
          ...existingMsgs,
          { role: 'user', content: lastUser?.content ?? '', timestamp: now },
          { role: 'assistant', content: assistantText, timestamp: new Date().toISOString() },
        ];

        await supabase
          .from('chat_conversations' as never)
          .update({ messages: updated, message_count: updated.length } as never)
          .eq('id', convId);
      } catch (e) {
        console.error('[Chat save]', e);
      }
    });
  }

  const response = result.toTextStreamResponse();
  if (activeConversationId) {
    response.headers.set('X-Conversation-Id', activeConversationId);
  }
  return response;
}
