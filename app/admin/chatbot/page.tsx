import { createAdminClient } from '@/lib/supabase/admin';
import { ChatbotConfigForm } from './ChatbotConfigForm';
import { KnowledgeList } from './KnowledgeList';
import { ConversationsList } from './ConversationsList';

async function getData() {
  const supabase = createAdminClient();

  const [{ data: config }, { data: knowledge }, { data: conversations }] = await Promise.all([
    supabase.from('chatbot_config' as never).select('*').limit(1).single(),
    supabase.from('chatbot_knowledge' as never).select('id, title, status, created_at').order('created_at', { ascending: false }),
    supabase.from('chat_conversations' as never).select('id, first_message, message_count, status, created_at').order('created_at', { ascending: false }).limit(50),
  ]);

  return {
    config: config as Record<string, unknown> | null,
    knowledge: (knowledge ?? []) as { id: string; title: string; status: string; created_at: string }[],
    conversations: (conversations ?? []) as { id: string; first_message: string; message_count: number; status: string; created_at: string }[],
  };
}

export default async function ChatbotAdminPage() {
  const { config, knowledge, conversations } = await getData();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-ink">Chatbot</h1>
        <p className="text-sm text-gray-500 mt-1">Configurez l&apos;assistant virtuel Island Dreams</p>
      </div>

      <ChatbotConfigForm initialConfig={config} />
      <KnowledgeList items={knowledge} />
      <ConversationsList items={conversations} />
    </div>
  );
}
