/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['ik.imagekit.io', 'firebasestorage.googleapis.com'],
    formats: ['image/webp', 'image/avif'],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production'
    // Minimal secure defaults with Firebase allowances
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
      isProd
        ? { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }
        : null,
      {
        key: 'Content-Security-Policy',
        value: (() => {
          const base = [
            "default-src 'self'",
            // allow Firebase/Google scripts and Vercel analytics in dev
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://apis.google.com https://www.google.com https://accounts.google.com https://va.vercel-scripts.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https://ik.imagekit.io https://firebasestorage.googleapis.com https://lh3.googleusercontent.com https://*.googleusercontent.com",
            [
              "connect-src 'self'",
              ...(isProd ? [] : ['http:', 'ws:', 'wss:']),
              'https://firebasestorage.googleapis.com',
              'https://www.googleapis.com',
              'https://securetoken.googleapis.com',
              'https://identitytoolkit.googleapis.com',
              'https://firebaseinstallations.googleapis.com',
              'https://*.googleapis.com',
              'https://*.firebaseapp.com',
              'https://va.vercel-scripts.com',
              'https://accounts.google.com',
            ].join(' '),
            // allow firebase/google frames (popup/iframe auth)
            "frame-src 'self' https://*.firebaseapp.com https://www.google.com https://www.gstatic.com https://accounts.google.com",
            "child-src 'self' https://*.firebaseapp.com https://www.google.com https://www.gstatic.com https://accounts.google.com",
            "font-src 'self' data:",
            "object-src 'none'",
            "base-uri 'self'",
            "frame-ancestors 'none'",
          ]
          return base.join('; ')
        })(),
      },
      // Loosen COOP/COEP in development to support Firebase popup auth
      !isProd ? { key: 'Cross-Origin-Opener-Policy', value: 'unsafe-none' } : { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      !isProd ? { key: 'Cross-Origin-Embedder-Policy', value: 'unsafe-none' } : null,
    ].filter(Boolean)
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
