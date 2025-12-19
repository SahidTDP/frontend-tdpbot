'use client';

import { useSocketListener } from '@/hooks/use-socket-listener';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useSocketListener();
  return <>{children}</>;
}
