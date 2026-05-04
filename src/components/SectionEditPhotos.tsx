'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomSheet from './BottomSheet';

const MAX_IMAGES = 3;

interface Props {
  recipeId: string;
  images: string[];
  tags: string[];
}

export default function SectionEditPhotos({ recipeId, images: initialImages, tags }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleOpen() {
    setImages([...initialImages]);
    setOpen(true);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const slots = MAX_IMAGES - images.length;
    const toUpload = files.slice(0, slots);
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of toUpload) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const { url } = await res.json();
        uploaded.push(url);
      }
    }
    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
    e.target.value = '';
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/recipes/${recipeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags, images }),
    });
    setSaving(false);
    if (res.ok) {
      setOpen(false);
      router.refresh();
    }
  }

  const hasImages = initialImages.length > 0;

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
        style={{
          color: 'var(--muted)',
          border: '1px solid var(--border)',
          background: 'var(--card)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        {hasImages ? 'Edit Photos' : 'Add Photos'}
      </button>

      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Photos">
        <div className="flex flex-col gap-5 pb-4">
          <div className="flex flex-wrap gap-3">
            {images.map((src, i) => (
              <div
                key={src}
                className="relative rounded-xl overflow-hidden flex-shrink-0"
                style={{ width: 120, height: 120 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1.5 right-1.5 flex items-center justify-center w-7 h-7 rounded-full text-white text-sm font-bold"
                  style={{ background: 'rgba(0,0,0,0.55)' }}
                  aria-label="Remove photo"
                >
                  ×
                </button>
              </div>
            ))}

            {images.length < MAX_IMAGES && (
              <label
                className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:border-[var(--accent)] flex-shrink-0"
                style={{ width: 120, height: 120, borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                {uploading ? (
                  <span className="text-xs">Uploading…</span>
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="text-xs font-medium">Add Photo</span>
                  </>
                )}
                <input type="file" accept="image/*" multiple className="sr-only" onChange={handleUpload} disabled={uploading} />
              </label>
            )}
          </div>

          <p className="text-sm" style={{ color: 'var(--muted)' }}>Up to {MAX_IMAGES} photos. Tap × to remove.</p>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 py-4 font-semibold rounded-xl border" style={{ borderColor: 'var(--border)' }}>
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={saving || uploading} className="flex-1 py-4 text-white font-semibold rounded-xl disabled:opacity-60" style={{ background: 'var(--accent)' }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
