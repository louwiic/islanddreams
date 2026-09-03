'use client';

import type { Editor } from '@tiptap/react';
import { useEditorState } from '@tiptap/react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Info,
  Italic,
  Lightbulb,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
  TriangleAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BlogCalloutType } from '@/lib/editor/types';

type Props = {
  editor: Editor;
  onSelectImage?: () => void;
  uploadingImage?: boolean;
};

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function ToolbarButton({ label, active, disabled, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-md p-2 text-gray-600 transition-colors hover:bg-white hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jungle-500 disabled:cursor-not-allowed disabled:opacity-35',
        active && 'bg-jungle-100 text-jungle-700',
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden="true" className="mx-1 h-6 w-px shrink-0 bg-gray-200" />;
}

function normalizeLink(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function EditorToolbar({ editor, onSelectImage, uploadingImage }: Props) {
  useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      from: current.state.selection.from,
      to: current.state.selection.to,
      editable: current.isEditable,
    }),
  });

  const editLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const value = window.prompt('Adresse du lien', previous ?? 'https://');
    if (value === null) return;
    const href = normalizeLink(value);
    if (!href) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };

  const insertCallout = (type: BlogCalloutType) => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'blogCallout',
        attrs: { type },
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Saisissez votre message…' }] }],
      })
      .run();
  };

  return (
    <div className="blog-editor-toolbar" role="toolbar" aria-label="Mise en forme de l’article">
      <ToolbarButton label="Annuler" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 size={17} /></ToolbarButton>
      <ToolbarButton label="Rétablir" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 size={17} /></ToolbarButton>
      <Divider />
      <ToolbarButton label="Paragraphe" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}><Pilcrow size={17} /></ToolbarButton>
      <ToolbarButton label="Titre H2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={17} /></ToolbarButton>
      <ToolbarButton label="Titre H3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={17} /></ToolbarButton>
      <Divider />
      <ToolbarButton label="Gras" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={17} /></ToolbarButton>
      <ToolbarButton label="Italique" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={17} /></ToolbarButton>
      <ToolbarButton label="Souligné" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={17} /></ToolbarButton>
      <ToolbarButton label="Barré" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={17} /></ToolbarButton>
      <Divider />
      <ToolbarButton label="Liste à puces" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={17} /></ToolbarButton>
      <ToolbarButton label="Liste numérotée" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={17} /></ToolbarButton>
      <ToolbarButton label="Citation" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={17} /></ToolbarButton>
      <ToolbarButton label="Séparateur horizontal" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={17} /></ToolbarButton>
      <Divider />
      <ToolbarButton label="Aligner à gauche" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft size={17} /></ToolbarButton>
      <ToolbarButton label="Centrer" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter size={17} /></ToolbarButton>
      <ToolbarButton label="Aligner à droite" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight size={17} /></ToolbarButton>
      <Divider />
      <ToolbarButton label={editor.isActive('link') ? 'Modifier le lien' : 'Ajouter un lien'} active={editor.isActive('link')} onClick={editLink}><LinkIcon size={17} /></ToolbarButton>
      <ToolbarButton label="Supprimer le lien" disabled={!editor.isActive('link')} onClick={() => editor.chain().focus().unsetLink().run()}><Unlink size={17} /></ToolbarButton>
      <ToolbarButton label={uploadingImage ? 'Import de l’image en cours' : 'Insérer une image'} disabled={!onSelectImage || uploadingImage} onClick={() => onSelectImage?.()}><ImagePlus size={17} /></ToolbarButton>
      <Divider />
      <ToolbarButton label="Insérer un conseil" onClick={() => insertCallout('tip')}><Lightbulb size={17} /></ToolbarButton>
      <ToolbarButton label="Insérer une attention" onClick={() => insertCallout('warning')}><TriangleAlert size={17} /></ToolbarButton>
      <ToolbarButton label="Insérer une information" onClick={() => insertCallout('info')}><Info size={17} /></ToolbarButton>
    </div>
  );
}
