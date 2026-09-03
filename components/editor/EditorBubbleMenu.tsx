'use client';

import type { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Image as ImageIcon, Link as LinkIcon, Unlink } from 'lucide-react';

export function EditorBubbleMenu({ editor }: { editor: Editor }) {
  const changeLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const href = window.prompt('Adresse du lien', previous ?? 'https://');
    if (href === null) return;
    if (!href.trim()) editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run();
  };

  const changeImageAlt = () => {
    const previous = editor.getAttributes('image').alt as string | undefined;
    const alt = window.prompt('Texte alternatif de l’image', previous ?? '');
    if (alt === null) return;
    editor.chain().focus().updateAttributes('image', { alt: alt.trim() }).run();
  };

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: 'top' }}
      shouldShow={({ editor: current }) => current.isActive('link') || current.isActive('image')}
    >
      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
        {editor.isActive('link') && (
          <>
            <button type="button" aria-label="Modifier le lien" onClick={changeLink} className="rounded p-2 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-jungle-500"><LinkIcon size={16} /></button>
            <button type="button" aria-label="Supprimer le lien" onClick={() => editor.chain().focus().unsetLink().run()} className="rounded p-2 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-jungle-500"><Unlink size={16} /></button>
          </>
        )}
        {editor.isActive('image') && (
          <button type="button" aria-label="Modifier le texte alternatif" onClick={changeImageAlt} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-jungle-500"><ImageIcon size={16} /> Texte alternatif</button>
        )}
      </div>
    </BubbleMenu>
  );
}
