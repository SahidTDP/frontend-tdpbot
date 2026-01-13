import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Image from 'next/image';
import { useMemo, useState } from 'react';
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
    const c2 = rawObj?.media?.storage_url || null;
    const c3 = rawObj?.messages?.[0]?.image?.url || null;
    const sanitize = (u?: string | null) =>
      typeof u === 'string'
        ? u.trim().replace(/^`+|`+$/g, '').replace(/\\+$/g, '')
        : '';
    const chosen = sanitize(c1) || sanitize(c2) || sanitize(c3);
    return { c1, c2, c3, chosen, rawObj };
  }, [message.media_url, message.raw]);
  const mediaUrl = mediaCandidates.chosen;
  const isImage = (message.message_type || (mediaUrl ? 'image' : 'text')) === 'image';
  const [imgError, setImgError] = useState(false);
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
                  <Image
                    src={mediaUrl}
                    alt="Imagen"
                    width={220}
                    height={220}
                    className="rounded-md object-cover w-[220px] h-auto"
                    sizes="(max-width: 768px) 220px, 220px"
                    onError={() => {
                      console.warn('[Bubble] Image failed to load', { id: message.id, mediaUrl });
                      setImgError(true);
                    }}
                  />
                </button>
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
