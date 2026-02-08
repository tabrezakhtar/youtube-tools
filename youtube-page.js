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

export async function isLiveStream(page, { timeout = 8000 } = {}) {
  try {
    const waitTimeout = typeof timeout === "number" ? timeout : 8000;
    const found = await page.waitForFunction(
      () => {
        if (document.querySelector("body > yt-live-chat-app")) return true;
        if (document.querySelector("yt-live-chat-app")) return true;
        if (document.querySelector("yt-live-chat-renderer")) return true;
        if (document.querySelector("#chat-container yt-live-chat-renderer")) return true;
        if (document.querySelector("ytd-live-chat-frame")) return true;
        if (document.querySelector("iframe#chatframe")) return true;
        
        const liveBadge = document.querySelector(".ytp-live-badge");
        if (liveBadge && liveBadge.textContent && liveBadge.textContent.trim().toLowerCase().includes("live")) return true;
        
        const liveBadgeAlt = document.querySelector(".badge-style-type-live-now");
        if (liveBadgeAlt) return true;
        
        const url = window.location.href;
        if (url.includes("/live/") || url.includes("/live_stream")) return true;
        
        return false;
      },
      { timeout: waitTimeout }
    ).catch(() => null);

    if (found) return true;

    const exists = await page.evaluate(() => {
      if (document.querySelector("body > yt-live-chat-app")) return true;
      if (document.querySelector("yt-live-chat-app")) return true;
      if (document.querySelector("yt-live-chat-renderer")) return true;
      if (document.querySelector("#chat-container yt-live-chat-renderer")) return true;
      if (document.querySelector("ytd-live-chat-frame")) return true;
      if (document.querySelector("iframe#chatframe")) return true;
      
      const liveBadge = document.querySelector(".ytp-live-badge");
      if (liveBadge && liveBadge.textContent && liveBadge.textContent.trim().toLowerCase().includes("live")) return true;
      
      const liveBadgeAlt = document.querySelector(".badge-style-type-live-now");
      if (liveBadgeAlt) return true;
      
      const url = window.location.href;
      if (url.includes("/live/") || url.includes("/live_stream")) return true;
      
      return false;
    });

    return !!exists;
  } catch {
    return false;
  }
}

export async function getChatMessages(page, { limit = 10 } = {}) {
  try {
    await page.waitForTimeout(2000);

    const chatFrame = await page.$("iframe#chatframe");
    if (chatFrame) {
      const frame = await chatFrame.contentFrame();
      if (frame) {
        await frame.waitForSelector("#items yt-live-chat-text-message-renderer", { timeout: 5000 }).catch(() => {});
        
        const messages = await frame.evaluate((maxMessages) => {
          const chatRenderers = document.querySelectorAll("#items yt-live-chat-text-message-renderer");
          const results = [];

          for (let i = 0; i < Math.min(chatRenderers.length, maxMessages); i++) {
            const renderer = chatRenderers[i];
            const authorEl = renderer.querySelector("#author-name");
            const messageEl = renderer.querySelector("#message");

            if (authorEl && messageEl) {
              const author = (authorEl.innerText || authorEl.textContent || "").trim();
              const message = (messageEl.innerText || messageEl.textContent || "").trim();
              if (author && message) {
                results.push({ author, message });
              }
            }
          }

          return results;
        }, limit);

        return messages;
      }
    }

    await page.waitForSelector("#items yt-live-chat-text-message-renderer", { timeout: 5000 }).catch(() => {});

    const messages = await page.evaluate((maxMessages) => {
      const chatRenderers = document.querySelectorAll("#items yt-live-chat-text-message-renderer");
      const results = [];

      for (let i = 0; i < Math.min(chatRenderers.length, maxMessages); i++) {
        const renderer = chatRenderers[i];
        const authorEl = renderer.querySelector("#author-name");
        const messageEl = renderer.querySelector("#message");

        if (authorEl && messageEl) {
          const author = (authorEl.innerText || authorEl.textContent || "").trim();
          const message = (messageEl.innerText || messageEl.textContent || "").trim();
          if (author && message) {
            results.push({ author, message });
          }
        }
      }

      return results;
    }, limit);

    return messages;
  } catch (err) {
    return [];
  }
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