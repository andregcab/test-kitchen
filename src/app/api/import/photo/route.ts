import { NextRequest, NextResponse } from 'next/server';
import { parseRecipeFromImages, ImageInput } from '@/lib/ai/parseRecipeFromImage';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
type AllowedType = typeof ALLOWED_TYPES[number];

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB per image — Claude's limit
const MAX_IMAGES = 3;

export async function POST(req: NextRequest) {
  const { images }: { images: { base64: string; mediaType: string }[] } = await req.json();

  if (!Array.isArray(images) || images.length === 0) {
    return NextResponse.json({ ok: false, reason: 'missing_data' }, { status: 400 });
  }

  if (images.length > MAX_IMAGES) {
    return NextResponse.json({ ok: false, reason: 'too_many_images' }, { status: 400 });
  }

  for (const img of images) {
    if (!ALLOWED_TYPES.includes(img.mediaType as AllowedType)) {
      return NextResponse.json({ ok: false, reason: 'unsupported_type' }, { status: 400 });
    }
    if (img.base64.length > MAX_SIZE_BYTES * 1.4) {
      return NextResponse.json({ ok: false, reason: 'file_too_large' }, { status: 413 });
    }
  }

  const result = await parseRecipeFromImages(images as ImageInput[]);
  return NextResponse.json(result);
}
