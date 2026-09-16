# Signature scans

Dropped onto the signature rules of generated certificates
(`src/lib/pdf/certificate.ts`). Register one by adding `signature` to the
matching entry in `certificateSignatories` in `src/lib/site.ts`:

```ts
{ name: "Ira Whitfield", role: "Co-President, Hearts4Hands", signature: "signatures/ira.png" }
```

The path is relative to `public/`. A slot with no `signature` prints an empty
rule, which is still a usable certificate — an unsigned slot never blocks a
download, and neither does a missing or corrupt file.

## What to supply

| | |
|---|---|
| Format | **PNG with a transparent background** |
| Size | **about 1000 x 250 px** |
| Shape | Wider than tall, roughly 4:1. Between 3:1 and 5:1 all look right |
| Ink | Near-black or dark blue. Not pure `#000` — it reads harsh next to the brown |

The slot on the page is 230 x 48pt, so 1000px wide is ~300 DPI when printed.

Anything is scaled down to fit and centred, keeping its aspect ratio — a wrong
shape comes out smaller, never stretched. Images are **never scaled up**, so
something under ~1000px wide will sit smaller than the slot rather than turning
blurry.

Crop tight to the ink, with only a few pixels of margin: the image is centred on
its box, so trapped whitespace pushes the signature off-centre. Remove the paper
background rather than leaving a white rectangle, which would print as a visible
block over the rule.
