'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type StatusKey = 'open' | 'assigned' | 'closed';

interface InboxFiltersProps {
  counts: { open: number; assigned: number; closed: number; unread: number };
  onChange: (filter: { statuses: StatusKey[]; unreadOnly: boolean }) => void;
}

export function InboxFilters({ counts, onChange }: InboxFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<StatusKey[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const toggleExpanded = () => setExpanded((v) => !v);

  const toggleStatus = (key: StatusKey) => {
    setSelected((prev) => {
      const exists = prev.includes(key);
      const next = exists ? prev.filter((k) => k !== key) : [...prev, key];
      onChange({ statuses: next, unreadOnly });
      return next;
    });
  };

  const toggleUnread = () => {
    setUnreadOnly((prev) => {
      const next = !prev;
      onChange({ statuses: selected, unreadOnly: next });
      return next;
    });
  };

  const hasAnyFilter =
    counts.open + counts.assigned + counts.closed + counts.unread > 0;

  if (!hasAnyFilter) return null;

  return (
    <div className="sticky top-16 z-10 bg-background/80 backdrop-blur border-b">
      <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-medium">Filtros</span>
        <Button variant="outline" size="sm" onClick={toggleExpanded}>
          {expanded ? 'Ocultar' : 'Mostrar'}
        </Button>
      </div>
      {expanded && (
        <div className="px-4 pb-3 grid grid-cols-2 gap-2">
          {counts.unread > 0 && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={toggleUnread}
              />
              <span>Sin leer ({counts.unread})</span>
            </label>
          )}
          {counts.open > 0 && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes('open')}
                onChange={() => toggleStatus('open')}
              />
              <span>Abiertos ({counts.open})</span>
            </label>
          )}
          {counts.assigned > 0 && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes('assigned')}
                onChange={() => toggleStatus('assigned')}
              />
              <span>Asignados ({counts.assigned})</span>
            </label>
          )}
          {counts.closed > 0 && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes('closed')}
                onChange={() => toggleStatus('closed')}
              />
              <span>Cerrados ({counts.closed})</span>
            </label>
          )}
        </div>
      )}
    </div>
  );
}
