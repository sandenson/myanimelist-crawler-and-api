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

router.addHandler("anime", async ({ request, enqueueLinks, page, log }) => {
    log.info(`Handling anime URLs`);

    const [_, malId, slug] = /\/anime\/([0-9]*)\/([^\/]*)/gm.exec(request.url) as RegExpExecArray;
    
    //* Selectors
    await page.waitForSelector('div.score-label');
    
    const score = await page.locator('div.score-label').innerText();
    
    const title = await page.locator('.title-name.h1_bold_none > strong').innerText();

    const infoSelector = '#content > table > tbody > tr > td.borderClass > div > div.spaceit_pad';

    await page.waitForSelector(infoSelector);

    const type = (await page.locator(infoSelector).filter({hasText: 'Type:'}).innerText()).replace('Type: ', '').toLowerCase().replace(' ', '_');

    const status = (await page.locator(infoSelector).filter({hasText: 'Status:'}).innerText()).replace('Status: ', '').toLowerCase().replace(' ', '_');

    const episodes = Number((await page.locator(infoSelector).filter({hasText: 'Episodes:'}).innerText()).replace('Episodes: ', '')) || null;

    const sourceType = (await page.locator(infoSelector).filter({hasText: 'Source:'}).innerText()).replace('Source: ', '').toLowerCase().replace(' ', '_');
    
    const sources = await page.locator('table.anime_detail_related_anime > tbody > tr').filter({ hasText: 'Adaptation:' }).locator('a').evaluateAll((els: HTMLAnchorElement[]) => els.map(el => el.href)) as string[] | null;

    const seasonUrl = type === 'tv' ? await page.locator(infoSelector).filter({hasText: 'Premiered:'}).locator('a').getAttribute('href') : null;

    let year: number | null = null;
    let season: string | null = null;

    if (seasonUrl) {
        const seasonMatch = /\/anime\/season\/([0-9]{4,4})\/([aefgilmnprstuw]{4,6})/gm.exec(seasonUrl);

        if (seasonMatch) {
            year = Number(seasonMatch[1]);
            season = seasonMatch[2];    
        }
    }

    const producerUrls = await page.locator(infoSelector).filter({ hasText: 'Producers:' }).locator('a').evaluateAll((els: HTMLAnchorElement[]) => els.map(el => el.href));
    const producerIds = producerUrls.filter(prod => !!prod).map(prod => {
        const [_, malId] = /\/anime\/producer\/([0-9]*)\/([^\/]*)/gm.exec(prod) as RegExpExecArray;
        return Number(malId);
    })

    enqueueLinks({
        urls: producerUrls,
        label: 'producers'
    })

    const licensorUrls = await page.locator(infoSelector).filter({ hasText: 'Licensors:' }).locator('a').evaluateAll((els: HTMLAnchorElement[]) => els.map(el => el.href));
    const licensorIds = licensorUrls.filter(prod => !!prod).map(prod => {
        const [_, malId] = /\/anime\/producer\/([0-9]*)\/([^\/]*)/gm.exec(prod) as RegExpExecArray;
        return Number(malId);
    })

    enqueueLinks({
        urls: licensorUrls,
        label: 'licensors'
    })

    const studioUrls = await page.locator(infoSelector).filter({ hasText: 'Studios:' }).locator('a').evaluateAll((els: HTMLAnchorElement[]) => els.map(el => el.href));
    const studioIds = studioUrls.filter(prod => !!prod).map(prod => {
        const [_, malId] = /\/anime\/producer\/([0-9]*)\/([^\/]*)/gm.exec(prod) as RegExpExecArray;
        return Number(malId);
    })

    enqueueLinks({
        urls: studioUrls,
        label: 'studios'
    })

    const genreUrls = await page.locator(infoSelector).filter({ hasText: 'Genres:' }).locator('a').evaluateAll((els: HTMLAnchorElement[]) => els.map(el => el.href));
    const genreIds = genreUrls.filter(prod => !!prod).map(prod => {
        const [_, malId] = /\/anime\/genre\/([0-9]*)\/([^\/]*)/gm.exec(prod) as RegExpExecArray;
        return Number(malId);
    })

    enqueueLinks({
        urls: genreUrls,
        label: 'genres'
    })

    const themeUrls1 = await page.locator(infoSelector).filter({ hasText: 'Themes:' }).locator('a').evaluateAll((els: HTMLAnchorElement[]) => els.map(el => el.href));
    const themeUrls2 = await page.locator(infoSelector).filter({ hasText: 'Theme:' }).locator('a').evaluateAll((els: HTMLAnchorElement[]) => els.map(el => el.href));

    const themeUrls = themeUrls1.concat(themeUrls2);
    const themeIds = themeUrls.filter(prod => !!prod).map(prod => {
        const [_, malId] = /\/anime\/genre\/([0-9]*)\/([^\/]*)/gm.exec(prod) as RegExpExecArray;
        return Number(malId);
    })

    enqueueLinks({
        urls: themeUrls,
        label: 'themes'
    })

    const externalLinks = await page.locator('.external_links > a').locator('a').evaluateAll((els: HTMLAnchorElement[]) => els.map(el => el.href)) as string[] | null;

    const results = {
        malId,
        title,
        slug,
        url: request.url,
        score,
        type,
        status,
        episodes,
        source: {
            type: sourceType,
            sources
        },
        season: {
            year,
            season
        },
        producers: producerIds,
        licensors: licensorIds,
        studios: studioIds,
        genres: genreIds,
        themes: themeIds,
        externalLinks
    };

    console.log('anime results', results);
});

