import { DEFAULT_TIMEOUT, extract, normalize } from "./page-utils.js";


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