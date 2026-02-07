import inquirer from "inquirer";
import chalk from "chalk";
import playwright from "playwright";
import { getTitle, getChannelName, getCommentsCount, getViews } from "./youtube-page.js";
import { launchPlaywright } from "./playwright-config.js";

console.log(chalk.blue("Youtube Scraper."));

(async () => {
  let url = "https://www.youtube.com/watch?v=VIS2NF--wsE";

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

  const { context, page, browser } = await launchPlaywright(playwright);

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  const title = await getTitle(page);
  const channel = await getChannelName(page);
  const views = await getViews(page);
  const comments = await getCommentsCount(page);

  console.log(chalk.cyan("Title:"), title);
  console.log(chalk.yellow("Channel:"), channel);
  console.log(chalk.magenta("Views:"), views);
  console.log(chalk.green("Comments:"), comments);

  if (context && typeof context.close === "function") await context.close();
  if (browser && typeof browser.close === "function") await browser.close();
})();