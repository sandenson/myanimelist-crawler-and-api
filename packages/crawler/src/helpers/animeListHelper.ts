export const enum AnimeListEntryStatus {
    WATCHING,
    COMPLETED,
    ON_HOLD,
    DROPPED,
    PLAN_TO_WATCH
}

export const animeListHelper = async (username: string) => {
    const data = [];

    for (let i = 0; ; i++) {
        const a = (await (await fetch(`https://myanimelist.net/animelist/${username}/load.json?status=7${i > 0 ? `&offset=${i * 300}` : ''}`)).json()) as {
            score: number,
            status: number,
            is_rewatching: number,
            num_watched_episodes: number,
            anime_num_episodes: number,
            anime_id: number,
            anime_url: string
        }[];

        if (!a) break;

        data.push(...a)

        if (a.length % 300 !== 0) break;
    }

    return data?.map(({
        score,
        status,
        is_rewatching,
        num_watched_episodes,
        anime_num_episodes,
        anime_id,
        anime_url
    }) => {
        const [_, slug] = /\/anime\/(?:[0-9]+)\/([^\/]+)/gm.exec(anime_url) as RegExpExecArray;

        let statusString: AnimeListEntryStatus = AnimeListEntryStatus.WATCHING;

        switch (status) {
            case 1:
                statusString = AnimeListEntryStatus.WATCHING;
                break;
            case 2:
                statusString = AnimeListEntryStatus.COMPLETED;
                break;
            case 3:
                statusString = AnimeListEntryStatus.ON_HOLD;
                break;
            case 4:
                statusString = AnimeListEntryStatus.DROPPED;
                break;
            case 6:
                statusString = AnimeListEntryStatus.PLAN_TO_WATCH;
                break;
            default:
                break;
        }
        
        return {
            malId: anime_id,
            slug, 
            score,
            status: statusString,
            rewatching: is_rewatching !== 0,
            progress: {
                watched: num_watched_episodes,
                total: anime_num_episodes === 0 ? null : anime_num_episodes
            }
        }
    });
}
