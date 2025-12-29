'use client';

import { useEffect, useMemo, useState } from 'react';

export function useRelativeTime(date: string | Date, intervalMs = 60000) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  const value = useMemo(() => {
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat('es-PE', { numeric: 'auto' });
    if (diff < 60) return rtf.format(-Math.floor(diff), 'seconds');
    if (diff < 3600) return rtf.format(-Math.floor(diff / 60), 'minutes');
    if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), 'hours');
    return rtf.format(-Math.floor(diff / 86400), 'days');
  }, [date, tick]);
  return value;
}

