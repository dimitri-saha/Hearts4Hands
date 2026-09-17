"use client";

/**
 * Last-resort error boundary.
 *
 * `error.tsx` catches failures inside a page; this catches failures in the root
 * layout itself — the fonts, the grain overlay, `<CrayonDefs />`. Because the
 * layout is what failed, this component has to supply its own `<html>` and
 * `<body>`, and it cannot rely on any of the site's CSS having loaded. Every
 * style here is therefore inline.
 *
 * Without it, a root-layout crash renders Next's default unstyled error page:
 * black text on white, "Application error: a client-side exception has
 * occurred". Not a security problem, but a frightening thing to hand a family
 * who came here from a hospital ward.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fbe8e4",
          padding: "24px",
          fontFamily:
            "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
          color: "#4a342a",
        }}
      >
        <div
          style={{
            maxWidth: 520,
            width: "100%",
            background: "#fffcf8",
            border: "2px solid #4a342a",
            borderRadius: 20,
            padding: "32px 28px",
            textAlign: "center",
          }}
        >
          <img
            src="/logo-print.jpg"
            alt="Hearts4Hands"
            width={96}
            height={94}
            style={{ display: "block", margin: "0 auto 16px", borderRadius: 12 }}
          />
          <h1
            style={{
              margin: "0 0 12px",
              fontSize: 26,
              lineHeight: 1.3,
              color: "#8d2a3d",
              fontFamily: "'Baloo 2', 'Trebuchet MS', Arial, sans-serif",
            }}
          >
            Something went wrong at our end
          </h1>
          <p style={{ margin: "0 0 20px", fontSize: 16, lineHeight: 1.7, color: "#7a5a47" }}>
            That&apos;s our fault, not yours. Try again, and if it keeps happening please email{" "}
            <a href="mailto:hello@hearts4hands.org" style={{ color: "#b03a4e" }}>
              hello@hearts4hands.org
            </a>
            .
          </p>

          <button
            type="button"
            onClick={reset}
            style={{
              border: "2px solid #4a342a",
              background: "#d24a5e",
              color: "#fffcf8",
              borderRadius: 26,
              padding: "12px 28px",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Baloo 2', 'Trebuchet MS', Arial, sans-serif",
            }}
          >
            Try again
          </button>

          <p style={{ margin: "18px 0 0", fontSize: 13 }}>
            <a href="/" style={{ color: "#b03a4e" }}>
              Back to the home page
            </a>
          </p>

          {/* The digest is the only handle support has on which error this was.
              The message itself is deliberately not shown — it can carry stack
              detail we don't want on a stranger's screen. */}
          {error.digest ? (
            <p style={{ margin: "14px 0 0", fontSize: 12, color: "#a78970" }}>
              Reference: {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
