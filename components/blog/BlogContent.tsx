import type { JSONContent } from '@tiptap/react';
import type { ReactNode } from 'react';
import sanitizeHtml from 'sanitize-html';
import { isBlogEditorContent, type BlogCalloutType } from '@/lib/editor/types';
import './blog-content.css';

type Props = {
  content?: JSONContent | null;
  legacyHtml?: string | null;
};

const CALLOUT_META: Record<BlogCalloutType, { icon: string; label: string }> = {
  tip: { icon: '💡', label: 'Conseil Island Dreams' },
  warning: { icon: '⚠️', label: 'Attention' },
  info: { icon: 'ℹ️', label: 'À savoir' },
};

function safeLink(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const href = value.trim();
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(href)) return href;
  return null;
}

function safeImage(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const src = value.trim();
  if (/^(https?:\/\/|\/)/i.test(src)) return src;
  return null;
}

function isExternalLink(href: string): boolean {
  if (!/^https?:\/\//i.test(href)) return false;
  try {
    const hostname = new URL(href).hostname.replace(/^www\./, '');
    return hostname !== 'islanddreams.re';
  } catch {
    return false;
  }
}

function alignmentClass(value: unknown): string | undefined {
  if (value === 'center') return 'text-align-center';
  if (value === 'right') return 'text-align-right';
  if (value === 'left') return 'text-align-left';
  return undefined;
}

function renderMarks(node: JSONContent, value: ReactNode, key: string): ReactNode {
  return (node.marks ?? []).reduce<ReactNode>((result, mark, index) => {
    const markKey = `${key}-mark-${index}`;
    if (mark.type === 'bold') return <strong key={markKey}>{result}</strong>;
    if (mark.type === 'italic') return <em key={markKey}>{result}</em>;
    if (mark.type === 'underline') return <u key={markKey}>{result}</u>;
    if (mark.type === 'strike') return <s key={markKey}>{result}</s>;
    if (mark.type === 'code') return <code key={markKey}>{result}</code>;
    if (mark.type === 'link') {
      const href = safeLink(mark.attrs?.href);
      if (!href) return result;
      const external = isExternalLink(href);
      return <a key={markKey} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{result}</a>;
    }
    return result;
  }, node.text ?? '');
}

function renderNode(node: JSONContent, key: string): ReactNode {
  if (node.type === 'text') return renderMarks(node, node.text ?? '', key);
  if (node.type === 'hardBreak') return <br key={key} />;

  const children = (node.content ?? []).map((child, index) => renderNode(child, `${key}-${index}`));
  const align = alignmentClass(node.attrs?.textAlign);

  switch (node.type) {
    case 'doc': return <>{children}</>;
    case 'paragraph': return <p key={key} className={align}>{children}</p>;
    case 'heading': {
      const level = node.attrs?.level === 3 ? 3 : 2;
      return level === 3 ? <h3 key={key} className={align}>{children}</h3> : <h2 key={key} className={align}>{children}</h2>;
    }
    case 'bulletList': return <ul key={key}>{children}</ul>;
    case 'orderedList': return <ol key={key}>{children}</ol>;
    case 'listItem': return <li key={key}>{children}</li>;
    case 'blockquote': return <blockquote key={key}>{children}</blockquote>;
    case 'horizontalRule': return <hr key={key} />;
    case 'codeBlock': return <pre key={key}><code>{children}</code></pre>;
    case 'image': {
      const src = safeImage(node.attrs?.src);
      if (!src) return null;
      const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : '';
      // Les dimensions sont inconnues pour les images ajoutées par l'administrateur.
      // eslint-disable-next-line @next/next/no-img-element
      return <img key={key} src={src} alt={alt} loading="lazy" decoding="async" />;
    }
    case 'blogCallout': {
      const type: BlogCalloutType = node.attrs?.type === 'warning' || node.attrs?.type === 'tip' ? node.attrs.type : 'info';
      const meta = CALLOUT_META[type];
      return (
        <aside key={key} className={`blog-callout blog-callout--${type}`} aria-label={meta.label}>
          <div className="blog-callout-title">{meta.icon} {meta.label}</div>
          {children}
        </aside>
      );
    }
    default: return <>{children}</>;
  }
}

function sanitizeLegacyArticle(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['h2', 'h3', 'p', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'hr', 'br', 'code', 'pre'],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'loading', 'decoding'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
    transformTags: {
      h1: 'h2',
      a: (_tagName, attribs) => {
        const href = safeLink(attribs.href);
        if (!href) return { tagName: 'span', attribs: {} };
        const external = isExternalLink(href);
        return {
          tagName: 'a',
          attribs: {
            href,
            ...(attribs.title ? { title: attribs.title } : {}),
            ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
          },
        };
      },
      img: (_tagName, attribs): sanitizeHtml.Tag => {
        const src = safeImage(attribs.src);
        if (!src) return { tagName: 'span', attribs: {} };
        return {
          tagName: 'img',
          attribs: { src, alt: attribs.alt ?? '', loading: 'lazy', decoding: 'async' },
        };
      },
    },
  });
}

export function BlogContent({ content, legacyHtml }: Props) {
  if (isBlogEditorContent(content)) {
    return <div className="article-content">{renderNode(content, 'root')}</div>;
  }

  if (!legacyHtml) return null;

  return (
    <div
      className="article-content"
      dangerouslySetInnerHTML={{ __html: sanitizeLegacyArticle(legacyHtml) }}
    />
  );
}
