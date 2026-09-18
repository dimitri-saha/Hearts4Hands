import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { BASE, admin, cleanup, qaEmail } from "./qa-lib.mjs";

const email = qaEmail("invitee");
const { data: old } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
for (const u of old.users.filter((u) => u.email === email)) await admin.auth.admin.deleteUser(u.id);

// Same call the admin panel makes, minus the email: generateLink returns the
// token Supabase would have put in the invitation.
const { data, error } = await admin.auth.admin.generateLink({ type: "invite", email });
if (error) throw error;
await admin.from("admins").insert({ user_id: data.user.id, email, role: "editor" });

// Build the link exactly as the template does, with SiteURL = localhost.
const tpl = readFileSync("supabase/email-templates/invite-user.html", "utf8");
const href = tpl.match(/href="(\{\{ \.SiteURL \}\}\/auth\/confirm[^"]+)"/)[1]
  .replace("{{ .SiteURL }}", BASE)
  .replace("{{ .TokenHash }}", data.properties.hashed_token);
console.log("  link in email:", href.replace(data.properties.hashed_token, "<token>"));

const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
await p.goto(href, { waitUntil: "networkidle" });
console.log("  landed on    :", p.url().replace(BASE, ""));
const h1 = await p.locator("h1").innerText();
console.log("  heading      :", h1);

await p.fill("#password", "Invitee-Pass-4471");
await p.fill("#confirm", "Invitee-Pass-4471");
await p.getByRole("button", { name: /save|set|change|password/i }).click();
await p.waitForTimeout(3000);
const done = await p.locator("body").innerText();
console.log("  password set :", /Password changed/i.test(done));
const next = await p.getByRole("link", { name: /admin area|your account/i }).getAttribute("href");
console.log("  next link    :", next);

// fresh browser: can they now sign in to the admin with that password?
const p2 = await (await b.newContext()).newPage();
await p2.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await p2.fill("#email", email);
await p2.fill("#password", "Invitee-Pass-4471");
await p2.getByRole("button", { name: /sign in/i }).click();
await p2.waitForTimeout(3000);
console.log("  admin sign-in:", p2.url().replace(BASE, ""), "(editor → stories expected)");

// replaying the same link must fail — tokens are one-time
const p3 = await (await b.newContext()).newPage();
await p3.goto(href, { waitUntil: "networkidle" });
console.log("  replayed link:", p3.url().replace(BASE, ""), "(login?error=link expected)");

await b.close();
console.log("  cleanup:", JSON.stringify(await cleanup()));
