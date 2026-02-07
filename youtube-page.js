export async function getTitle(page) {
  return await page.evaluate(() => {
    // prefer explicit attributes on the title element
    const el = document.querySelector('h1 yt-formatted-string') || document.querySelector('h1');
    if (el) {
      const attr = (el.getAttribute && (el.getAttribute('title') || el.getAttribute('aria-label')));
      if (attr && attr.trim()) return attr.trim();
      const txt = el.textContent && el.textContent.trim();
      if (txt) return txt;
    }

    // fallback to meta tag or document.title
    const meta = document.querySelector('meta[name="title"]')?.getAttribute('content');
    if (meta && meta.trim()) return meta.trim();
    if (document.title) return document.title.replace(/\s*-\s*YouTube\s*$/i, '').trim();
    return null;
  });
}

export async function getChannelName(page) {
  return await page.evaluate(() => {
    // prefer explicit attributes or aria-label on the formatted-string
    const anchor = document.querySelector('ytd-channel-name #text a');
    if (anchor && anchor.textContent && anchor.textContent.trim()) return anchor.textContent.trim();

    const formatted = document.querySelector('ytd-channel-name yt-formatted-string') || document.querySelector('#channel-name');
    if (formatted) {
      const attr = (formatted.getAttribute && (formatted.getAttribute('title') || formatted.getAttribute('aria-label')));
      if (attr && attr.trim()) return attr.trim();
      const txt = formatted.textContent && formatted.textContent.trim();
      if (txt) return txt;
    }

    // fallback to common meta tags or author itemprop
    const metaAuthor = document.querySelector('meta[itemprop="author"]')?.getAttribute('content')
      || document.querySelector('meta[name="author"]')?.getAttribute('content');
    if (metaAuthor && metaAuthor.trim()) return metaAuthor.trim();

    return null;
  });
}

export async function getViews(page) {
  return await page.evaluate(() => {
    const el = document.querySelector('#view-count') || document.querySelector('.view-count') || document.querySelector('[aria-label*="view"]');

    if (el) {
      const aria = el.getAttribute && el.getAttribute('aria-label');
      if (aria && aria.trim()) return aria.replace(/\s*views?\s*$/i, '').trim();

      const txt = (el.innerText || el.textContent || "").trim();
      if (txt) return txt.replace(/\s*views?\s*$/i, '').trim();
    }

    const metaCount = document.querySelector('meta[itemprop="interactionCount"]')?.getAttribute('content')
      || document.querySelector('meta[name="interactionCount"]')?.getAttribute('content');
    if (metaCount && metaCount.trim()) return metaCount.trim();

    return null;
  });
}

export async function getCommentsCount(page) {
  return await page.evaluate(() => {
    const el = document.querySelector('#count') || document.querySelector('ytd-comments-header-renderer') || document.querySelector('.count-text');

    if (el) {
      const attr = el.getAttribute && (el.getAttribute('title') || el.getAttribute('aria-label'));
      if (attr && attr.trim()) return attr.replace(/\s*comments?\s*$/i, '').trim();

      const txt = (el.innerText || el.textContent || "").trim();
      if (txt) return txt.replace(/\s*comments?\s*$/i, '').trim();
    }

    const metaCount = document.querySelector('meta[itemprop="commentCount"]')?.getAttribute('content')
      || document.querySelector('meta[name="commentCount"]')?.getAttribute('content');
    if (metaCount && metaCount.trim()) return metaCount.trim();

    return null;
  });
}