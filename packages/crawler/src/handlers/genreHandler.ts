import { Dictionary, Request } from "crawlee";
import { Page } from "playwright";

export const genreHandler = async ({request, page}: { request: Request<Dictionary<any>>, page: Page }) => {
    const [_, malId, slug] = /\/(?:anime|manga)\/genre\/([0-9]*)\/([^\/]*)/gm.exec(request.url) as RegExpExecArray;

    //* Selectors
    await page.waitForSelector('#contentWrapper > div:nth-child(1) > h1.h1');
    const name = await (await page.locator('#contentWrapper > div:nth-child(1) > h1.h1').innerText()).replace('Anime', '').trim();

    return {
        malId,
        slug,
        url: request.url,
        name
    }
};