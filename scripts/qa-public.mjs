import { chromium } from "playwright";

const BASE = process.env.QA_BASE ?? "http://localhost:3000";
const ROUTES = [
  "/", "/about", "/volunteer", "/leadership", "/donate", "/contact",
  "/blog", "/blog/submit", "/privacy", "/terms",
  "/login", "/signup", "/forgot-password",
  "/account", "/admin", "/verify/H4H-NOPE0-NOPE0", "/definitely-not-a-page",
];

const browser = await chromium.launch();
const results = [];

for (const route of ROUTES) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const consoleErrors = [];
  const failedRequests = [];

  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text().slice(0, 160));
  });
  page.on("requestfailed", (r) => failedRequests.push(`${r.url().slice(0, 90)} ${r.failure()?.errorText ?? ""}`));
  page.on("response", (r) => {
    if (r.status() >= 400 && new URL(r.url()).origin === new URL(BASE).origin) {
      failedRequests.push(`${r.status()} ${r.url().slice(0, 90)}`);
    }
  });

  let status = 0;
  try {
    const res = await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 30000 });
    status = res?.status() ?? 0;
  } catch (e) {
    consoleErrors.push("NAV FAILED: " + String(e).slice(0, 120));
  }

  const audit = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")];
    return {
      finalPath: location.pathname,
      title: document.title,
      h1Count: document.querySelectorAll("h1").length,
      h1: document.querySelector("h1")?.innerText?.slice(0, 60) ?? "",
      imgsNoAlt: imgs.filter((i) => !i.hasAttribute("alt")).map((i) => i.src.slice(-40)),
      imgsBroken: imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src.slice(-50)),
      inputsNoLabel: [...document.querySelectorAll("input,select,textarea")]
        .filter((el) => {
          if (el.type === "hidden" || el.closest("[aria-hidden='true']")) return false;
          if (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby")) return false;
          return !(el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`));
        })
        .map((el) => `${el.tagName.toLowerCase()}#${el.id || "(no id)"}`),
      internalLinks: [...new Set([...document.querySelectorAll("a[href^='/']")].map((a) => a.getAttribute("href")))],
    };
  }).catch(() => null);

  results.push({ route, status, consoleErrors, failedRequests, ...audit });
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 1));
