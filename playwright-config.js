export const defaultConfig = {
  usePersistentContext: true,
  profilePath: "playwright-data",
  launchOptions: {
    headless: process.env.PLAYWRIGHT_HEADLESS ? process.env.PLAYWRIGHT_HEADLESS === 'true' : true,
    viewport: { width: 1280, height: 800 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    locale: "en-US",
    timezoneId: "Europe/London",
    bypassCSP: true,
    ignoreHTTPSErrors: true,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-infobars",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1280,800"
    ],
    extraHTTPHeaders: {
      "accept-language": "en-US,en;q=0.9"
    }
  }
};

const initScript = `() => {
  Object.defineProperty(navigator, "webdriver", { get: () => false });
  Object.defineProperty(navigator, "plugins", { get: () => [1,2,3] });
  Object.defineProperty(navigator, "languages", { get: () => ["en-US","en"] });
}`;

export async function launchPlaywright(playwright, cfg = {}) {
  const conf = { ...defaultConfig, ...cfg };
  const opts = { ...conf.launchOptions, ...(cfg.launchOptions || {}) };
  // allow overriding headless at runtime via env var (PLAYWRIGHT_HEADLESS=true|false)
  opts.headless = process.env.PLAYWRIGHT_HEADLESS ? process.env.PLAYWRIGHT_HEADLESS === 'true' : opts.headless;

  if (conf.usePersistentContext) {
    const context = await playwright.chromium.launchPersistentContext(conf.profilePath, opts);
    const page = context.pages().length ? context.pages()[0] : await context.newPage();
    await page.addInitScript(initScript);
    return { context, page };
  }

  const browser = await playwright.chromium.launch(opts);
  const context = await browser.newContext(opts);
  const page = await context.newPage();
  await page.addInitScript(initScript);
  return { browser, context, page };
}
