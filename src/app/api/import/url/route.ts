import { NextRequest, NextResponse } from 'next/server';
import { importFromUrl } from '@/lib/import/url';
import { isYouTubeUrl, fetchYouTubeDescription } from '@/lib/import/youtube';
import { parseRecipeFromText } from '@/lib/ai/parseRecipeFromText';

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL required' }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid_url' }, { status: 400 });
  }

  if (isYouTubeUrl(url)) {
    const description = await fetchYouTubeDescription(url);
    if (!description) {
      return NextResponse.json({ ok: false, reason: 'fetch_error' });
    }
    const result = await parseRecipeFromText(description, url);
    return NextResponse.json({ ...result, images: [] });
  }

  const result = await importFromUrl(url);
  return NextResponse.json(result);
}
