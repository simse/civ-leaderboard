import { getRankings } from '$lib/ranking';
import { getGamesCache } from '$lib/sheets';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ }) => {
    const { games, cacheTimestamp } = await getGamesCache()
    
    console.time("calRankings")
    const rankings = getRankings(games);
    console.timeEnd("calRankings")

	return {
        rankings,
        cacheTimestamp,
    };
};