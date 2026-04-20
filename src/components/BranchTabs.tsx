'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  isDefault: boolean;
}

interface Props {
  recipeId: string;
  branches: Branch[];
  activeBranchId: string;
  currentVersionId: string;
}

const MAX_BRANCHES = 5;

export default function BranchTabs({
  recipeId,
  branches,
  activeBranchId,
  currentVersionId,
}: Props) {
  const router = useRouter();

  // New branch state
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  // Rename state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renaming, setRenaming] = useState(false);

  const atLimit = branches.length >= MAX_BRANCHES;

  function branchHref(branch: Branch) {
    if (branch.isDefault) return `/recipes/${recipeId}`;
    return `/recipes/${recipeId}?branch=${branch.id}`;
  }

  function startRename(branch: Branch, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setRenamingId(branch.id);
    setRenameValue(branch.name);
  }

  async function saveRename(branchId: string) {
    if (!renameValue.trim() || renaming) return;
    setRenaming(true);
    const res = await fetch(`/api/recipes/${recipeId}/branches/${branchId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: renameValue.trim() }),
    });
    if (res.ok) {
      setRenamingId(null);
      router.refresh();
    }
    setRenaming(false);
  }

  function cancelRename() {
    setRenamingId(null);
    setRenameValue('');
  }

  async function createBranch() {
    if (!newName.trim() || creating) return;
    setCreating(true);
    const res = await fetch(`/api/recipes/${recipeId}/branches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName.trim(),
        createdFromVersionId: currentVersionId,
      }),
    });
    if (res.ok) {
      const branch = await res.json();
      setNewName('');
      setShowInput(false);
      router.push(`/recipes/${recipeId}?branch=${branch.id}`);
      router.refresh();
    }
    setCreating(false);
  }

  const showBar = branches.length > 1 || showInput || !atLimit;
  if (!showBar) return null;

  return (
    <div className='px-[150px]'>
      {/* Tab row */}
      <div
        className='flex items-end gap-0'
        style={{ borderBottom: '2px solid var(--border)' }}
      >
        {branches.map((branch) => {
          const isActive = branch.id === activeBranchId;
          const isRenaming = renamingId === branch.id;

          return (
            <div
              key={branch.id}
              style={{
                borderTop: '1.5px solid var(--border)',
                borderLeft: '1.5px solid var(--border)',
                borderRight: '1.5px solid var(--border)',
                borderBottom: isActive ? '2px solid var(--background)' : '1.5px solid var(--border)',
                borderRadius: '10px 10px 0 0',
                background: isActive ? 'var(--card)' : 'var(--background)',
                marginBottom: isActive ? '-2px' : '4px',
                marginTop: isActive ? '0px' : '4px',
                marginRight: '-1px',
                position: 'relative',
                zIndex: isActive ? 2 : 0,
              }}
            >
              {isRenaming ? (
                /* Inline rename input */
                <div className='flex items-center gap-1 px-2 py-1.5'>
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRename(branch.id);
                      if (e.key === 'Escape') cancelRename();
                    }}
                    onBlur={() => saveRename(branch.id)}
                    className='w-32 px-2 py-1 text-sm font-semibold rounded-lg border-2 outline-none focus:border-[var(--accent)] bg-[var(--background)]'
                    style={{ borderColor: 'var(--accent)', color: 'var(--foreground)' }}
                  />
                  <button
                    onMouseDown={(e) => { e.preventDefault(); cancelRename(); }}
                    className='text-xs px-1.5 py-1 rounded'
                    style={{ color: 'var(--muted)' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                /* Normal tab — link + pencil on active */
                <div className='flex items-center'>
                  <a
                    href={branchHref(branch)}
                    className='px-4 py-2.5 text-sm font-semibold whitespace-nowrap select-none'
                    style={{
                      color: isActive ? 'var(--foreground)' : 'var(--muted)',
                      cursor: 'pointer',
                      transition: 'color 150ms ease',
                    }}
                  >
                    {branch.name}
                  </a>
                  {isActive && (
                    <button
                      onClick={(e) => startRename(branch, e)}
                      className='flex items-center justify-center mr-2 w-6 h-6 rounded-md transition-colors hover:bg-[var(--border)]'
                      style={{ color: 'var(--muted)' }}
                      title='Rename variation'
                    >
                      <Pencil size={11} strokeWidth={2} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* New branch tab */}
        {!atLimit && !showInput && (
          <button
            onClick={() => setShowInput(true)}
            className='flex items-center gap-1 px-3 py-2.5 text-sm font-medium whitespace-nowrap'
            style={{
              borderTop: '1.5px solid var(--border)',
              borderLeft: '1.5px solid var(--border)',
              borderRight: '1.5px solid var(--border)',
              borderBottom: '1.5px solid var(--border)',
              borderRadius: '10px 10px 0 0',
              background: 'var(--background)',
              color: 'var(--muted)',
              marginBottom: '4px',
              marginTop: '4px',
              marginLeft: '4px',
              cursor: 'pointer',
            }}
            title='New variation'
          >
            <Plus size={13} strokeWidth={2.5} />
            Variation
          </button>
        )}

        {atLimit && (
          <span
            className='px-3 py-2.5 text-xs mb-1 ml-2'
            style={{ color: 'var(--muted)' }}
            title={`Max ${MAX_BRANCHES} variations`}
          >
            {MAX_BRANCHES}/{MAX_BRANCHES}
          </span>
        )}
      </div>

      {/* Inline new branch input */}
      {showInput && (
        <div
          className='flex gap-2 p-4 border-x border-b rounded-b-xl'
          style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
        >
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') createBranch();
              if (e.key === 'Escape') { setShowInput(false); setNewName(''); }
            }}
            placeholder='Variation name (e.g. Vegetarian, Lactose-Free…)'
            className='flex-1 px-4 py-2.5 rounded-xl border-2 text-sm outline-none focus:border-[var(--accent)] transition-colors bg-[var(--background)]'
            style={{ borderColor: 'var(--border)' }}
          />
          <button
            onClick={createBranch}
            disabled={creating || !newName.trim()}
            className='px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-opacity'
            style={{ background: 'var(--accent)' }}
          >
            {creating ? 'Creating…' : 'Create'}
          </button>
          <button
            onClick={() => { setShowInput(false); setNewName(''); }}
            className='px-4 py-2.5 rounded-xl text-sm font-medium'
            style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
