'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      router.push('/recipes');
    } else {
      const json = await res.json();
      setError(json.error ?? 'Something went wrong. Try again.');
      setLoading(false);
    }
  }

  return (
    <main
      className="flex-1 flex items-center justify-center p-6 min-h-screen"
      style={{ background: 'var(--background)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
            style={{ background: 'var(--accent-light)', border: '2px solid var(--border)' }}
          >
            <span style={{ fontSize: 36 }}>🍳</span>
          </div>
          <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.01em' }}>
            Test Kitchen
          </h1>
          <p className="mt-1.5" style={{ color: 'var(--foreground-muted)', fontSize: '16px' }}>
            Create your account
          </p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 20px rgba(44,36,22,0.08)' }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="section-label block mb-2" style={{ color: 'var(--foreground-muted)' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 rounded-xl border-2 text-base outline-none transition-colors"
                style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                required
              />
            </div>
            <div>
              <label className="section-label block mb-2" style={{ color: 'var(--foreground-muted)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 rounded-xl border-2 text-base outline-none transition-colors"
                style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                required
              />
            </div>
            <div>
              <label className="section-label block mb-2" style={{ color: 'var(--foreground-muted)' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 rounded-xl border-2 text-base outline-none transition-colors"
                style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-center py-2 px-3 rounded-xl" style={{ color: 'var(--error)', background: 'var(--card)', border: '1px solid var(--error)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-base font-semibold text-white rounded-xl disabled:opacity-60 mt-2"
              style={{ background: 'var(--accent)' }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--foreground-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
