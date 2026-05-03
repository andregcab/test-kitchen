export function isYouTubeUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === 'youtube.com' || hostname === 'www.youtube.com' || hostname === 'youtu.be';
  } catch {
    return false;
  }
}

export async function fetchYouTubeDescription(url: string): Promise<string | null> {
  let html: string;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; test-kitchen-recipe-importer/1.0)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    html = await res.text();
  } catch {
    return null;
  }

  // YouTube embeds the full description in ytInitialData as attributedDescription
  const match = html.match(/"attributedDescription":\{"content":"([\s\S]*?)","commandRuns"/);
  if (match) {
    return match[1]
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .trim();
  }

  // Fallback: look for shortDescription in ytInitialData
  const shortMatch = html.match(/"shortDescription":"([\s\S]*?)","isCrawlable"/);
  if (shortMatch) {
    return shortMatch[1]
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .trim();
  }

  return null;
}
