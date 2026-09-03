import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { BlogCallout } from '@/components/editor/extensions/BlogCallout';

export function getBlogEditorExtensions(placeholder = 'Rédigez votre article…') {
  return [
    StarterKit.configure({ heading: { levels: [2, 3] } }),
    Underline,
    Link.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      defaultProtocol: 'https',
    }),
    Image.configure({
      inline: false,
      allowBase64: false,
    }),
    Placeholder.configure({ placeholder }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    BlogCallout,
  ];
}
