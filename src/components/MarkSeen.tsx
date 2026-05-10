'use client';

import { useEffect } from 'react';

export default function MarkSeen({ recipeId, isNew }: { recipeId: string; isNew: boolean }) {
  useEffect(() => {
    if (!isNew) return;
    fetch(`/api/recipes/${recipeId}/seen`, { method: 'PATCH' });
  }, [recipeId, isNew]);

  return null;
}
