'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import type { Message, Conversation } from '@/types';
import { useActiveChat } from './active-chat-context';

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const idToChatIdRef = useRef<Map<string, string>>(new Map());
  const { activeChatId, activeConversationId } = useActiveChat();

  useEffect(() => {
    // Prime conversation id -> chat_id map
    (async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, chat_id');
      if (error) {
        console.error('[Realtime] Failed to prime conversation map:', error);
        return;
      }
      const map = new Map<string, string>();
      for (const c of data || []) {
        map.set(String(c.id), String(c.chat_id));
      }
      idToChatIdRef.current = map;
      console.log('[Realtime] Primed conversation map entries:', map.size);
    })();

    const channelMessages = supabase
      .channel('realtime-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'chatbot', table: 'messages' },
        async (payload) => {
          const newMsg = payload.new as any;
          const convId = newMsg?.conversation_id as string | undefined;
          console.log('[Realtime] messages INSERT payload:', {
            id: newMsg?.id,
            conversation_id: convId,
            sender_type: newMsg?.sender_type,
            text: newMsg?.text,
            message_type: newMsg?.message_type,
            media_url: newMsg?.media_url,
            raw_media_storage_url: newMsg?.raw?.media?.storage_url,
            raw_image_url: newMsg?.raw?.messages?.[0]?.image?.url,
          });
          if (!convId) {
            console.warn('[Realtime] Missing conversation_id on message payload');
            return;
          }
          if (!activeConversationId || convId !== activeConversationId) {
            try {
              let chatId = idToChatIdRef.current.get(convId);
              if (!chatId) {
                const { data: conv, error } = await supabase
                  .from('conversations')
                  .select('id, chat_id')
                  .eq('id', convId)
                  .single();
                if (error) {
                  queryClient.invalidateQueries({ queryKey: ['conversations'] });
                  return;
                }
                chatId = String(conv.chat_id);
                idToChatIdRef.current.set(String(conv.id), chatId);
              }
              queryClient.setQueryData(['conversations'], (old: Conversation[] | undefined) => {
                if (!old) return old;
                const incUnread = newMsg.sender_type !== 'agent';
                let rawObj = newMsg.meta?.raw ?? newMsg.raw;
                if (rawObj && typeof rawObj === 'string') {
                  try { rawObj = JSON.parse(rawObj); } catch { rawObj = null; }
                }
                const sanitize = (u?: string) => {
                  if (typeof u !== 'string') return '';
                  let s = u.trim();
                  s = s.replace(/['"`]/g, '');
                  s = s.replace(/\\+/g, '');
                  const m = s.match(/https?:\/\/[^\s]+?\.(jpg|jpeg|png|webp)/i);
                  if (m && m[0]) return m[0];
                  const exts = ['.jpg', '.jpeg', '.png', '.webp'];
                  for (const ext of exts) {
                    const idx = s.toLowerCase().lastIndexOf(ext);
                    if (idx !== -1) {
                      s = s.slice(0, idx + ext.length);
                      break;
                    }
                  }
                  s = s.replace(/\/+$/g, '');
                  return s;
                };
                const previewMedia = sanitize(newMsg.media_url) || sanitize(rawObj?.media?.storage_url) || sanitize(rawObj?.messages?.[0]?.image?.url);
                console.log('[Realtime] preview selection (inactive)', {
                  id: newMsg?.id,
                  text: newMsg?.text,
                  previewMedia,
                  used: newMsg?.text && newMsg?.text.length > 0 ? 'text' : (previewMedia ? 'media' : 'empty'),
                  incUnread
                });
                const updated = old.map((c) =>
                  String(c.chat_id) === String(chatId)
                    ? ({
                        ...c,
                        last_message_at: newMsg.created_at,
                        preview_message: newMsg.text && newMsg.text.length > 0
                          ? newMsg.text
                          : (previewMedia ? '📷 Imagen' : ''),
                        unread_count: incUnread ? (((c as any).unread_count || 0) + 1) : (c as any).unread_count,
                      } as any)
                    : c
              );
              return updated.sort(
                (a, b) =>
                  new Date(b.last_message_at).getTime() -
                  new Date(a.last_message_at).getTime()
              );
              });
              queryClient.invalidateQueries({ queryKey: ['conversations'] });
            } catch {
              queryClient.invalidateQueries({ queryKey: ['conversations'] });
            }
            return;
          }
          try {
            let chatId = idToChatIdRef.current.get(convId);
            if (!chatId) {
              const { data: conv, error } = await supabase
                .from('conversations')
                .select('id, chat_id,last_message_at,status,assigned_to,hitl_locked')
                .eq('id', convId)
                .single();
              if (error) {
                console.error('[Realtime] Failed to resolve chat_id from conversation_id:', error);
                // Fall back: invalidate lists to refetch later
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
                return;
              }
              chatId = String(conv.chat_id);
              idToChatIdRef.current.set(String(conv.id), chatId);
              console.log('[Realtime] Cached mapping convId->chat_id:', conv.id, chatId);
            }
            const message: Message = {
              id: newMsg.id,
              conversation_id: convId,
              text: newMsg.text,
              sender_type: newMsg.sender_type,
              direction: newMsg.direction,
              created_at: newMsg.created_at,
              meta: newMsg.meta,
            };
            // Append to messages cache for active chat
            queryClient.setQueryData(['messages', chatId], (old: Message[] | undefined) => {
              if (!old) return [message];
              if (old.some((m) => m.id === message.id)) return old;
              const appended = [...old, message];
              const cleaned = appended.filter((m) => {
                if (m.id?.toString().startsWith('client-')) {
                  if (m.sender_type === 'agent' && m.text === message.text) return false;
                }
                return true;
              });
              return cleaned;
            });
            // Update conversation cache (list and detail)
            queryClient.setQueryData(['conversations'], (old: Conversation[] | undefined) => {
              if (!old) return old;
              let rawObj = newMsg.meta?.raw ?? newMsg.raw;
              if (rawObj && typeof rawObj === 'string') {
                try { rawObj = JSON.parse(rawObj); } catch { rawObj = null; }
              }
              const sanitize = (u?: string) => {
                if (typeof u !== 'string') return '';
                let s = u.trim();
                s = s.replace(/['"`]/g, '');
                s = s.replace(/\\+/g, '');
                const m = s.match(/https?:\/\/[^\s]+?\.(jpg|jpeg|png|webp)/i);
                if (m && m[0]) return m[0];
                const exts = ['.jpg', '.jpeg', '.png', '.webp'];
                for (const ext of exts) {
                  const idx = s.toLowerCase().lastIndexOf(ext);
                  if (idx !== -1) {
                    s = s.slice(0, idx + ext.length);
                    break;
                  }
                }
                s = s.replace(/\/+$/g, '');
                return s;
              };
              const previewMedia = sanitize(newMsg.media_url) || sanitize(rawObj?.media?.storage_url) || sanitize(rawObj?.messages?.[0]?.image?.url);
              console.log('[Realtime] preview selection (active)', {
                id: newMsg?.id,
                text: newMsg?.text,
                previewMedia,
                used: newMsg?.text && newMsg?.text.length > 0 ? 'text' : (previewMedia ? 'media' : 'empty')
              });
              const updated = old.map((c) =>
                String(c.chat_id) === String(chatId)
                  ? ({
                      ...c,
                      last_message_at: message.created_at,
                      preview_message: newMsg.text && newMsg.text.length > 0
                        ? newMsg.text
                        : (previewMedia ? '📷 Imagen' : ''),
                      unread_count: 0
                    } as any)
                  : c
              );
              return updated.sort(
                (a, b) =>
                  new Date(b.last_message_at).getTime() -
                  new Date(a.last_message_at).getTime()
              );
            });
            queryClient.setQueryData(['conversation', chatId], (old: Conversation | undefined) => {
              if (!old) return old;
              return ({ ...old, last_message_at: message.created_at } as any);
            });
            // Mark read in DB for active chat on inbound messages
            if (newMsg.sender_type !== 'agent') {
              try {
                await supabase.rpc('mark_conversation_read', { p_chat_id: chatId, p_agent_id: null });
              } catch (err) {
                console.warn('[Realtime] mark_conversation_read failed', err);
              }
            }
            // Targeted invalidations to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
            queryClient.invalidateQueries({ queryKey: ['conversation', chatId] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
          } catch (e: any) {
            console.error('[Realtime] Error handling messages INSERT:', e);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime messages channel status:', status);
      });

    const channelConversations = supabase
      .channel('realtime-conversations')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversations' },
        (payload) => {
          const updated = payload.new as any;
          const chatId = updated?.chat_id as string | undefined;
          console.log('[Realtime] conversations UPDATE payload:', updated);
          if (updated?.id && chatId) {
            idToChatIdRef.current.set(String(updated.id), String(chatId));
          }
          // Update list ordering and details
          queryClient.setQueryData(['conversations'], (old: Conversation[] | undefined) => {
            if (!old) return old;
            const exists = old.some((c) => String(c.chat_id) === String(chatId));
            const merged = exists
              ? old.map((c) =>
                  String(c.chat_id) === String(chatId)
                    ? { ...c, ...updated }
                    : c
                )
              : [updated, ...old];
            return merged.sort(
              (a, b) =>
                new Date(b.last_message_at).getTime() -
                new Date(a.last_message_at).getTime()
            );
          });
          if (chatId) {
            queryClient.setQueryData(['conversation', chatId], (old: Conversation | undefined) => {
              if (!old) return updated;
              return { ...old, ...updated };
            });
            // Fallback invalidations
            queryClient.invalidateQueries({ queryKey: ['conversation', chatId] });
          }
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe((status) => {
        console.log('Realtime conversations channel status:', status);
      });

    return () => {
      supabase.removeChannel(channelMessages);
      supabase.removeChannel(channelConversations);
    };
  }, [queryClient, activeConversationId]);

  return <>{children}</>;
}
