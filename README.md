# YouTube Live Chat Scraper

This Node.js script scrapes live chat messages from a YouTube live stream without using the YouTube Data API or requiring an API key. It uses Puppeteer to extract chat messages directly from the live stream's webpage and logs them to the console.

## Features

- Scrapes live chat messages from a YouTube live stream URL.
- Retrieves messages every 5 seconds, capturing all new messages since the last scrape.
- Extracts timestamp, author, and message for each chat entry.
- Ensures no messages are missed by tracking the last processed message's timestamp.
- Does not require authentication or API keys, relying entirely on web scraping.
