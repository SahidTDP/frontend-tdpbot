'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('id,name,is_active');
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function getAgentName(agents: Array<{ id: string; name: string }>, id?: string | null) {
  if (!id) return undefined;
  const found = agents.find((a) => String(a.id) === String(id));
  return found?.name;
}

