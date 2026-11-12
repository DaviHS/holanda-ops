/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env.js';

/**
 * Cabeçalhos de segurança. A CSP aqui só trava o que não depende de scripts da página
 * (enquadramento, <base>, <object>, destino de formulários); restringir `script-src` exigiria
 * nonce por requisição, por causa dos scripts embutidos do Next e do tema.
 */
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value:
      "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  ...(process.env.NODE_ENV === 'production'
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains',
        },
      ]
    : []),
];

/** @type {import("next").NextConfig} */
const config = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default config;
