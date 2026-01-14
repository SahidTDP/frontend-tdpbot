import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { ImageLightbox } from './image-lightbox';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isRight = message.sender_type !== 'user';
  const [open, setOpen] = useState(false);
  const mediaCandidates = useMemo(() => {
    let rawObj: any = message.raw;
    if (rawObj && typeof rawObj === 'string') {
      try {
        rawObj = JSON.parse(rawObj);
      } catch {
        rawObj = null;
      }
    }
    if (!rawObj && message.meta?.raw) {
      const metaRaw = message.meta.raw;
      if (typeof metaRaw === 'string') {
        try {
          rawObj = JSON.parse(metaRaw);
        } catch {
          rawObj = null;
        }
      } else {
        rawObj = metaRaw;
      }
    }
    const c1 = message.media_url || null;
    let storageUrl = rawObj?.media?.storage_url || rawObj?.storage_url || null;
    if (!storageUrl && rawObj?.raw) {
      let inner = rawObj.raw;
      if (inner && typeof inner === 'string') {
        try {
          inner = JSON.parse(inner);
        } catch {
          inner = null;
        }
      }
      if (inner) {
        storageUrl = inner.media?.storage_url || inner.storage_url || null;
      }
    }
    const c2 = storageUrl;
    const c3 = rawObj?.messages?.[0]?.image?.url || null;
    const sanitize = (u?: string | null) => {
      if (typeof u !== 'string') return '';
      let s = u;
      if (s.includes('`')) {
        console.log('[Bubble] sanitize: removing backticks from URL candidate', { original: s });
      }
      s = s.replace(/['"`]/g, '');
      s = s.trim();
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
    const chosen = sanitize(c1) || sanitize(c2) || sanitize(c3);
    return { c1, c2, c3, chosen, rawObj };
  }, [message.media_url, message.raw]);
  const mediaUrl = mediaCandidates.chosen;
  const hasMedia = !!mediaUrl;
  const isImage = message.message_type === 'image' || hasMedia;
  if (isImage) {
    console.log('[Bubble] Sanitized URL', { id: message.id, chosen: mediaUrl, message_type: message.message_type });
    if (!hasMedia) {
      console.warn('[Bubble] isImage=true pero no se obtuvo mediaUrl', {
        id: message.id,
        c1: mediaCandidates.c1,
        c2: mediaCandidates.c2,
        c3: mediaCandidates.c3,
        raw: mediaCandidates.rawObj,
      });
    }
  } else if (hasMedia) {
    console.warn('[Bubble] Media URL present but not treated as image', {
      id: message.id,
      mediaUrl,
      message_type: message.message_type,
      sender_type: message.sender_type,
    });
  }
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [reachable, setReachable] = useState<'unknown'|'ok'|'fail'>('unknown');
  if (isImage) {
    console.log('[Bubble] Image candidates', {
      id: message.id,
      c1: mediaCandidates.c1,
      c2: mediaCandidates.c2,
      c3: mediaCandidates.c3,
      chosen: mediaCandidates.chosen,
      message_type: message.message_type,
      sender_type: message.sender_type,
    });
    console.log('[Bubble] Image meta/raw', { meta: message.meta, raw: mediaCandidates.rawObj });
  }
  useEffect(() => {
    setLoaded(false);
    setImgError(false);
    setReachable('unknown');
    if (isImage && mediaUrl) {
      fetch(mediaUrl, { method: 'HEAD' })
        .then((res) => {
          const ok = res.ok;
          const ct = res.headers.get('content-type') || '';
          console.log('[Bubble] HEAD check', { id: message.id, mediaUrl, status: res.status, ok, contentType: ct });
          setReachable(ok ? 'ok' : 'fail');
        })
        .catch((err) => {
          console.warn('[Bubble] HEAD error', { id: message.id, mediaUrl, error: String(err) });
          setReachable('fail');
        });
    }
  }, [isImage, mediaUrl, message.id]);
  if (isImage && (!mediaUrl || imgError)) {
    console.warn('[Bubble] Will show fallback \"Imagen no disponible\"', {
      id: message.id,
      mediaUrl,
      hasMedia,
      imgError,
      reachable,
      message_type: message.message_type,
      sender_type: message.sender_type,
    });
  }

  return (
    <div className={cn(
      "flex w-full mb-4",
      isRight ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[70%] rounded-lg px-3 py-2 text-sm",
        isRight 
          ? "bg-primary text-primary-foreground rounded-tr-none" 
          : "bg-muted text-foreground rounded-tl-none"
      )}>
        {isImage ? (
          <div className="flex flex-col gap-2">
            {mediaUrl && !imgError ? (
              <>
                <button
                  className="rounded-lg overflow-hidden bg-black/5"
                  onClick={() => setOpen(true)}
                  aria-label="Ver imagen"
                >
                  {!imgError ? (
                    <Image
                      src={mediaUrl}
                      alt="Imagen"
                      width={220}
                      height={220}
                      className="rounded-md object-cover w-[220px] h-auto"
                      sizes="(max-width: 768px) 220px, 220px"
                      onLoad={() => {
                        console.log('[Bubble] Image loaded (next/image)', { id: message.id, mediaUrl });
                        setLoaded(true);
                      }}
                      onError={() => {
                        console.warn('[Bubble] Image failed to load (next/image)', { id: message.id, mediaUrl });
                        setImgError(true);
                      }}
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt="Imagen"
                      width={220}
                      height={220}
                      style={{ borderRadius: 8, objectFit: 'cover', width: 220, height: 'auto' }}
                      onLoad={() => {
                        console.log('[Bubble] Image loaded (img)', { id: message.id, mediaUrl });
                        setLoaded(true);
                      }}
                      onError={() => console.warn('[Bubble] Image failed to load (img)', { id: message.id, mediaUrl })}
                    />
                  )}
                </button>
                <div className="text-[10px] opacity-70">
                  {loaded ? 'Imagen cargada' : reachable === 'fail' ? 'Imagen no disponible' : 'Cargando…'}
                </div>
                {message.text ? (
                  <p className="whitespace-pre-wrap break-words">{message.text}</p>
                ) : null}
                <ImageLightbox src={mediaUrl} alt="Imagen" open={open} onClose={() => setOpen(false)} />
              </>
            ) : (
              <p className="italic opacity-80">Imagen no disponible</p>
            )}
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        )}
        <div className={cn(
          "text-[10px] mt-1 text-right opacity-70",
        )}>
          {format(new Date(message.created_at), 'HH:mm')}
        </div>
      </div>
    </div>
  );
}
