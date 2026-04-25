import { NextRequest, NextResponse } from 'next/server';
import { parseRecipeFromImage } from '@/lib/ai/parseRecipeFromImage';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
type AllowedType = typeof ALLOWED_TYPES[number];

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB — Claude's limit

export async function POST(req: NextRequest) {
  const { base64, mediaType }: { base64: string; mediaType: string } = await req.json();

  if (!base64 || !mediaType) {
    return NextResponse.json({ ok: false, reason: 'missing_data' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(mediaType as AllowedType)) {
    return NextResponse.json({ ok: false, reason: 'unsupported_type' }, { status: 400 });
  }

  // Rough size check on base64 payload
  if (base64.length > MAX_SIZE_BYTES * 1.4) {
    return NextResponse.json({ ok: false, reason: 'file_too_large' }, { status: 413 });
  }

  const result = await parseRecipeFromImage(base64, mediaType as AllowedType);
  return NextResponse.json(result);
}
