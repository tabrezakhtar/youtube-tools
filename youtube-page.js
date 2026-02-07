export async function getTitle(page) {
  await page.waitForSelector('h1 yt-formatted-string', { timeout: 10000 }).catch(() => {});
  
  return await page.evaluate(() => {
    const el = document.querySelector('h1 yt-formatted-string') || document.querySelector('h1');
    if (el) {
      const attr = (el.getAttribute && (el.getAttribute('title') || el.getAttribute('aria-label')));
      if (attr && attr.trim() && attr.trim().length > 0) return attr.trim();
      const txt = el.textContent && el.textContent.trim();
      if (txt && txt.length > 0) return txt;
    }

    const meta = document.querySelector('meta[name="title"]')?.getAttribute('content');
    if (meta && meta.trim() && meta.trim().length > 0) return meta.trim();
    if (document.title) {
      const cleaned = document.title.replace(/\s*-\s*YouTube\s*$/i, '').trim();
      if (cleaned && cleaned.length > 0) return cleaned;
    }
    return null;
  });
}

export async function getChannelName(page) {
  await page.waitForSelector('ytd-channel-name #text a', { timeout: 10000 }).catch(() => {});
  
  return await page.evaluate(() => {
    const container = document.querySelector('ytd-channel-name');
    if (!container) return null;

    const anchor = container.querySelector('#text a') || container.querySelector('a');
    if (anchor && anchor.textContent && anchor.textContent.trim() && anchor.textContent.trim().length > 0) {
      return anchor.textContent.trim();
    }

    const formatted = container.querySelector('yt-formatted-string#text') || container.querySelector('yt-formatted-string');
    if (formatted) {
      const attr = (formatted.getAttribute && (formatted.getAttribute('title') || formatted.getAttribute('aria-label')));
      if (attr && attr.trim() && attr.trim().length > 0) return attr.trim();
      const txt = formatted.textContent && formatted.textContent.trim();
      if (txt && txt.length > 0) return txt;
    }

    return null;
  });
}

export async function getViews(page) {
  await page.waitForSelector('#view-count[aria-label]', { timeout: 10000 }).catch(() => {});
  
  return await page.evaluate(() => {
    const el = document.querySelector('#view-count') || document.querySelector('.view-count') || document.querySelector('[aria-label*="view"]');

    if (el) {
      const aria = el.getAttribute && el.getAttribute('aria-label');
      if (aria && aria.trim() && aria.trim().length > 0) {
        const cleaned = aria.replace(/\s*views?\s*$/i, '').trim();
        if (cleaned && cleaned.length > 0) return cleaned;
      }

      const txt = (el.innerText || el.textContent || "").trim();
      if (txt && txt.length > 0) {
        const cleaned = txt.replace(/\s*views?\s*$/i, '').trim();
        if (cleaned && cleaned.length > 0) return cleaned;
      }
    }

    const metaCount = document.querySelector('meta[itemprop="interactionCount"]')?.getAttribute('content')
      || document.querySelector('meta[name="interactionCount"]')?.getAttribute('content');
    if (metaCount && metaCount.trim() && metaCount.trim().length > 0) return metaCount.trim();

    return null;
  });
}

export async function getCommentsCount(page) {
  await page.waitForFunction(
    () => {
      const el = document.querySelector('#count yt-formatted-string');
      return el && el.textContent && el.textContent.trim().length > 0 && /\d/.test(el.textContent);
    },
    { timeout: 10000 }
  ).catch(() => {});
  
  return await page.evaluate(() => {
    const el = document.querySelector('#count yt-formatted-string') 
      || document.querySelector('#count') 
      || document.querySelector('ytd-comments-header-renderer #count') 
      || document.querySelector('.count-text');

    if (el) {
      const txt = (el.innerText || el.textContent || "").trim();
      if (txt && txt.length > 0 && /\d/.test(txt)) {
        const cleaned = txt.replace(/\s*comments?\s*$/i, '').trim();
        if (cleaned && cleaned.length > 0) return cleaned;
      }

      const attr = el.getAttribute && (el.getAttribute('title') || el.getAttribute('aria-label'));
      if (attr && attr.trim() && attr.trim().length > 0 && /\d/.test(attr)) {
        const cleaned = attr.replace(/\s*comments?\s*$/i, '').trim();
        if (cleaned && cleaned.length > 0) return cleaned;
      }
    }

    const metaCount = document.querySelector('meta[itemprop="commentCount"]')?.getAttribute('content')
      || document.querySelector('meta[name="commentCount"]')?.getAttribute('content');
    if (metaCount && metaCount.trim() && metaCount.trim().length > 0) return metaCount.trim();

    return null;
  });
}