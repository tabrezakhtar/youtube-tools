import inquirer from "inquirer";
import chalk from "chalk";
import playwright from "playwright";
import { getTitle, getChannelName, getCommentsCount, getViews } from "./youtube-page.js";

console.log(chalk.blue("Youtube Live Chat Scraper."));

(async () => {
  let url = "https://www.youtube.com/watch?v=PxataKlT4BU";

  if (!url) {
    const questions = [
      {
        type: 'input',
        name: 'url',
        message: chalk.green('Please paste the YouTube live stream URL:'),
      },
    ];

    const answers = await inquirer.prompt(questions);
    url = answers.url;
  }

  if (!url) {
    console.error(chalk.red('No URL provided. Exiting.'));
    process.exit(1);
  }

  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const title = await getTitle(page);
  const channel = await getChannelName(page);
  const views = await getViews(page);
  const comments = await getCommentsCount(page);

  console.log(chalk.cyan("Title:"), title);
  console.log(chalk.yellow("Channel:"), channel);
  console.log(chalk.magenta("Views:"), views);
  console.log(chalk.green("Comments:"), comments);

  await browser.close();
})();