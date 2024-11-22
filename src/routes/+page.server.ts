import { getRankings } from '$lib/ranking';
import { getGames, type Game } from '$lib/sheets';
import type { PageServerLoad } from './$types';

interface CacheMetadata {
    timestamp: string;
}

let cache: Game[] | null = null;
let cahceTimestamp: string | null = null;

const getGamesCached = async (): Promise<{
    games: Game[];
    cacheTimestamp: string;
}> => {
    // load games from Google Sheets
    if (cache !== null) {
        return {
            games: cache,
            cacheTimestamp: cahceTimestamp || 'uhhhh not sure lol',
        }
    }

    const games = await getGames();
    const metadata: CacheMetadata = {
        timestamp: new Date().toLocaleString(),
    }

    cache = games;
    cahceTimestamp = metadata.timestamp;

    return {
        games,
        cacheTimestamp: metadata.timestamp,
    }
};

export const load: PageServerLoad = async ({ }) => {
    const { games, cacheTimestamp } = await getGamesCached()

    console.log(games, cacheTimestamp)
    
    
    const rankings = await getRankings(games);

	return {
        rankings,
        cacheTimestamp,
    };
};