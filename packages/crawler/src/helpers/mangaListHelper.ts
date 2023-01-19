export const enum MangaListEntryStatus {
    READING,
    COMPLETED,
    ON_HOLD,
    DROPPED,
    PLAN_TO_READ
}

export const mangaListHelper = async (username: string) => {
    const data = [];

    for (let i = 0; ; i++) {
        const a = (await (await fetch(`https://myanimelist.net/mangalist/${username}/load.json?status=7${i > 0 ? `&offset=${i * 300}` : ''}`)).json()) as {
            score: number,
            status: number,
            is_rereading: number,
            num_read_chapters: number,
            num_read_volumes: number,
            manga_num_chapters: number,
            manga_num_volumes: number,
            manga_id: number,
            manga_url: string
        }[];

        if (!a) break;

        data.push(...a)

        if (a.length % 300 !== 0) break;
    }

    return data?.map(({
        score,
        status,
        is_rereading,
        num_read_chapters,
        num_read_volumes,
        manga_num_chapters,
        manga_num_volumes,
        manga_id,
        manga_url
    }) => {
        const [_, slug] = /\/manga\/(?:[0-9]+)\/([^\/]+)/gm.exec(manga_url) as RegExpExecArray;

        let statusString: MangaListEntryStatus = MangaListEntryStatus.READING;

        switch (status) {
            case 1:
                statusString = MangaListEntryStatus.READING;
                break;
            case 2:
                statusString = MangaListEntryStatus.COMPLETED;
                break;
            case 3:
                statusString = MangaListEntryStatus.ON_HOLD;
                break;
            case 4:
                statusString = MangaListEntryStatus.DROPPED;
                break;
            case 6:
                statusString = MangaListEntryStatus.PLAN_TO_READ;
                break;
            default:
                break;
        }
        
        return {
            malId: manga_id,
            slug, 
            score,
            status: statusString,
            rereading: is_rereading !== 0,
            progress: {
                chapters: {
                    read: num_read_chapters,
                    total: manga_num_chapters === 0 ? null : manga_num_chapters
                },
                volumes: {
                    read: num_read_volumes,
                    total: manga_num_volumes === 0 ? null : manga_num_volumes
                }
            }
        }
    });
}
