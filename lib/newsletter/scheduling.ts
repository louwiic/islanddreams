export function reunionDateToIso(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error('Date invalide.');
  const date = new Date(`${value}:00+04:00`);
  if (!Number.isFinite(date.getTime()) || new Date(date.getTime() + 4 * 3600000).toISOString().slice(0, 16) !== value) throw new Error('Date invalide.');
  return date.toISOString();
}

export function validateSchedule(input: { subject?: unknown; html?: unknown; scheduledAt?: unknown; requestKey?: unknown }, now = Date.now()) {
  if (typeof input.subject !== 'string' || !input.subject.trim() || input.subject.length > 200) throw new Error('Objet requis (200 caractères maximum).');
  if (typeof input.html !== 'string' || !input.html.trim() || input.html.length > 200000) throw new Error('Contenu requis (200 000 caractères maximum).');
  if (typeof input.requestKey !== 'string' || !/^[a-f0-9-]{36}$/i.test(input.requestKey)) throw new Error('Identifiant de requête invalide.');
  if (typeof input.scheduledAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(input.scheduledAt)) throw new Error('Date avec fuseau horaire requise.');
  const time = Date.parse(input.scheduledAt);
  if (!Number.isFinite(time) || time < now + 60000 || time > now + 366 * 86400000) throw new Error('Choisis une date entre une minute et un an à partir de maintenant.');
  return { subject: input.subject.trim(), html: input.html, scheduledAt: new Date(time).toISOString(), requestKey: input.requestKey };
}
