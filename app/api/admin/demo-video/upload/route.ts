import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const MAX_VIDEO_SIZE = 200 * 1024 * 1024;
const VIDEO_BUCKET = 'demo-videos';
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export async function POST(req: Request) {
  try {
    const { fileName, contentType, size } = await req.json();

    if (!fileName || !contentType || !size) {
      return NextResponse.json({ error: 'Informations fichier manquantes' }, { status: 400 });
    }

    if (!ALLOWED_VIDEO_TYPES.includes(contentType)) {
      return NextResponse.json({ error: 'Le fichier doit être une vidéo' }, { status: 400 });
    }

    if (Number(size) > MAX_VIDEO_SIZE) {
      return NextResponse.json({ error: 'La vidéo ne doit pas dépasser 200 Mo' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const ext = String(fileName).split('.').pop()?.toLowerCase() || 'mp4';
    const path = `${Date.now()}.${ext}`;

    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const hasVideoBucket = existingBuckets.some((bucket) => bucket.name === VIDEO_BUCKET);
    if (!hasVideoBucket) {
      const { error: bucketError } = await supabase.storage.createBucket(VIDEO_BUCKET, {
        public: true,
        fileSizeLimit: MAX_VIDEO_SIZE,
        allowedMimeTypes: ALLOWED_VIDEO_TYPES,
      });

      if (bucketError) {
        return NextResponse.json({ error: bucketError.message }, { status: 500 });
      }
    } else {
      const { error: bucketError } = await supabase.storage.updateBucket(VIDEO_BUCKET, {
        public: true,
        fileSizeLimit: MAX_VIDEO_SIZE,
        allowedMimeTypes: ALLOWED_VIDEO_TYPES,
      });

      if (bucketError) {
        return NextResponse.json({ error: bucketError.message }, { status: 500 });
      }
    }

    const { data: signedUpload, error } = await supabase.storage
      .from(VIDEO_BUCKET)
      .createSignedUploadUrl(path, { upsert: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(path);
    return NextResponse.json({
      bucket: VIDEO_BUCKET,
      path,
      signedUrl: signedUpload.signedUrl,
      token: signedUpload.token,
      url: data.publicUrl,
      maxSize: MAX_VIDEO_SIZE,
    });
  } catch (error) {
    console.error('[DEMO_VIDEO_UPLOAD]', error);
    return NextResponse.json({ error: 'Upload vidéo impossible' }, { status: 500 });
  }
}
