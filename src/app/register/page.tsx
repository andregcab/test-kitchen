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
    <main className="flex-1 flex items-center justify-center p-6">
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-sm"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">👩‍🍳</div>
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="mt-1" style={{ color: 'var(--muted)' }}>
            Join Test Kitchen
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-4 text-lg rounded-xl border-2 outline-none focus:border-[var(--accent)] transition-colors"
            style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-4 text-lg rounded-xl border-2 outline-none focus:border-[var(--accent)] transition-colors"
            style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
            required
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-4 py-4 text-lg rounded-xl border-2 outline-none focus:border-[var(--accent)] transition-colors"
            style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
            required
          />

          {error && (
            <p className="text-sm text-center" style={{ color: '#dc2626' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-lg font-semibold text-white rounded-xl transition-opacity disabled:opacity-60"
            style={{ background: 'var(--accent)' }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
