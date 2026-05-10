'use client';

import { useState } from 'react';
import { Share2, Check, Loader2, ChefHat } from 'lucide-react';
import BottomSheet from './BottomSheet';

interface User {
  id: string;
  username: string;
  displayName: string | null;
  alreadyShared: boolean;
}

export default function ShareRecipeButton({
  recipeId,
  borderColor,
}: {
  recipeId: string;
  borderColor?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [sharingTo, setSharingTo] = useState<string | null>(null);
  // Tracks shares completed this session — distinct from DB alreadyShared
  const [justSharedIds, setJustSharedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  async function openSheet() {
    setIsOpen(true);
    setError(null);
    setLoadingUsers(true);
    try {
      const res = await fetch(`/api/users?recipeId=${recipeId}`);
      const data = await res.json();
      setUsers(data);
    } catch {
      setError('Could not load users.');
    } finally {
      setLoadingUsers(false);
    }
  }

  async function shareWith(userId: string) {
    setSharingTo(userId);
    setError(null);
    try {
      const res = await fetch(`/api/recipes/${recipeId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: userId }),
      });
      if (!res.ok) throw new Error('Share failed');
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, alreadyShared: true } : u)),
      );
      setJustSharedIds((prev) => new Set(prev).add(userId));
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setSharingTo(null);
    }
  }

  const previouslySharedCount = users.filter(
    (u) => u.alreadyShared && !justSharedIds.has(u.id),
  ).length;

  return (
    <>
      <button
        onClick={openSheet}
        className="menu-picker-btn flex items-center justify-center rounded-xl"
        style={{
          width: 40,
          height: 40,
          border: `1px solid ${borderColor ?? 'var(--border)'}`,
          color: 'var(--foreground)',
        }}
        aria-label="Share recipe"
      >
        <Share2 size={17} strokeWidth={1.75} />
      </button>

      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} title="Share Recipe">
        {loadingUsers && (
          <div className="flex items-center justify-center py-12">
            <Loader2
              size={24}
              strokeWidth={1.5}
              className="animate-spin"
              style={{ color: 'var(--foreground-muted)' }}
            />
          </div>
        )}

        {!loadingUsers && users.length === 0 && (
          <p style={{ color: 'var(--foreground-muted)', fontSize: '15px' }}>
            No other users to share with yet.
          </p>
        )}

        {!loadingUsers && users.length > 0 && (
          <>
            {previouslySharedCount > 0 && (
              <p className="mb-4" style={{ fontSize: '13px', color: 'var(--foreground-muted)' }}>
                Already in {previouslySharedCount === 1 ? 'their' : `${previouslySharedCount} kitchens`}.
              </p>
            )}
            <ul className="flex flex-col gap-2">
              {users.map((user) => {
                const name = user.displayName || user.username;
                const isSharing = sharingTo === user.id;
                const justSent = justSharedIds.has(user.id);
                const wasAlready = user.alreadyShared && !justSent;
                const isDone = user.alreadyShared;

                return (
                  <li key={user.id}>
                    <button
                      onClick={() => !isDone && !isSharing && shareWith(user.id)}
                      disabled={isSharing || isDone}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl"
                      style={{
                        background: 'var(--surface)',
                        border: `1px solid ${isDone ? 'var(--accent)' : 'var(--border)'}`,
                        opacity: isSharing ? 0.7 : wasAlready ? 0.6 : 1,
                        cursor: isDone ? 'default' : 'pointer',
                      }}
                    >
                      <div className="text-left">
                        <span className="font-medium" style={{ fontSize: '16px' }}>
                          {name}
                        </span>
                        {justSent && (
                          <p style={{ fontSize: '12px', color: 'var(--accent)', marginTop: 1 }}>
                            In their kitchen!
                          </p>
                        )}
                        {wasAlready && (
                          <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginTop: 1 }}>
                            Already shared
                          </p>
                        )}
                      </div>
                      <span style={{ color: isDone ? 'var(--accent)' : 'var(--foreground-muted)' }}>
                        {isSharing && <Loader2 size={18} strokeWidth={1.5} className="animate-spin" />}
                        {!isSharing && justSent && <ChefHat size={17} strokeWidth={1.75} />}
                        {!isSharing && wasAlready && <Check size={18} strokeWidth={2} />}
                        {!isSharing && !isDone && <Share2 size={17} strokeWidth={1.5} />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {error && (
          <p className="mt-4" style={{ color: '#c04a12', fontSize: '14px' }}>
            {error}
          </p>
        )}
      </BottomSheet>
    </>
  );
}
