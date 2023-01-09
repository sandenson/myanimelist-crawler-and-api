import { Dictionary, Request } from "crawlee";
import { Page } from "playwright";

export const producerHandler = async ({request, page}: { request: Request<Dictionary<any>>, page: Page }) => {
    const [_, malId, slug] = /\/anime\/producer\/([0-9]*)\/([^\/]*)/gm.exec(request.url) as RegExpExecArray;

    //* Selectors
    await page.waitForSelector('#contentWrapper');
    const name = await page.locator('#contentWrapper > div > h1').innerText();

    const infoSelector = '#content > div.content-left';
    const spaceitPadSelector = infoSelector + ' > .mb16 > .spaceit_pad';
    await page.waitForSelector(infoSelector);

    const japaneseName = (await page.locator(spaceitPadSelector).filter({ hasText: 'Japanese:' }).innerText()).replace('Japanese: ', '').trim();
    
    const establishment = new Date((await page.locator(spaceitPadSelector).filter({ hasText: 'Established:' }).innerText()).replace('Established: ', '').trim());

    let description: string | null = null;

    try {
        description = await page.locator(spaceitPadSelector + ' > span:not([class])').innerText();
    } catch (error) {}

    const externalLinks = await page.locator(infoSelector + ' > div.user-profile-sns.mb16 > span > a').evaluateAll((els: HTMLAnchorElement[]) => els.map(el => el.href));

    return {
        malId,
        slug,
        url: request.url,
        name,
        japaneseName,
        establishment,
        description,
        externalLinks
    }
};