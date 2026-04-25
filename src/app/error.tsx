'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-8 text-center">
      <div className="text-6xl">⚠️</div>
      <div>
        <p className="text-2xl font-bold mb-2">Something went wrong</p>
        <p style={{ color: 'var(--muted)' }}>
          Make sure the app server is reachable and try again.
        </p>
      </div>
      <button
        onClick={reset}
        className="px-6 py-3 text-white font-semibold rounded-xl"
        style={{ background: 'var(--accent)' }}
      >
        Try again
      </button>
    </div>
  );
}
