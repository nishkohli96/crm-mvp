import path from 'node:path';
import type { NextConfig } from 'next';

/* Configure Next.js app */
/**
 * Remote API, set API_BASE_URL in .env.local (see .env_sample). When it is unset
 * nothing listens on the placeholder, the calls fail and the sample data is used.
 */
const API_BASE_URL = process.env.API_BASE_URL ?? 'http://127.0.0.1:1';

const nextConfig: NextConfig = {
  /**
   * The browser calls /remote/* on this app and Next forwards it to the API,
   * so the API does not need to allow CORS for this origin.
   */
  async rewrites() {
    return [{ source: '/remote/:path*', destination: `${API_BASE_URL}/:path*` }];
  },
  /* Don't advertise the framework in an `X-Powered-By` response header. */
  poweredByHeader: false,
  /* Hoisted node_modules live in the monorepo root, which is also Turbopack's root. */
  outputFileTracingRoot: path.join(__dirname, '../../'),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.icons8.com'
      },
      /* Dummy food photos used by the sample data */
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      }
    ]
  },
};

export default nextConfig;
