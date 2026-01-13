'use client';

import Image from 'next/image';
import { useEffect } from 'react';

export function ImageLightbox({
  src,
  alt,
  open,
  onClose,
}: {
  src: string;
  alt?: string;
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      window.addEventListener('keydown', handler);
    }
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute -top-3 -right-3 bg-white/90 text-black rounded-full px-2 py-1 text-xs shadow"
          onClick={onClose}
        >
          Cerrar
        </button>
        <Image
          src={src}
          alt={alt || 'Imagen'}
          width={1200}
          height={800}
          className="rounded-lg object-contain w-auto h-auto max-w-[90vw] max-h-[80vh]"
          priority
        />
      </div>
    </div>
  );
}

