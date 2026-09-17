import { chromium } from "playwright";
import { admin, cleanup, makeUser } from "./qa-lib.mjs";

const read = async (page) => {
  await page.goto("http://localhost:3000/?t=" + Date.now(), { waitUntil: "networkidle" });
  return page.locator("ul li").filter({ hasText: /Raised|Cards|Volunteers|Hours|Hospital/ })
    .evaluateAll((els) => els.map((e) => e.innerText.replace(/\n+/g, " ").trim()).filter(Boolean));
};

const b = await chromium.launch();
const p = await (await b.newContext()).newPage();

console.log("  BEFORE (baseline only):");
for (const t of await read(p)) console.log("   ", t);

const u = await makeUser("stats", { fullName: "QA Stats" });
await admin.from("volunteer_signups").insert({
  full_name: "QA Stats", email: u.email, country: "US", activities: ["cards"],
  hours: 4, cards_made: 11, user_id: u.id, status: "approved",
  reviewed_at: new Date().toISOString(),
});

console.log("\n  AFTER one approved entry (1 person, 4h, 11 cards):");
for (const t of await read(p)) console.log("   ", t);
console.log("    expected: volunteers 58, hours 175, cards 230");

await p.screenshot({ path: process.argv[2], fullPage: false });
await b.close();
console.log("\n  cleanup:", JSON.stringify(await cleanup()));
