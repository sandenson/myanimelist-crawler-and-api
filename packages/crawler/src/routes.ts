import { createPlaywrightRouter } from "crawlee";

export const router = createPlaywrightRouter();

router.addHandler("top-anime", async ({ enqueueLinks, page, log }) => {
    log.info(`Enqueueing anime URLs`);
    //* Selectors

    await page.waitForSelector('h3.anime_ranking_h3 a');
    await enqueueLinks({
        selector: 'h3.anime_ranking_h3 > a',
        label: 'anime',
    })
    
    await page.waitForSelector('.icon-top-ranking-page-bottom a.link-blue-box.next');
    await enqueueLinks({
        selector: '.icon-top-ranking-page-bottom > a.link-blue-box.next',
        label: 'top-manga'
    })
});

router.addHandler("top-manga", async ({ enqueueLinks, page, log }) => {
    log.info(`Enqueueing manga URLs`);
    //* Selectors

    await page.waitForSelector('h3.manga_h3 a');
    await enqueueLinks({
        selector: 'h3.manga_h3 > a',
        label: 'manga',
    })
    
    await page.waitForSelector('.icon-top-ranking-page-bottom a.link-blue-box.next');
    await enqueueLinks({
        selector: '.icon-top-ranking-page-bottom > a.link-blue-box.next',
        label: 'top-manga'
    })
});
