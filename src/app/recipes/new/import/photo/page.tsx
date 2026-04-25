'use client';

import { useRef, useState } from 'react';
import RecipeForm from '@/components/RecipeForm';
import BackButton from '@/components/BackButton';
import { RecipeData } from '@/lib/types';
import { Camera, ImagePlus } from 'lucide-react';

type State =
  | { stage: 'pick' }
  | { stage: 'preview'; base64: string; mediaType: string; objectUrl: string }
  | { stage: 'loading' }
  | { stage: 'review'; data: RecipeData; tags: string[] }
  | { stage: 'error'; reason: string };

const errorMessages: Record<string, string> = {
  parse_error: "We couldn't read the recipe from that photo. Try a clearer, well-lit shot with the full recipe visible.",
  no_recipe_found: "This photo doesn't seem to contain a recipe. Make sure the recipe text is visible and try again.",
  api_error: 'Something went wrong talking to the AI. Please try again.',
  unsupported_type: 'Unsupported image format. Please use a JPEG, PNG, or WebP photo.',
  file_too_large: 'That image is too large. Try a smaller or more compressed photo.',
  unknown: 'Something went wrong. Please try again.',
};

export default function PhotoImportPage() {
  const [state, setState] = useState<State>({ stage: 'pick' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const mediaType = file.type || 'image/jpeg';
    const objectUrl = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      // Strip the data URL prefix to get raw base64
      const base64 = dataUrl.split(',')[1];
      setState({ stage: 'preview', base64, mediaType, objectUrl });
    };
    reader.readAsDataURL(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  async function handleAnalyze() {
    if (state.stage !== 'preview') return;
    const { base64, mediaType } = state;
    URL.revokeObjectURL(state.objectUrl);
    setState({ stage: 'loading' });

    const res = await fetch('/api/import/photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64, mediaType }),
    });

    const json = await res.json();
    if (json.ok) {
      setState({ stage: 'review', data: json.data, tags: json.tags ?? [] });
    } else {
      setState({ stage: 'error', reason: json.reason ?? 'unknown' });
    }
  }

  const backHref =
    state.stage === 'review' || state.stage === 'error' || state.stage === 'loading'
      ? undefined
      : '/recipes/new';

  function handleBack() {
    if (state.stage === 'preview') URL.revokeObjectURL(state.objectUrl);
    setState({ stage: 'pick' });
  }

  return (
    <div className="px-[150px] py-8">
      <div className="flex items-center gap-3 mb-8">
        <BackButton href={backHref} onClick={backHref ? undefined : handleBack} />
        <h1 className="text-2xl font-bold">Import from photo</h1>
      </div>

      {/* Pick stage */}
      {state.stage === 'pick' && (
        <div className="flex flex-col gap-4">
          <p style={{ color: 'var(--muted)' }}>
            Take a photo of a cookbook page, recipe card, or printed recipe and
            we&apos;ll extract it for you.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-2">
            {/* Camera capture */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 transition-colors hover:border-[var(--accent)]"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <Camera size={40} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
              <div className="text-center">
                <p className="font-semibold text-lg">Take a photo</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
                  Use your camera
                </p>
              </div>
            </button>

            {/* File picker */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 transition-colors hover:border-[var(--accent)]"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <ImagePlus size={40} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
              <div className="text-center">
                <p className="font-semibold text-lg">Choose a photo</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
                  From your library
                </p>
              </div>
            </button>
          </div>

          <p className="text-sm text-center mt-2" style={{ color: 'var(--muted)' }}>
            Works best with clear, well-lit photos where all the text is readable.
          </p>

          {/* Hidden inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={handleInputChange}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleInputChange}
          />
        </div>
      )}

      {/* Preview stage */}
      {state.stage === 'preview' && (
        <div className="flex flex-col gap-6">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={state.objectUrl}
              alt="Recipe photo"
              className="w-full object-contain"
              style={{ maxHeight: 500, background: 'var(--card)' }}
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleAnalyze}
              className="w-full py-4 text-lg text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-opacity active:opacity-80"
              style={{ background: 'var(--accent)' }}
            >
              Extract Recipe
            </button>
            <button
              onClick={() => { URL.revokeObjectURL(state.objectUrl); setState({ stage: 'pick' }); }}
              className="w-full py-4 font-semibold rounded-xl border"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            >
              Use a different photo
            </button>
          </div>
        </div>
      )}

      {/* Loading stage */}
      {state.stage === 'loading' && (
        <div className="flex flex-col items-center justify-center gap-6 py-24">
          <svg className="animate-spin" width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="var(--border)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div className="text-center">
            <p className="text-lg font-semibold">Reading your recipe…</p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              This usually takes 10–20 seconds
            </p>
          </div>
        </div>
      )}

      {/* Error stage */}
      {state.stage === 'error' && (
        <div className="flex flex-col gap-6">
          <div
            className="p-5 rounded-2xl"
            style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}
          >
            <p className="font-semibold mb-1" style={{ color: '#dc2626' }}>
              Couldn&apos;t read this recipe
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#7f1d1d' }}>
              {errorMessages[state.reason] ?? errorMessages.unknown}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setState({ stage: 'pick' })}
              className="w-full py-4 font-semibold rounded-xl border-2"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
            >
              Try a different photo
            </button>
            <a
              href="/recipes/new/manual"
              className="block w-full py-4 font-semibold rounded-xl border text-center"
              style={{ borderColor: 'var(--border)' }}
            >
              Enter manually instead
            </a>
          </div>
        </div>
      )}

      {/* Review stage */}
      {state.stage === 'review' && (
        <div className="flex flex-col gap-6">
          <div
            className="flex items-start gap-3 p-4 rounded-2xl"
            style={{ background: '#f0fdf4', border: '1px solid #86efac' }}
          >
            <span className="text-xl">✓</span>
            <div>
              <p className="font-semibold" style={{ color: '#15803d' }}>
                Recipe extracted!
              </p>
              <p className="text-sm" style={{ color: '#166534' }}>
                Review the details below and make any changes before saving.
              </p>
            </div>
          </div>
          <RecipeForm initialData={state.data} initialTags={state.tags} />
        </div>
      )}
    </div>
  );
}
