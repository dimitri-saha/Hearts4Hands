import { chromium } from "playwright";
import { BASE, PASSWORD, admin, makeUser, qaEmail, signIn } from "./qa-lib.mjs";

const out = [];
const ok = (n, pass, detail = "") => out.push({ check: n, pass, detail: String(detail).slice(0, 110) });

// The volunteer whose hours we'll approve, plus one owner and one editor.
const vol = await makeUser("vol2", { fullName: "QA Volunteer Two" });
const owner = await makeUser("owner", { fullName: "QA Owner" });
const editor = await makeUser("editor", { fullName: "QA Editor" });
await admin.from("admins").upsert({ user_id: owner.id, email: owner.email, role: "owner" });
await admin.from("admins").upsert({ user_id: editor.id, email: editor.email, role: "editor" });

const { data: entry } = await admin.from("volunteer_signups").insert({
  full_name: "QA Volunteer Two", email: vol.email, country: "United States",
  activities: ["cards"], hours: 6, cards_made: 9, user_id: vol.id,
  proof_path: "qa/none.png", delivery_method: "print_ship",
}).select("id").single();

const browser = await chromium.launch();

async function fresh() {
  const c = await browser.newContext();
  return { c, p: await c.newPage() };
}

try {
  // ---------------------------------------------------------------- owner
  {
    const { c, p } = await fresh();
    await signIn(p, owner.email);
    await p.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
    ok("owner reaches /admin", p.url().endsWith("/admin"), p.url().replace(BASE, ""));

    for (const r of ["/admin/volunteers", "/admin/stories", "/admin/certificates",
                     "/admin/messages", "/admin/stats", "/admin/emails", "/admin/team"]) {
      await p.goto(BASE + r, { waitUntil: "networkidle" });
      ok(`owner reaches ${r}`, new URL(p.url()).pathname === r, p.url().replace(BASE, ""));
    }

    // approve the entry through the real UI
    await p.goto(`${BASE}/admin/volunteers`, { waitUntil: "networkidle" });
    const shows = (await p.locator("body").innerText()).includes("QA Volunteer Two");
    ok("entry appears in review queue", shows);
    const deliveryShown = (await p.locator("body").innerText()).includes("We print & mail it");
    ok("delivery choice shown to reviewer", deliveryShown);

    const approve = p.getByRole("button", { name: /approve/i }).first();
    if (await approve.count()) {
      await approve.click();
      await p.waitForTimeout(3000);
    }
    const { data: after } = await admin.from("volunteer_signups").select("status").eq("id", entry.id).single();
    ok("approve works", after?.status === "approved", after?.status);

    await c.close();
  }

  // ------------------------------------------------------------- editor
  {
    const { c, p } = await fresh();
    await signIn(p, editor.email);

    await p.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
    ok("editor bounced off overview", new URL(p.url()).pathname === "/admin/stories", p.url().replace(BASE, ""));

    await p.goto(`${BASE}/admin/stories`, { waitUntil: "networkidle" });
    ok("editor reaches stories", new URL(p.url()).pathname === "/admin/stories");

    const navText = await p.locator("nav").first().innerText().catch(() => "");
    ok("editor nav hides owner pages", !/Volunteer hours|Certificates|Impact numbers|Admin accounts/.test(navText), navText.replace(/\n/g, " "));

    for (const r of ["/admin/volunteers", "/admin/certificates", "/admin/messages",
                     "/admin/stats", "/admin/emails", "/admin/team"]) {
      await p.goto(BASE + r, { waitUntil: "networkidle" });
      const landed = new URL(p.url()).pathname;
      ok(`editor blocked from ${r}`, landed === "/admin/stories", landed + (p.url().includes("denied") ? " (+notice)" : ""));
    }
    const denied = (await p.locator("body").innerText()).includes("That part of the admin isn't yours");
    ok("editor sees an explanation", denied);

    await c.close();
  }

  // -------------------------------------------------- certificate round trip
  {
    const { c, p } = await fresh();
    await signIn(p, vol.email);
    await p.goto(`${BASE}/account/certificates`, { waitUntil: "networkidle" });
    ok("eligible after approval", /Ready to certify/i.test(await p.locator("body").innerText()));

    await p.getByRole("button", { name: /issue my certificate/i }).click();
    await p.waitForTimeout(4000);

    const { data: certs } = await admin.from("certificates").select("code,hours,cards,kind").eq("user_id", vol.id);
    ok("certificate issued", (certs?.length ?? 0) === 1, JSON.stringify(certs?.[0] ?? {}));
    const code = certs?.[0]?.code;

    if (code) {
      const dl = await p.request.get(`${BASE}/account/certificates/${code}`);
      const body = await dl.body();
      ok("PDF downloads", dl.status() === 200 && body.subarray(0, 4).toString() === "%PDF",
         `${dl.status()} ${body.length} bytes`);
      ok("PDF has a filename", (dl.headers()["content-disposition"] ?? "").includes(".pdf"),
         dl.headers()["content-disposition"] ?? "");

      const { c: c2, p: p2 } = await fresh();   // signed out — public check
      await p2.goto(`${BASE}/verify/${code}`, { waitUntil: "networkidle" });
      const vt = await p2.locator("body").innerText();
      ok("public verify works signed out", /genuine/i.test(vt) && vt.includes("QA Volunteer Two"));
      await c2.close();
    }
    await c.close();
  }
} catch (e) {
  ok("UNCAUGHT", false, String(e).slice(0, 260));
} finally {
  await browser.close();
}

console.log(JSON.stringify(out, null, 1));
