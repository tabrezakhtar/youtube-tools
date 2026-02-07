import inquirer from "inquirer";
import chalk from "chalk";
import playwright from "playwright";
import ora from "ora";
import { getTitle, getChannelName, getCommentsCount, getViews } from "./youtube-page.js";
import { launchPlaywright } from "./playwright-config.js";

console.log(chalk.blue("Youtube Scraper."));

(async () => {
  // For testing, you can hardcode a YouTube URL here. If left empty, the script will prompt you to enter one.
  let url = "https://www.youtube.com/watch?v=AjWfY7SnMBI";

  if (!url) {
    const questions = [
      {
        type: 'input',
        name: 'url',
        message: chalk.green('Please paste the YouTube URL:'),
      },
    ];

    const answers = await inquirer.prompt(questions);
    url = answers.url;
  }

  if (!url) {
    console.error(chalk.red('No URL provided. Exiting.'));
    process.exit(1);
  }

  const spinner = ora({ text: "starting", color: "cyan" }).start();
  let context, page, browser;

  try {
    spinner.text = "launching browser";
    ({ context, page, browser } = await launchPlaywright(playwright));
    spinner.succeed("browser ready");

    spinner.start("navigating to url");
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    spinner.succeed("page loaded");

    spinner.start("extracting metadata");
    const tasks = [
      { name: "title", fn: getTitle, color: "cyan" },
      { name: "channel", fn: getChannelName, color: "yellow" },
      { name: "views", fn: getViews, color: "magenta" },
      { name: "comments", fn: getCommentsCount, color: "green" }
    ];

    let remaining = tasks.length;
    const promises = tasks.map(({ name, fn, color }) => (async () => {
      spinner.text = `getting ${name} (${remaining} remaining)`;
      try {
        const val = await fn(page);
        console.log(chalk[color](`${name.charAt(0).toUpperCase() + name.slice(1)}:`), val);
      } catch (err) {
        console.error(chalk.red(`${name} error:`), err);
      } finally {
        remaining--;
        spinner.text = `extracting metadata (${remaining} remaining)`;
      }
    })());

    await Promise.all(promises);
    spinner.succeed("extraction complete");
  } catch (err) {
    spinner.fail("failed");
    console.error(chalk.red("Error:"), err);
  } finally {
    if (context && typeof context.close === "function") await context.close();
    if (browser && typeof browser.close === "function") await browser.close();
    spinner.stop();
  }
})();