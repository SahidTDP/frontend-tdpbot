export function getFunctionUrl(name: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (!base) return null;
  const functionsBase = base.replace('.supabase.co', '.functions.supabase.co');
  return `${functionsBase}/${name}`;
}

export async function postAgentMessage(chatId: string, text: string) {
  const url = getFunctionUrl('send-agent-message');
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL no configurada');
  console.log('[EdgeFunction] send-agent-message ->', { url, chatId, text });
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
      'apikey': `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
    },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  console.log('[EdgeFunction] send-agent-message status', res.status);
  if (!res.ok) {
    const tx = await res.text();
    throw new Error(tx || 'Edge Function error');
  }
}