router.addHandler("manga", async ({ request, enqueueLinks, page, log }) => {
    
    log.info(`Handling manga URLs`);

    const [_, malId, slug] = /\/manga\/([0-9]*)\/([^\/]*)/gm.exec(request.url) as RegExpExecArray;
    
    //* Selectors
    await page.waitForSelector('div.score-label');
    
    const score = await page.locator('div.score-label').innerText();

    const infoSelector = '#content > table > tbody > tr > td.borderClass > div > div.spaceit_pad';
    
    const title = await page.$eval('span[itemprop="name"]', el => el.firstChild?.textContent);

    await page.waitForSelector(infoSelector);

    const type = (await page.locator(infoSelector).filter({hasText: 'Type:'}).innerText()).replace('Type: ', '').toLowerCase().replace(' ', '_');

    const status = (await page.locator(infoSelector).filter({hasText: 'Status:'}).innerText()).replace('Status: ', '').toLowerCase().replace(' ', '_');

    const chapters = Number((await page.locator(infoSelector).filter({hasText: 'Chapters:'}).innerText()).replace('Chapters: ', '')) || null;

    const volumes = Number((await page.locator(infoSelector).filter({hasText: 'Volumes:'}).innerText()).replace('Volumes: ', '')) || null;

    const serializerUrls = await page.locator(infoSelector).filter({ hasText: 'Serialization:' }).locator('a').evaluateAll((els: HTMLAnchorElement[]) => els.map(el => el.href));
    const serializerIds = serializerUrls.filter(ser => !!ser).map(ser => {
        const [_, malId] = /\/manga\/magazine\/([0-9]*)\/([^\/]*)/gm.exec(ser) as RegExpExecArray;
        return Number(malId);
    })

    enqueueLinks({
        urls: serializerUrls,
        label: 'magazines'
    })

    const genreUrls = await page.locator(infoSelector).filter({ hasText: 'Genres:' }).locator('a').evaluateAll((els: HTMLAnchorElement[]) => els.map(el => el.href));
    const genreIds = genreUrls.filter(prod => !!prod).map(prod => {
        const [_, malId] = /\/manga\/genre\/([0-9]*)\/([^\/]*)/gm.exec(prod) as RegExpExecArray;
        return Number(malId);
    })

    enqueueLinks({
        urls: genreUrls,
        label: 'genres'
    })

    const themeUrls1 = await page.locator(infoSelector).filter({ hasText: 'Themes:' }).locator('a').evaluateAll((els: HTMLAnchorElement[]) => els.map(el => el.href));
    const themeUrls2 = await page.locator(infoSelector).filter({ hasText: 'Theme:' }).locator('a').evaluateAll((els: HTMLAnchorElement[]) => els.map(el => el.href));

    const themeUrls = themeUrls1.concat(themeUrls2);
    const themeIds = themeUrls.filter(prod => !!prod).map(prod => {
        const [_, malId] = /\/manga\/genre\/([0-9]*)\/([^\/]*)/gm.exec(prod) as RegExpExecArray;
        return Number(malId);
    })

    enqueueLinks({
        urls: themeUrls,
        label: 'themes'
    })

    const authorAnchorElements = await page.locator(infoSelector).filter({ hasText: 'Authors:' }).locator('a').evaluateAll((els: HTMLAnchorElement[]) => els);

    const authorUrls = authorAnchorElements.map(el => el.href);

    const authors = authorAnchorElements.forEach(el => {
        const [_, malId] = /\/people\/([0-9]*)\/([^\/]*)/gm.exec(el.href) as RegExpExecArray;
        
        const [__, role] = /\(([^(^)]*)\)/gm.exec(document.evaluate(
            'following-sibling::text()',
            el,
            null,
            XPathResult.STRING_TYPE
        ).stringValue) as RegExpExecArray;

        return { malId, role };
    });

    enqueueLinks({
        urls: authorUrls,
        label: 'authors'
    })

    const externalLinks = await page.locator('.external_links > a').locator('a').evaluateAll((els: HTMLAnchorElement[]) => els.map(el => el.href)) as string[] | null;
    
    const parentStory = await page.locator('table.anime_detail_related_anime > tbody > tr').filter({ hasText: 'Parent story:' }).locator('a').evaluate((el: HTMLAnchorElement) => el.href) as string | null;

    const results = {
        malId,
        title,
        slug,
        url: request.url,
        score,
        type,
        status,
        chapters,
        volumes,
        authors,
        serializers: serializerIds,
        genres: genreIds,
        themes: themeIds,
        parentStory,
        externalLinks
    };

    console.log('anime results', results);
});
