import { Node, mergeAttributes } from '@tiptap/core';
import type { BlogCalloutType } from '@/lib/editor/types';

const CALLOUT_TYPES: BlogCalloutType[] = ['info', 'warning', 'tip'];

export const BlogCallout = Node.create({
  name: 'blogCallout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: (element) => {
          const value = element.getAttribute('data-callout-type') as BlogCalloutType | null;
          return value && CALLOUT_TYPES.includes(value) ? value : 'info';
        },
        renderHTML: (attributes) => ({
          'data-callout-type': CALLOUT_TYPES.includes(attributes.type) ? attributes.type : 'info',
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'aside[data-blog-callout]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'aside',
      mergeAttributes(HTMLAttributes, {
        'data-blog-callout': '',
        class: 'blog-callout',
      }),
      0,
    ];
  },
});
