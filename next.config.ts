import type { NextConfig } from "next";

/**
 * Content Security Policy.
 *
 * `'unsafe-inline'` is present for scripts because Next inlines its hydration
 * payload, and the strict alternative (per-request nonces via middleware) would
 * force every page to render dynamically — losing static generation across the
 * whole site for a marketing site with no third-party scripts. Restricting the
 * *sources* still blocks the main risk: an injected `<script src="evil.com">`.
 *
 * Deliberately allowed:
 *   - `va.vercel-scripts.com` / `vitals.vercel-insights.com` — Vercel Web
 *     Analytics and Speed Insights, if either is switched on.
 *   - `*.supabase.co` — signed URLs for volunteer proof photos, which admins
 *     open from the browser.
 */
const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  // 'unsafe-eval' is DEV ONLY. React's development build uses eval() for its
  // debugging tooling and fast refresh; without it the dev overlay reports an
  // error on every page. Production never gets it — that's the directive that
  // stops an injected script from evaluating arbitrary strings.
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ""}https://va.vercel-scripts.com`,
  [
    "connect-src 'self'",
    "https://*.supabase.co",
    "https://va.vercel-scripts.com",
    "https://vitals.vercel-insights.com",
    // Dev only: Turbopack's hot-reload socket. Safari doesn't reliably treat
    // ws:// as covered by 'self'.
    isDev ? "ws://localhost:* http://localhost:*" : "",
  ]
    .filter(Boolean)
    .join(" "),
  // Production only. Safari applies this to localhost too and rewrites
  // http://localhost:3000 to https://, where nothing is listening — so
  // `npm run dev` becomes unreachable in Safari. Chrome exempts localhost,
  // which is why it only shows up in one browser.
  isDev ? "" : "upgrade-insecure-requests",
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  // Stop the browser second-guessing declared content types.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send the origin to other sites, never the full path — story URLs are
  // sensitive enough that a referrer could reveal what somebody was reading.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // No framing at all: nothing here is meant to be embedded, and it kills
  // clickjacking against the admin area.
  { key: "X-Frame-Options", value: "DENY" },
  // We ask for none of these, so turn them off site-wide.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework.
  poweredByHeader: false,

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // The admin area must never be cached by a proxy or archived.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
