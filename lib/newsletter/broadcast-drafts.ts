import { createAdminClient } from '@/lib/supabase/admin';
import type { NewsletterRecipientSource } from './recipients';

const DRAFTS_KEY = 'newsletter_broadcast_drafts';

export type LocalBroadcastDraft = {
  id: string;
  subject: string;
  html: string;
  recipientSources: NewsletterRecipientSource[];
  updatedAt: string;
};

function isDraft(value: unknown): value is LocalBroadcastDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Partial<LocalBroadcastDraft>;
  return typeof draft.id === 'string' && typeof draft.subject === 'string' && typeof draft.html === 'string';
}

function normalizeSources(value: unknown): NewsletterRecipientSource[] {
  if (!Array.isArray(value)) return ['newsletter'];
  const sources = value.filter((source): source is NewsletterRecipientSource =>
    ['newsletter', 'contacts', 'contest'].includes(String(source))
  );
  return sources.length > 0 ? sources : ['newsletter'];
}

export async function getLocalBroadcastDrafts(): Promise<Record<string, LocalBroadcastDraft>> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('shop_settings')
    .select('value')
    .eq('key', DRAFTS_KEY)
    .maybeSingle();

  let raw = data?.value;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      return {};
    }
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};

  const drafts: Record<string, LocalBroadcastDraft> = {};
  for (const [id, value] of Object.entries(raw)) {
    if (!isDraft(value)) continue;
    drafts[id] = {
      id,
      subject: value.subject,
      html: value.html,
      recipientSources: normalizeSources(value.recipientSources),
      updatedAt: value.updatedAt || new Date().toISOString(),
    };
  }
  return drafts;
}

export async function getLocalBroadcastDraft(id: string) {
  const drafts = await getLocalBroadcastDrafts();
  return drafts[id] ?? null;
}

export async function saveLocalBroadcastDraft(draft: LocalBroadcastDraft) {
  const supabase = createAdminClient();
  const drafts = await getLocalBroadcastDrafts();
  drafts[draft.id] = {
    ...draft,
    recipientSources: normalizeSources(draft.recipientSources),
    updatedAt: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('shop_settings')
    .upsert({ key: DRAFTS_KEY, value: drafts }, { onConflict: 'key' });

  if (error) throw new Error(error.message);
}

export async function deleteLocalBroadcastDraft(id: string) {
  const supabase = createAdminClient();
  const drafts = await getLocalBroadcastDrafts();
  delete drafts[id];

  const { error } = await supabase
    .from('shop_settings')
    .upsert({ key: DRAFTS_KEY, value: drafts }, { onConflict: 'key' });

  if (error) throw new Error(error.message);
}
