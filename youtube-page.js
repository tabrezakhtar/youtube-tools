const DEFAULT_TIMEOUT = 10000;

async function extract(page, selectors, opts = {}) {
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

      // prefer attribute values
      for (const a of ATTRS) {
        const v = el.getAttribute && el.getAttribute(a);
        if (v && v.trim()) return v.trim();
      }

      // prefer visible text
      const txt = (el.innerText || el.textContent || "").trim();
      if (txt) return txt;

      // try a common inner node
      const inner = el.querySelector && (el.querySelector('yt-formatted-string') || el.querySelector('span'));
      if (inner) {
        const innerTxt = (inner.innerText || inner.textContent || "").trim();
        if (innerTxt) return innerTxt;
      }
    }

    return null;
  }, selectors);
}

function normalize(text, kind) {
  if (!text) return null;
  const t = String(text).trim();
  if (!t) return null;

  if (kind === "title") return t.replace(/\s*-\s*YouTube\s*$/i, "").trim();
  if (kind === "views") return t.replace(/\s*views?\s*$/i, "").trim();
  if (kind === "comments") return t.replace(/\s*comments?\s*$/i, "").trim();
  return t;
}

export async function getTitle(page) {
  const raw = await extract(page, ["h1 yt-formatted-string", "h1", 'meta[name="title"]'], { waitForSelector: "h1 yt-formatted-string", timeout: DEFAULT_TIMEOUT });
  return normalize(raw, "title");
}

export async function getChannelName(page) {
  const raw = await extract(page, ["ytd-channel-name #text a", "ytd-channel-name yt-formatted-string#text", "ytd-channel-name yt-formatted-string"], { waitForSelector: "ytd-channel-name #text a", timeout: DEFAULT_TIMEOUT });
  return normalize(raw, "channel");
}

export async function getViews(page) {
  const raw = await extract(page, ["#view-count", ".view-count", "[aria-label*=\"view\"]"], { waitForSelector: "#view-count", requireDigits: true, timeout: DEFAULT_TIMEOUT });
  return normalize(raw, "views");
}

export async function getCommentsCount(page) {
  try {
    await page.evaluate(() => {
      const commentsSection = document.querySelector("ytd-comments#comments") || document.querySelector("#comments");
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: "instant", block: "start" });
      }
    });

    await page.waitForTimeout(500);

    await page.waitForFunction(
      () => {
        const el = document.querySelector("#count yt-formatted-string.count-text") 
          || document.querySelector("#count yt-formatted-string")
          || document.querySelector("ytd-comments-header-renderer #count");
        if (!el) return false;
        const txt = (el.innerText || el.textContent || "").trim();
        return txt && /\d/.test(txt) && txt.length > 0;
      },
      { timeout: 15000 }
    ).catch(() => {});

    const raw = await page.evaluate(() => {
      const selectors = [
        "#count yt-formatted-string.count-text",
        "ytd-comments-header-renderer #count yt-formatted-string",
        "#count yt-formatted-string",
        "h2#count"
      ];

      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (!el) continue;
        const txt = (el.innerText || el.textContent || "").trim();
        if (txt && /\d/.test(txt)) return txt;
      }
      return null;
    });

    return normalize(raw, "comments");
  } catch (err) {
    return null;
  }
}