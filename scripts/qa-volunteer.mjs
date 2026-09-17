import { chromium } from "playwright";
import { BASE, admin, makeUser, signIn, cleanup } from "./qa-lib.mjs";

const PROOF = "/private/tmp/claude-501/-Users-arijitsaha-Downloads-Hearts4Hands/d82f7d79-84f7-4fe3-b8c4-06d452b1d5b8/scratchpad/proof.png";
const out = [];
const ok = (n, pass, detail = "") => out.push({ check: n, pass, detail });

const user = await makeUser("vol", { fullName: "QA Volunteer" });
const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 140)));

try {
  await signIn(page, user.email);
  ok("sign in with password", !page.url().includes("/login"), page.url().replace(BASE, ""));

  // ---- dashboard --------------------------------------------------------
  await page.goto(`${BASE}/account`, { waitUntil: "networkidle" });
  ok("dashboard loads", (await page.locator("h1").innerText()).includes("Hello"));

  // ---- log hours: required proof ---------------------------------------
  await page.goto(`${BASE}/account/hours`, { waitUntil: "networkidle" });
  ok("cards field hidden by default", !(await page.locator("#cardsMade").isVisible()));
  ok("delivery question hidden by default", (await page.locator("input[name='deliveryMethod']").count()) === 0);

  await page.click("#activity-writing");
  await page.waitForTimeout(250);
  const notice = await page.getByText("Stories go somewhere else").isVisible().catch(() => false);
  ok("writing shows the story notice", notice);
  const storyBtn = page.getByRole("link", { name: /story form/i });
  ok("story notice links to /blog/submit", (await storyBtn.getAttribute("href")) === "/blog/submit");
  await page.click("#activity-writing");

  await page.click("#activity-cards");
  await page.waitForTimeout(250);
  ok("cards field appears", await page.locator("#cardsMade").isVisible());
  ok("delivery question appears", (await page.locator("input[name='deliveryMethod']").count()) === 2);

  // submit with no photo — must be refused
  await page.fill("#hours", "3");
  await page.fill("#cardsMade", "5");
  await page.check("#delivery-self");
  await page.getByRole("button", { name: /^log it$/i }).click();
  await page.waitForTimeout(2500);
  const refusedText = await page.locator("body").innerText();
  ok("proof is required", /attach a photo/i.test(refusedText), refusedText.match(/attach a photo[^.]*\./i)?.[0] ?? "no message found");

  // now with a photo
  await page.setInputFiles("#proof", PROOF);
  await page.waitForTimeout(400);
  if (!(await page.locator("#cardsMade").isVisible())) {
    await page.click("#activity-cards");
    await page.waitForTimeout(200);
  }
  if (!(await page.locator("#hours").inputValue())) await page.fill("#hours", "3");
  if (!(await page.locator("#cardsMade").inputValue())) await page.fill("#cardsMade", "5");
  if (!(await page.locator("#delivery-self").isChecked())) await page.check("#delivery-self");
  await page.getByRole("button", { name: /^log it$/i }).click();
  await page.waitForTimeout(4000);
  const saved = /Logged/i.test(await page.locator("body").innerText());
  ok("hours submit with photo", saved);

  const { data: rows } = await admin
    .from("volunteer_signups").select("hours,cards_made,delivery_method,proof_path,status")
    .eq("user_id", user.id);
  ok("row written", (rows?.length ?? 0) === 1, JSON.stringify(rows?.[0] ?? {}));
  ok("delivery_method stored", rows?.[0]?.delivery_method === "self", String(rows?.[0]?.delivery_method));
  ok("proof uploaded to storage", Boolean(rows?.[0]?.proof_path), String(rows?.[0]?.proof_path).slice(0, 40));

  // ---- certificates: nothing approved yet ------------------------------
  await page.goto(`${BASE}/account/certificates`, { waitUntil: "networkidle" });
  const certText = await page.locator("body").innerText();
  ok("no certificate before approval", /Nothing approved yet/i.test(certText));
} catch (e) {
  ok("UNCAUGHT", false, String(e).slice(0, 300));
} finally {
  await browser.close();
}

console.log(JSON.stringify({ results: out, consoleErrors: [...new Set(errors)] }, null, 1));
