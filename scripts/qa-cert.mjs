import { chromium } from "playwright";
import { BASE, admin, qaEmail, signIn } from "./qa-lib.mjs";
const out = [];
const ok = (n, pass, d = "") => out.push({ check: n, pass, detail: String(d).slice(0, 110) });

const b = await chromium.launch();
try {
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  await signIn(p, qaEmail("vol2"));
  ok("sign in", !p.url().includes("/login"), p.url().replace(BASE, ""));

  await p.goto(`${BASE}/account/certificates`, { waitUntil: "networkidle" });
  ok("eligible after approval", /Ready to certify/i.test(await p.locator("body").innerText()));

  await p.getByRole("button", { name: /issue my certificate/i }).click();
  await p.waitForTimeout(4500);

  const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const vol = users.users.find((u) => u.email === qaEmail("vol2"));
  const { data: certs } = await admin.from("certificates").select("code,hours,cards,kind").eq("user_id", vol.id);
  ok("certificate issued", (certs?.length ?? 0) === 1, JSON.stringify(certs?.[0] ?? {}));

  const code = certs?.[0]?.code;
  if (code) {
    const dl = await p.request.get(`${BASE}/account/certificates/${code}`);
    const body = await dl.body();
    ok("PDF downloads", dl.status() === 200 && body.subarray(0, 4).toString() === "%PDF", `${dl.status()} ${body.length} bytes`);
    ok("PDF filename set", (dl.headers()["content-disposition"] ?? "").includes(".pdf"), dl.headers()["content-disposition"] ?? "");
    ok("PDF not cacheable by proxies", (dl.headers()["cache-control"] ?? "").includes("no-store"), dl.headers()["cache-control"] ?? "");

    const anon = await (await b.newContext()).newPage();
    await anon.goto(`${BASE}/verify/${code}`, { waitUntil: "networkidle" });
    const vt = await anon.locator("body").innerText();
    ok("verify works signed out", /genuine/i.test(vt) && vt.includes("QA Volunteer Two"));

    // somebody else must not be able to download it
    const other = await (await b.newContext()).newPage();
    await signIn(other, qaEmail("vol"));
    const steal = await other.request.get(`${BASE}/account/certificates/${code}`);
    ok("another volunteer can't download it", steal.status() === 403 || steal.status() === 404, String(steal.status()));
  }
} catch (e) {
  ok("UNCAUGHT", false, String(e).slice(0, 220));
} finally { await b.close(); }
console.log(JSON.stringify(out, null, 1));
