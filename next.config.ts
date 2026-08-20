import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content Security Policy.
 *
 * 'unsafe-inline' for scripts is unavoidable here: Next inlines its
 * hydration bootstrap, and the scroll-restoration fix in the layout head
 * has to run before the document finishes loading. It still blocks script
 * from any other origin, which is the injection path that matters for a
 * static site. 'unsafe-eval' is added in development only, where the dev
 * runtime needs it; production never gets it.
 *
 * connect-src stays 'self' because the browser only ever talks to
 * /api/chat and /cat.json. Every GitHub and Groq call is made server-side,
 * so no third-party origin belongs in here.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'" + (isDev ? " ws: http://localhost:*" : ""),
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Production only. Over plain http://localhost this rewrites every
  // subresource request to https://, which the dev server does not answer,
  // so the page loads with no JS, no CSS and no HMR socket. Worth knowing
  // that curl ignores CSP completely, so header tests cannot catch this.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          // frame-ancestors covers modern browsers; this covers the rest.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Nothing here needs any of these.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // The chat endpoint should never be cached by a proxy or the CDN.
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ];
  },
};

export default nextConfig;
