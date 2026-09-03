import type { JSONContent } from '@tiptap/react';

export type BlogEditorContent = JSONContent;
export type BlogCalloutType = 'info' | 'warning' | 'tip';

export const EMPTY_BLOG_DOCUMENT: BlogEditorContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

export function isBlogEditorContent(value: unknown): value is BlogEditorContent {
  return Boolean(
    value
      && typeof value === 'object'
      && (value as { type?: unknown }).type === 'doc'
      && (!('content' in value) || Array.isArray((value as { content?: unknown }).content)),
  );
}
