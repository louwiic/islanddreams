import { NextResponse } from 'next/server';
import type { ProductCategory } from '@/lib/types/product';

const ALLOWED_CATEGORIES: ProductCategory[] = [
  'magnets',
  'stickers',
  'textile',
  'goodies',
  'decoration',
  'accessoires',
  'uncategorized',
];

type SuggestionRequest = {
  image?: string;
  imageAlt?: string;
  current?: {
    name?: string;
    category?: ProductCategory;
    tags?: string[];
  };
};

type OpenAIChoice = {
  message?: {
    content?: string | null;
  };
};

type OpenAIResponse = {
  choices?: OpenAIChoice[];
  error?: {
    message?: string;
  };
};

function cleanString(value: unknown, maxLength = 500) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function cleanStringArray(value: unknown, maxItems: number, maxLength = 60) {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .map((item) => cleanString(item, maxLength))
        .filter(Boolean)
    )
  ).slice(0, maxItems);
}

function parseSuggestions(content: string) {
  const parsed = JSON.parse(content) as Record<string, unknown>;
  const category = cleanString(parsed.category, 40) as ProductCategory;
  const safeCategory = ALLOWED_CATEGORIES.includes(category)
    ? category
    : 'uncategorized';

  const rawFaqs = Array.isArray(parsed.faqs) ? parsed.faqs : [];
  const faqs = rawFaqs
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const faq = item as Record<string, unknown>;
      const question = cleanString(faq.question, 140);
      const answer = cleanString(faq.answer, 400);
      return question && answer ? { question, answer } : null;
    })
    .filter((item): item is { question: string; answer: string } => Boolean(item))
    .slice(0, 4);

  return {
    name: cleanString(parsed.name, 90),
    slug: cleanString(parsed.slug, 100),
    shortDescription: cleanString(parsed.shortDescription, 220),
    description: cleanString(parsed.description, 2500),
    category: safeCategory,
    tags: cleanStringArray(parsed.tags, 8),
    metaTitle: cleanString(parsed.metaTitle, 70),
    metaDescription: cleanString(parsed.metaDescription, 170),
    focusKeyword: cleanString(parsed.focusKeyword, 80),
    seoKeywords: cleanStringArray(parsed.seoKeywords, 10),
    imageAlt: cleanString(parsed.imageAlt, 140),
    faqs,
  };
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'Clé OpenAI manquante côté serveur.' },
      { status: 500 }
    );
  }

  let body: SuggestionRequest;
  try {
    body = (await req.json()) as SuggestionRequest;
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const image = body.image?.trim();
  if (!image) {
    return NextResponse.json(
      { error: 'Ajoutez au moins une image produit avant de lancer les suggestions IA.' },
      { status: 400 }
    );
  }

  const prompt = [
    "Analyse l'image principale d'un produit Island Dreams 974.",
    "Objectif: proposer une fiche produit e-commerce en français, prête à modifier dans l'admin.",
    "La marque vend des souvenirs de La Réunion: magnets, stickers, textile, goodies, décoration, accessoires.",
    `Catégories autorisées: ${ALLOWED_CATEGORIES.join(', ')}.`,
    "N'invente pas de prix, de stock, de poids ou de SKU.",
    "Optimise le SEO local avec des expressions naturelles comme Réunion, 974, souvenir, cadeau personnalisé si pertinent.",
    "Retourne uniquement un objet JSON valide, sans markdown.",
    '',
    'Schéma JSON attendu:',
    JSON.stringify({
      name: 'Nom produit court et commercial',
      slug: 'slug-url-kebab-case',
      shortDescription: 'Résumé court',
      description: '<p>Description HTML persuasive.</p><ul><li>Point fort</li></ul>',
      category: 'magnets',
      tags: ['souvenir reunion', '974'],
      metaTitle: 'Titre SEO max 60 caractères',
      metaDescription: 'Description SEO max 155 caractères',
      focusKeyword: 'mot clé principal',
      seoKeywords: ['mot clé secondaire'],
      imageAlt: 'Texte alternatif précis de l image',
      faqs: [{ question: 'Question client ?', answer: 'Réponse courte.' }],
    }),
    '',
    `Nom actuel si utile: ${body.current?.name || 'vide'}`,
    `Catégorie actuelle si utile: ${body.current?.category || 'vide'}`,
    `Tags actuels si utile: ${(body.current?.tags || []).join(', ') || 'vide'}`,
    `Alt actuel si utile: ${body.imageAlt || 'vide'}`,
  ].join('\n');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content:
              'Tu es un assistant e-commerce et SEO. Tu réponds uniquement avec du JSON valide.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: image,
                },
              },
            ],
          },
        ],
      }),
    });

    const data = (await response.json()) as OpenAIResponse;
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Impossible de générer les suggestions IA.' },
        { status: response.status }
      );
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: 'Réponse IA vide.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ suggestions: parseSuggestions(content) });
  } catch (error) {
    console.error('[Product AI suggestions]', error);
    return NextResponse.json(
      { error: 'Impossible de contacter le service IA.' },
      { status: 500 }
    );
  }
}
