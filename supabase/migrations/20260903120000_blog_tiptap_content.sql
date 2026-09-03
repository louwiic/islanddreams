alter table public.blog_posts
  add column if not exists content_json jsonb;

comment on column public.blog_posts.content_json is
  'Document Tiptap structuré. Le champ content HTML est conservé pour la compatibilité des anciens articles.';

alter table public.blog_posts
  drop constraint if exists blog_posts_content_json_document_check;

alter table public.blog_posts
  add constraint blog_posts_content_json_document_check
  check (
    content_json is null
    or (
      jsonb_typeof(content_json) = 'object'
      and content_json ->> 'type' = 'doc'
    )
  );
