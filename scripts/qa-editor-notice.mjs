import { chromium } from "playwright";
import { BASE, admin, makeUser, signIn, cleanup } from "./qa-lib.mjs";

// Focused regression test for the bug the sweep found: the "that isn't yours"
// notice was rendered inside the no-database fallback branch, so an editor
// redirected to /admin/stories saw a bare page and no reason why.
const editor = await makeUser("editor", { fullName: "QA Editor" });
await admin.from("admins").upsert({ user_id: editor.id, email: editor.email, role: "editor" });

const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
await signIn(p, editor.email);

const rows = [];
for (const route of ["/admin/volunteers", "/admin/certificates", "/admin/team"]) {
  await p.goto(BASE + route, { waitUntil: "networkidle" });
  const text = await p.locator("body").innerText();
  rows.push({
    route,
    landedOn: new URL(p.url()).pathname,
    hasReason: text.includes("That part of the admin isn't yours"),
    saysEditor: /editor.*account/i.test(text),
  });
}
await b.close();
console.log(JSON.stringify(rows, null, 1));
console.log("cleanup:", JSON.stringify(await cleanup()));
