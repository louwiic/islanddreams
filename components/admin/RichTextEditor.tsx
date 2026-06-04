'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { useState } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Heading2, Heading3, Link as LinkIcon,
  AlignLeft, AlignCenter, Undo, Redo, RemoveFormatting, Code,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  onChange: (html: string) => void;
};

function ToolbarButton({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: React.ReactNode; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded transition-colors',
        active ? 'bg-jungle-100 text-jungle-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ value, onChange }: Props) {
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceHtml, setSourceHtml] = useState(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'underline text-ocean-600' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value,
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      setSourceHtml(html);
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none px-3 py-2.5 min-h-[200px] focus:outline-none text-sm',
      },
    },
  });

  const toggleSourceMode = () => {
    if (!editor) return;
    if (!sourceMode) {
      // Basculer vers source : capturer le HTML actuel
      setSourceHtml(editor.getHTML());
    } else {
      // Revenir vers visual : injecter le HTML dans l'éditeur
      editor.commands.setContent(sourceHtml, { emitUpdate: false });
      onChange(sourceHtml);
    }
    setSourceMode(!sourceMode);
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceHtml(e.target.value);
    onChange(e.target.value);
  };

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('URL du lien :');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-jungle-500/20 focus-within:border-jungle-500">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50/50">
        {!sourceMode && (
          <>
            <ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Gras">
              <Bold size={15} />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italique">
              <Italic size={15} />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Souligné">
              <UnderlineIcon size={15} />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Barré">
              <Strikethrough size={15} />
            </ToolbarButton>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            <ToolbarButton active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Titre H2">
              <Heading2 size={15} />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Titre H3">
              <Heading3 size={15} />
            </ToolbarButton>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            <ToolbarButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Liste à puces">
              <List size={15} />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Liste numérotée">
              <ListOrdered size={15} />
            </ToolbarButton>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            <ToolbarButton active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Aligner à gauche">
              <AlignLeft size={15} />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Centrer">
              <AlignCenter size={15} />
            </ToolbarButton>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            <ToolbarButton active={editor.isActive('link')} onClick={addLink} title="Lien">
              <LinkIcon size={15} />
            </ToolbarButton>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Supprimer le formatage">
              <RemoveFormatting size={15} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Annuler">
              <Undo size={15} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Rétablir">
              <Redo size={15} />
            </ToolbarButton>

            <div className="w-px h-5 bg-gray-200 mx-1" />
          </>
        )}

        {/* Bouton source HTML */}
        <ToolbarButton active={sourceMode} onClick={toggleSourceMode} title="Source HTML">
          <Code size={15} />
        </ToolbarButton>
      </div>

      {/* Visual editor */}
      <div className={sourceMode ? 'hidden' : ''}>
        <EditorContent editor={editor} />
      </div>

      {/* Source HTML textarea */}
      {sourceMode && (
        <textarea
          value={sourceHtml}
          onChange={handleSourceChange}
          className="w-full px-3 py-2.5 min-h-[300px] font-mono text-xs text-gray-700 focus:outline-none resize-y bg-gray-50"
          spellCheck={false}
        />
      )}
    </div>
  );
}
