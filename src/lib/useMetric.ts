'use client';

import { useState, useEffect } from 'react';

export function useMetric() {
  const [metric, setMetric] = useState(false);

  useEffect(() => {
    setMetric(localStorage.getItem('prefer-metric') === 'true');
  }, []);

  function toggle() {
    setMetric((prev) => {
      const next = !prev;
      localStorage.setItem('prefer-metric', String(next));
      return next;
    });
  }

  return { metric, toggle };
}
