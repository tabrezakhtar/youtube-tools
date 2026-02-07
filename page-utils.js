export const DEFAULT_TIMEOUT = 10000;

export async function extract(page, selectors, opts = {}) {
  const timeout = opts.timeout || DEFAULT_TIMEOUT;

  if (opts.waitForSelector) {
    await page.waitForSelector(opts.waitForSelector, { timeout }).catch(() => {});
  }

  if (opts.requireDigits) {
    await page.waitForFunction(
      selectors => selectors.some(sel => {
        const el = document.querySelector(sel);
        return el && /\d/.test((el.innerText || el.textContent || ""));
      }),
      { timeout },
      selectors
    ).catch(() => {});
  }

  return await page.evaluate(selectors => {
    const ATTRS = ["title", "aria-label"];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (!el) continue;

      for (const a of ATTRS) {
        const v = el.getAttribute && el.getAttribute(a);
        if (v && v.trim()) return v.trim();
      }

      const txt = (el.innerText || el.textContent || "").trim();
      if (txt) return txt;

      const inner = el.querySelector && (el.querySelector('yt-formatted-string') || el.querySelector('span'));
      if (inner) {
        const innerTxt = (inner.innerText || inner.textContent || "").trim();
        if (innerTxt) return innerTxt;
      }
    }

    return null;
  }, selectors);
}

export function normalize(text, kind) {
  if (!text) return null;
  const t = String(text).trim();
  if (!t) return null;

  if (kind === "title") return t.replace(/\s*-\s*YouTube\s*$/i, "").trim();
  if (kind === "views") return t.replace(/\s*views?\s*$/i, "").trim();
  if (kind === "comments") return t.replace(/\s*comments?\s*$/i, "").trim();
  return t;
}