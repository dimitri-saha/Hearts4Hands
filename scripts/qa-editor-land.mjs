import { chromium } from "playwright";
import { BASE, admin, makeUser, cleanup } from "./qa-lib.mjs";
const u = await makeUser("editor", { fullName: "QA Editor" });
await admin.from("admins").upsert({ user_id: u.id, email: u.email, role: "editor" });
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
await p.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await p.fill("#email", u.email);
await p.fill("#password", "Qa-Sweep-Pass-7731");
await p.getByRole("button", { name: /sign in/i }).click();
for (const ms of [1500, 4000]) {
  await p.waitForTimeout(ms);
  const body = await p.locator("body").innerText();
  console.log(`  after +${ms}ms: url=${p.url().replace(BASE, "")}  shows overview stats: ${/Active in 30 days|Latest activity/.test(body)}  shows stories: ${/Submissions/.test(body)}`);
}
await b.close();
console.log("  cleanup:", JSON.stringify(await cleanup()));
