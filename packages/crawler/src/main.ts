// For more information, see https://crawlee.dev/
import { PlaywrightCrawler } from "crawlee";
import { router } from "./routes.ts";

const startUrls = [
    {
        url: 'https://myanimelist.net/topanime.php',
        label: 'top-anime'
    },
    {
        url: 'https://myanimelist.net/topmanga.php',
        label: 'top-manga'
    }
];

const crawler = new PlaywrightCrawler({
  // proxyConfiguration: new ProxyConfiguration({
  //   proxyUrls: ["http://177.93.78.25:4153"],
  // }),
  requestHandler: router,
});

await crawler.run(startUrls);
