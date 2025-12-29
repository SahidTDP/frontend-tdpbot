'use client';

import { createContext, useContext, useState } from 'react';

type ActiveChatState = {
  activeChatId: string | null;
  activeConversationId: string | null;
  setActiveChatId: (id: string | null) => void;
  setActiveConversationId: (id: string | null) => void;
};

const ActiveChatContext = createContext<ActiveChatState | null>(null);

export function ActiveChatProvider({ children }: { children: React.ReactNode }) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  return (
    <ActiveChatContext.Provider
      value={{ activeChatId, activeConversationId, setActiveChatId, setActiveConversationId }}
    >
      {children}
    </ActiveChatContext.Provider>
  );
}

export function useActiveChat() {
  const ctx = useContext(ActiveChatContext);
  if (!ctx) {
    throw new Error('useActiveChat must be used within ActiveChatProvider');
  }
  return ctx;
}

