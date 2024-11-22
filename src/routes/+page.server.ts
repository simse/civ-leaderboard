import { getRankings } from '$lib/ranking';
import { getGames, type Game } from '$lib/sheets';
import type { PageServerLoad } from './$types';

interface CacheMetadata {
    timestamp: string;
}

const getGamesCached = async (kv?: KVNamespace): Promise<{
    games: Game[];
    cacheTimestamp: string;
}> => {
    // load games from Google Sheets
    if (kv) {
        const cacheContent = await kv.getWithMetadata<Game[], CacheMetadata>("games_from_google_sheets", "json")

        // console.log(cacheContent)

        if (cacheContent.value !== null) {
            return {
                games: cacheContent.value,
                cacheTimestamp: cacheContent.metadata?.timestamp || 'uhhhh not sure lol',
            }
        }
    }

    const games = await getGames();
    const metadata: CacheMetadata = {
        timestamp: new Date().toLocaleString(),
    }


    // save to cache
    if (kv) {
        await kv.put("games_from_google_sheets", JSON.stringify(games), {
            metadata,
        })

    }

    return {
        games,
        cacheTimestamp: metadata.timestamp,
    }
};

export const load: PageServerLoad = async ({ platform }) => {
    const { games, cacheTimestamp } = await getGamesCached(platform?.env?.KV)
    
    
    const rankings = await getRankings(games);

	return {
        rankings,
        cacheTimestamp,
    };
};