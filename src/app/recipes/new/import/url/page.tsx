'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import RecipeForm from '@/components/RecipeForm';
import BackButton from '@/components/BackButton';
import { RecipeData } from '@/lib/types';

type State =
  | { stage: 'input' }
  | { stage: 'loading' }
  | { stage: 'review'; data: RecipeData; tags: string[]; images: string[] }
  | { stage: 'error'; reason: 'no_structured_data' | 'fetch_error' | 'invalid_url' | 'unknown' };

const LOADING_MESSAGES = [
  'Fetching recipe…',
  'Chopping the vegetables…',
  'Preheating the oven…',
  'Consulting the chef…',
  'Reducing the sauce…',
  'Tasting for seasoning…',
  'Deglazing the pan…',
  'Tempering the chocolate…',
  'Proofing the dough…',
  'Clarifying the butter…',
  'Julienning the carrots…',
  'Searing over high heat…',
  'Resting before plating…',
];

const errorMessages = {
  no_structured_data:
    "This site doesn't include structured recipe data, so we couldn't parse it automatically. Try copying the URL from a major recipe site (AllRecipes, NYT Cooking, Food Network, etc.), or type the recipe in manually.",
  fetch_error:
    "We couldn't reach that URL. Check that the link is correct and the site is accessible.",
  invalid_url:
    "That doesn't look like a valid URL. Make sure it starts with https://",
  unknown:
    'Something went wrong. Try again or enter the recipe manually.',
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function UrlImportPage() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<State>({ stage: 'input' });
  const [loadingMsg, setLoadingMsg] = useState('');
  const queueRef = useRef<string[]>([]);
  const queueIndexRef = useRef(0);

  function nextMsg(): string {
    if (queueIndexRef.current >= queueRef.current.length) {
      queueRef.current = shuffle(LOADING_MESSAGES);
      queueIndexRef.current = 0;
    }
    return queueRef.current[queueIndexRef.current++];
  }

  useEffect(() => {
    if (state.stage !== 'loading') return;
    queueRef.current = shuffle(LOADING_MESSAGES);
    queueIndexRef.current = 0;
    setLoadingMsg(nextMsg());
    const id = setInterval(() => setLoadingMsg(nextMsg()), 3000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.stage]);

  async function handleFetch() {
    if (!url.trim()) return;
    setState({ stage: 'loading' });
    const res = await fetch('/api/import/url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.trim() }),
    });
    const json = await res.json();
    if (json.ok) {
      setState({ stage: 'review', data: json.data, tags: json.tags ?? [], images: json.images ?? [] });
    } else {
      setState({ stage: 'error', reason: json.reason ?? 'unknown' });
    }
  }

  const backHref = state.stage === 'review' || state.stage === 'error' ? undefined : '/recipes/new';

  return (
    <div className="page-container py-10">
      <div className="flex items-center gap-4 mb-10">
        <BackButton
          href={backHref}
          onClick={backHref ? undefined : () => setState({ stage: 'input' })}
        />
        <div>
          <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 600 }}>
            Import from website
          </h1>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '15px' }}>
            Paste a link and we&apos;ll do the rest
          </p>
        </div>
      </div>

      {(state.stage === 'input' || state.stage === 'loading') && (
        <div className="flex flex-col gap-4 max-w-lg">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
            placeholder="https://www.allrecipes.com/recipe/..."
            className="w-full px-4 rounded-xl border-2 text-base outline-none transition-colors"
            style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--foreground)' }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            autoFocus
            disabled={state.stage === 'loading'}
          />
          <button
            onClick={handleFetch}
            disabled={!url.trim() || state.stage === 'loading'}
            suppressHydrationWarning
            className="w-full py-4 text-base text-white font-semibold rounded-xl disabled:opacity-60 flex items-center justify-center gap-3"
            style={{ background: 'var(--accent)' }}
          >
            {state.stage === 'loading' && (
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
            {state.stage === 'loading' ? loadingMsg : 'Get Recipe'}
          </button>
          <p className="text-sm text-center" style={{ color: 'var(--foreground-muted)' }}>
            Works best with AllRecipes, NYT Cooking, Food Network, Serious Eats, and most major recipe sites.
          </p>
        </div>
      )}

      {state.stage === 'error' && (
        <div className="flex flex-col gap-6 max-w-lg">
          <div
            className="p-5 rounded-2xl"
            style={{ background: 'var(--card)', border: '1px solid var(--error)', borderLeft: '3px solid var(--error)' }}
          >
            <p className="font-semibold mb-1" style={{ color: 'var(--error)' }}>
              Couldn&apos;t import this recipe
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
              {errorMessages[state.reason]}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setState({ stage: 'input' })}
              className="w-full py-4 font-semibold rounded-xl border-2"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--accent-light)' }}
            >
              Try a different URL
            </button>
            <Link
              href="/recipes/new/manual"
              className="block w-full py-4 font-semibold rounded-xl border text-center"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground-muted)', background: 'var(--card)' }}
            >
              Enter manually instead
            </Link>
          </div>
        </div>
      )}

      {state.stage === 'review' && (
        <div className="flex flex-col gap-6">
          <div
            className="flex items-start gap-3 p-4 rounded-2xl max-w-lg"
            style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)' }}
          >
            <span style={{ color: 'var(--accent)', fontSize: 18 }}>✓</span>
            <div>
              <p className="font-semibold" style={{ color: 'var(--accent)' }}>Recipe imported!</p>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                Review the details below and make any changes before saving.
              </p>
            </div>
          </div>
          <RecipeForm initialData={state.data} initialTags={state.tags} initialImages={state.images} />
        </div>
      )}
    </div>
  );
}
