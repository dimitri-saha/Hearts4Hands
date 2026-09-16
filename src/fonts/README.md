# Fonts

TrueType copies of the site's two display faces, embedded into generated PDF
certificates by `src/lib/pdf/certificate.ts`.

They are duplicated here rather than shared with `next/font` on purpose:
`next/font` downloads and caches woff2 at build time for the browser, and
`pdf-lib` cannot read woff2. These are the same families, as TTF.

Both are licensed under the SIL Open Font License 1.1, which permits
redistribution — Baloo 2 and Patrick Hand, from Google Fonts.
