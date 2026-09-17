import { chromium } from "playwright";
import { BASE, admin, makeUser, signIn, cleanup } from "./qa-lib.mjs";
const u = await makeUser("redir", { fullName: "QA Redirect" });
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
await signIn(p, u.email);

for (const target of ["https://example.com/pwned", "//example.com/pwned", "/\\\\example.com", "https:/example.com", "/account/hours"]) {
  await p.goto(`${BASE}/login?next=${encodeURIComponent(target)}`, { waitUntil: "domcontentloaded" })
    .catch(() => {});
  await p.waitForTimeout(1200);
  const landed = p.url();
  const external = !landed.startsWith(BASE);
  console.log(`  next=${target.padEnd(28)} -> ${landed.slice(0, 60).padEnd(62)} ${external ? "*** LEFT THE SITE ***" : "stayed"}`);
}
await b.close();
console.log("  cleanup:", JSON.stringify(await cleanup()));
