'use client';

import type { JSONContent } from '@tiptap/react';
import { EditorContent, useEditor } from '@tiptap/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EditorBubbleMenu } from './EditorBubbleMenu';
import { EditorToolbar } from './EditorToolbar';
import { getBlogEditorExtensions } from '@/lib/editor/extensions';
import { EMPTY_BLOG_DOCUMENT } from '@/lib/editor/types';
import '../blog/blog-content.css';
import './editor.css';

export interface BlogEditorProps {
  content?: JSONContent;
  onChange: (content: JSONContent) => void;
  placeholder?: string;
  editable?: boolean;
  legacyHtml?: string;
  uploadImage?: (file: File) => Promise<string>;
}

export function BlogEditor({
  content,
  onChange,
  placeholder = 'Rédigez votre article…',
  editable = true,
  legacyHtml,
  uploadImage,
}: BlogEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const extensions = useMemo(() => getBlogEditorExtensions(placeholder), [placeholder]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: content ?? legacyHtml ?? EMPTY_BLOG_DOCUMENT,
    editable,
    editorProps: {
      attributes: {
        class: 'blog-editor-content article-content',
        'aria-label': 'Contenu de l’article',
      },
    },
    onCreate: ({ editor: current }) => {
      if (!content && legacyHtml) onChangeRef.current(current.getJSON());
    },
    onUpdate: ({ editor: current }) => onChangeRef.current(current.getJSON()),
  });

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editable, editor]);

  useEffect(() => {
    if (!editor || !content) return;
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(content);
    if (current !== incoming) editor.commands.setContent(content, { emitUpdate: false });
  }, [content, editor]);

  const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !editor || !uploadImage) return;

    const alt = window.prompt('Décrivez cette image pour l’accessibilité et le référencement');
    if (alt === null) return;
    if (!alt.trim()) {
      setImageError('Ajoutez un texte alternatif avant d’insérer l’image.');
      return;
    }

    setImageError('');
    setUploadingImage(true);
    try {
      const src = await uploadImage(file);
      editor.chain().focus().setImage({ src, alt: alt.trim() }).run();
    } catch {
      setImageError('Impossible d’importer cette image. Réessayez.');
    } finally {
      setUploadingImage(false);
    }
  };

  if (!editor) return <div className="min-h-[28rem] animate-pulse rounded-xl bg-gray-100" aria-label="Chargement de l’éditeur" />;

  return (
    <div>
      <div className="blog-editor-shell">
        {editable && (
          <EditorToolbar
            editor={editor}
            onSelectImage={uploadImage ? () => inputRef.current?.click() : undefined}
            uploadingImage={uploadingImage}
          />
        )}
        <EditorBubbleMenu editor={editor} />
        <EditorContent editor={editor} />
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImage} className="sr-only" tabIndex={-1} />
      {imageError && <p role="alert" className="mt-2 text-sm font-medium text-coral-600">{imageError}</p>}
      {uploadingImage && <p role="status" className="mt-2 text-sm text-gray-500">Import de l’image…</p>}
    </div>
  );
}
