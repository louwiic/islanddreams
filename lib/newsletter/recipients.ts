import { createAdminClient } from '@/lib/supabase/admin';

export type NewsletterRecipientSource = 'newsletter' | 'contacts' | 'contest';

export type NewsletterRecipientGroup = {
  source: NewsletterRecipientSource;
  label: string;
  description: string;
  emails: string[];
};

const sourceLabels: Record<NewsletterRecipientSource, { label: string; description: string }> = {
  newsletter: {
    label: 'Abonnés newsletter',
    description: 'Emails inscrits volontairement à la newsletter.',
  },
  contacts: {
    label: 'Messages contact',
    description: 'Emails récupérés via le formulaire de contact.',
  },
  contest: {
    label: 'Jeu concours',
    description: 'Emails récupérés via la pop-up de participation au jeu.',
  },
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function uniqueEmails(values: { email: string | null }[] | null) {
  const seen = new Set<string>();
  for (const item of values ?? []) {
    const email = String(item.email || '').trim().toLowerCase();
    if (isValidEmail(email)) seen.add(email);
  }
  return [...seen].sort();
}

function normalizeSources(sources?: string[]): NewsletterRecipientSource[] {
  const clean = (sources ?? ['newsletter']).filter((source): source is NewsletterRecipientSource =>
    ['newsletter', 'contacts', 'contest'].includes(source)
  );
  return clean.length > 0 ? clean : ['newsletter'];
}

export async function getNewsletterRecipientGroups(
  requestedSources?: NewsletterRecipientSource[] | string[]
): Promise<NewsletterRecipientGroup[]> {
  const supabase = createAdminClient();
  const sources = normalizeSources(requestedSources);
  const groups: NewsletterRecipientGroup[] = [];

  if (sources.includes('newsletter')) {
    const { data } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .is('unsubscribed_at', null);

    groups.push({
      source: 'newsletter',
      ...sourceLabels.newsletter,
      emails: uniqueEmails(data),
    });
  }

  if (sources.includes('contacts')) {
    const { data } = await supabase
      .from('contact_messages')
      .select('email')
      .not('objet', 'ilike', 'Jeu concours%');

    groups.push({
      source: 'contacts',
      ...sourceLabels.contacts,
      emails: uniqueEmails(data),
    });
  }

  if (sources.includes('contest')) {
    const { data } = await supabase
      .from('contact_messages')
      .select('email')
      .ilike('objet', 'Jeu concours%');

    groups.push({
      source: 'contest',
      ...sourceLabels.contest,
      emails: uniqueEmails(data),
    });
  }

  return groups;
}

export async function getNewsletterRecipients(sources?: string[]) {
  const groups = await getNewsletterRecipientGroups(sources);
  const emails = new Set<string>();
  for (const group of groups) {
    for (const email of group.emails) emails.add(email);
  }
  return {
    groups,
    emails: [...emails].sort(),
  };
}
