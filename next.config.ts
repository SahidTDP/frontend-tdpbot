import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lookaside.fbsbx.com',
        port: '',
        pathname: '/whatsapp_business/attachments/**',
      },
      (() => {
        try {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;
          return url ? {
            protocol: url.protocol.replace(':',''),
            hostname: url.hostname,
            port: '',
            pathname: '/storage/v1/object/public/**',
          } : undefined as any;
        } catch {
          return undefined as any;
        }
      })(),
    ],
  },
};

export default nextConfig;
