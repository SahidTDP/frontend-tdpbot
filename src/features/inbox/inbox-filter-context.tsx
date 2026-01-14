'use client';

import { createContext, useContext, useState } from 'react';

type StatusKey = 'open' | 'assigned' | 'closed';

type InboxFilterState = {
  statuses: StatusKey[];
  unreadOnly: boolean;
  setStatuses: (s: StatusKey[]) => void;
  setUnreadOnly: (v: boolean) => void;
};

const InboxFilterContext = createContext<InboxFilterState | null>(null);

export function InboxFilterProvider({ children }: { children: React.ReactNode }) {
  const [statuses, setStatuses] = useState<StatusKey[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  return (
    <InboxFilterContext.Provider value={{ statuses, unreadOnly, setStatuses, setUnreadOnly }}>
      {children}
    </InboxFilterContext.Provider>
  );
}

export function useInboxFilters() {
  const ctx = useContext(InboxFilterContext);
  if (!ctx) throw new Error('useInboxFilters must be used within InboxFilterProvider');
  return ctx;
}

