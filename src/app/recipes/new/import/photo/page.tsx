'use client';

import { useRef, useState } from 'react';
import RecipeForm from '@/components/RecipeForm';
import BackButton from '@/components/BackButton';
import { RecipeData } from '@/lib/types';
import { Camera, ImagePlus, X } from 'lucide-react';

type ImageEntry = { base64: string; mediaType: string; objectUrl: string };

type State =
  | { stage: 'pick' }
  | { stage: 'selected'; images: ImageEntry[] }
  | { stage: 'loading' }
  | { stage: 'review'; data: RecipeData; tags: string[] }
  | { stage: 'error'; reason: string };

const MAX_IMAGES = 3;

const errorMessages: Record<string, string> = {
  parse_error: "We couldn't read the recipe from those photos. Try clearer, well-lit shots with all the text visible.",
  no_recipe_found: "These photos don't seem to contain a recipe. Make sure the recipe text is visible and try again.",
  api_error: 'Something went wrong talking to the AI. Please try again.',
  unsupported_type: 'Unsupported image format. Please use JPEG, PNG, or WebP photos.',
  file_too_large: 'One of the images is too large after compression. Try a lower resolution photo.',
  too_many_images: `Maximum ${MAX_IMAGES} photos at a time.`,
  unknown: 'Something went wrong. Please try again.',
};

function compressImage(file: File): Promise<ImageEntry> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const MAX = 2048;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      resolve({ base64: dataUrl.split(',')[1], mediaType: 'image/jpeg', objectUrl });
    };
    img.src = objectUrl;
  });
}

export default function PhotoImportPage() {
  const [state, setState] = useState<State>({ stage: 'pick' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const images = state.stage === 'selected' ? state.images : [];
  const canAddMore = images.length < MAX_IMAGES;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const current = state.stage === 'selected' ? state.images : [];
    const slots = MAX_IMAGES - current.length;
    const toAdd = Array.from(files).slice(0, slots);
    const compressed = await Promise.all(toAdd.map(compressImage));
    setState({ stage: 'selected', images: [...current, ...compressed] });
  }

  function removeImage(index: number) {
    if (state.stage !== 'selected') return;
    const updated = state.images.filter((_, i) => i !== index);
    URL.revokeObjectURL(state.images[index].objectUrl);
    if (updated.length === 0) setState({ stage: 'pick' });
    else setState({ stage: 'selected', images: updated });
  }

  async function handleAnalyze() {
    if (state.stage !== 'selected') return;
    const payload = state.images.map(({ base64, mediaType }) => ({ base64, mediaType }));
    state.images.forEach((img) => URL.revokeObjectURL(img.objectUrl));
    setState({ stage: 'loading' });

    const res = await fetch('/api/import/photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: payload }),
    });

    const json = await res.json();
    if (json.ok) {
      setState({ stage: 'review', data: json.data, tags: json.tags ?? [] });
    } else {
      setState({ stage: 'error', reason: json.reason ?? 'unknown' });
    }
  }

  function reset() {
    if (state.stage === 'selected') state.images.forEach((img) => URL.revokeObjectURL(img.objectUrl));
    setState({ stage: 'pick' });
  }

  const backHref = state.stage === 'pick' ? '/recipes/new' : undefined;

  return (
    <div className="px-[150px] py-8">
      <div className="flex items-center gap-3 mb-8">
        <BackButton href={backHref} onClick={backHref ? undefined : reset} />
        <h1 className="text-2xl font-bold">Import from photo</h1>
      </div>

      {/* Pick stage */}
      {state.stage === 'pick' && (
        <div className="flex flex-col gap-4">
          <p style={{ color: 'var(--muted)' }}>
            Take a photo of a cookbook page, recipe card, or printed recipe. You can add up to {MAX_IMAGES} photos for multi-page recipes.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 transition-colors hover:border-[var(--accent)]"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <Camera size={40} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
              <div className="text-center">
                <p className="font-semibold text-lg">Take a photo</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>Use your camera</p>
              </div>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 transition-colors hover:border-[var(--accent)]"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <ImagePlus size={40} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
              <div className="text-center">
                <p className="font-semibold text-lg">Choose a photo</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>From your library</p>
              </div>
            </button>
          </div>
          <p className="text-sm text-center mt-2" style={{ color: 'var(--muted)' }}>
            Works best with clear, well-lit photos where all the text is readable.
          </p>
        </div>
      )}

      {/* Selected stage — thumbnail grid */}
      {state.stage === 'selected' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-3">
            {state.images.map((img, i) => (
              <div key={i} className="relative rounded-2xl overflow-hidden aspect-[3/4]" style={{ border: '1px solid var(--border)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.objectUrl} alt={`Page ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full text-white"
                  style={{ background: 'rgba(0,0,0,0.55)' }}
                  aria-label="Remove photo"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
                <span
                  className="absolute bottom-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                  style={{ background: 'rgba(0,0,0,0.45)' }}
                >
                  Page {i + 1}
                </span>
              </div>
            ))}

            {/* Add more slot */}
            {canAddMore && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed aspect-[3/4] transition-colors hover:border-[var(--accent)]"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                <ImagePlus size={24} strokeWidth={1.5} />
                <span className="text-sm font-medium">Add page</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleAnalyze}
              className="w-full py-4 text-lg text-white font-semibold rounded-xl transition-opacity active:opacity-80"
              style={{ background: 'var(--accent)' }}
            >
              Extract Recipe{state.images.length > 1 ? ` from ${state.images.length} photos` : ''}
            </button>
            <button
              onClick={reset}
              className="w-full py-4 font-semibold rounded-xl border"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            >
              Start over
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
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>This usually takes 10–20 seconds</p>
          </div>
        </div>
      )}

      {/* Error stage */}
      {state.stage === 'error' && (
        <div className="flex flex-col gap-6">
          <div className="p-5 rounded-2xl" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
            <p className="font-semibold mb-1" style={{ color: '#dc2626' }}>Couldn&apos;t read this recipe</p>
            <p className="text-sm leading-relaxed" style={{ color: '#7f1d1d' }}>
              {errorMessages[state.reason] ?? errorMessages.unknown}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={reset}
              className="w-full py-4 font-semibold rounded-xl border-2"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
            >
              Try different photos
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
          <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
            <span className="text-xl">✓</span>
            <div>
              <p className="font-semibold" style={{ color: '#15803d' }}>Recipe extracted!</p>
              <p className="text-sm" style={{ color: '#166534' }}>Review the details below and make any changes before saving.</p>
            </div>
          </div>
          <RecipeForm initialData={state.data} initialTags={state.tags} />
        </div>
      )}

      {/* Hidden inputs */}
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="sr-only"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
    </div>
  );
}
