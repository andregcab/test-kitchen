'use client';

import { useState } from 'react';
import Link from 'next/link';
import RecipeForm from '@/components/RecipeForm';
import BackButton from '@/components/BackButton';
import { RecipeData } from '@/lib/types';

type State =
  | { stage: 'input' }
  | { stage: 'loading' }
  | { stage: 'review'; data: RecipeData; tags: string[] }
  | {
      stage: 'error';
      reason:
        | 'no_structured_data'
        | 'fetch_error'
        | 'invalid_url'
        | 'unknown';
    };

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

export default function UrlImportPage() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<State>({ stage: 'input' });

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
      setState({
        stage: 'review',
        data: json.data,
        tags: json.tags ?? [],
      });
    } else {
      setState({
        stage: 'error',
        reason: json.reason ?? 'unknown',
      });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleFetch();
  }

  const backHref =
    state.stage === 'review' || state.stage === 'error'
      ? undefined
      : '/recipes/new';

  return (
    <div className="px-[150px] py-8">
      <div className="flex items-center gap-3 mb-8">
        <BackButton
          href={backHref}
          onClick={
            backHref ? undefined : () => setState({ stage: 'input' })
          }
        />
        <h1 className="text-2xl font-bold">Import from website</h1>
      </div>

      {/* Input stage */}
      {(state.stage === 'input' || state.stage === 'loading') && (
        <div className="flex flex-col gap-4">
          <p style={{ color: 'var(--muted)' }}>
            Paste the link to any recipe page and we&apos;ll fill in
            the details for you.
          </p>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://www.allrecipes.com/recipe/..."
            className="w-full px-4 py-4 text-lg rounded-xl border-2 outline-none focus:border-[var(--accent)] transition-colors"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--background)',
            }}
            autoFocus
            disabled={state.stage === 'loading'}
          />
          <button
            onClick={handleFetch}
            disabled={!url.trim() || state.stage === 'loading'}
            className="w-full py-4 text-lg text-white font-semibold rounded-xl disabled:opacity-60 transition-opacity"
            style={{ background: 'var(--accent)' }}
          >
            {state.stage === 'loading'
              ? 'Fetching recipe…'
              : 'Get Recipe'}
          </button>

          <p
            className="text-sm text-center"
            style={{ color: 'var(--muted)' }}
          >
            Works best with AllRecipes, NYT Cooking, Food Network,
            Serious Eats, and most major recipe sites.
          </p>
        </div>
      )}

      {/* Error stage */}
      {state.stage === 'error' && (
        <div className="flex flex-col gap-6">
          <div
            className="p-5 rounded-2xl"
            style={{
              background: '#fef2f2',
              border: '1px solid #fca5a5',
            }}
          >
            <p
              className="font-semibold mb-1"
              style={{ color: '#dc2626' }}
            >
              Couldn&apos;t import this recipe
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: '#7f1d1d' }}
            >
              {errorMessages[state.reason]}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setState({ stage: 'input' })}
              className="w-full py-4 font-semibold rounded-xl border-2"
              style={{
                borderColor: 'var(--accent)',
                color: 'var(--accent)',
              }}
            >
              Try a different URL
            </button>
            <Link
              href="/recipes/new/manual"
              className="block w-full py-4 font-semibold rounded-xl border text-center"
              style={{ borderColor: 'var(--border)' }}
            >
              Enter manually instead
            </Link>
          </div>
        </div>
      )}

      {/* Review stage */}
      {state.stage === 'review' && (
        <div className="flex flex-col gap-6">
          <div
            className="flex items-start gap-3 p-4 rounded-2xl"
            style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
            }}
          >
            <span className="text-xl">✓</span>
            <div>
              <p
                className="font-semibold"
                style={{ color: '#15803d' }}
              >
                Recipe imported!
              </p>
              <p className="text-sm" style={{ color: '#166534' }}>
                Review the details below and make any changes before
                saving.
              </p>
            </div>
          </div>

          <RecipeForm
            initialData={state.data}
            initialTags={state.tags}
          />
        </div>
      )}
    </div>
  );
}
