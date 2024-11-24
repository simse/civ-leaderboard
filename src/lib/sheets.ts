import { env } from '$env/dynamic/private';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import type { VictoryType, Game } from "$lib/types";
import cache from './cache';

interface RawGame {
	gameId: string;
	dates?: string;
	player: string;
	civ: string;
	placement: string;
	score: string;
	playtime: string;
	totalPlayers: string;
	victoryType?: VictoryType;
	victoryTurn?: string;
}

const doc = new GoogleSpreadsheet(env.SHEET_ID || '', { apiKey: env.GOOGLE_API_KEY || '' });

export const getGames = async (): Promise<Game[]> => {
	await doc.loadInfo();
	const sheet = doc.sheetsByTitle['Games'];

	const rows = await sheet.getRows<RawGame>();

	const games: {
		[key: string]: Game;
	} = {};

	for (const row of rows) {
		const gameId = row.get('gameId');

		if (!(gameId in games)) {
			games[gameId] = {
				dates: row.get('dates'),
				victoryTurn: row.get('victoryTurn'),
				victoryType: row.get('victoryType'),
				totalPlayers: Number(row.get('totalPlayers')),
				gameId: gameId,
				players: []
			};
		}

		games[gameId].players.push({
			civ: row.get('civ'),
			placement: Number(row.get('placement')),
			name: row.get('player'),
			score: Number(row.get('score')),
			playtime: Number(row.get('playtime')),
			ai: false
		});
	}

    return Object.values(games);
};

export const getGamesCache = async (): Promise<{
	games: Game[],
	cacheTimestamp: string,
}> => {
	if (cache.has("games")) {
		return {
			games: cache.get<Game[]>("games") || [],
			cacheTimestamp: cache.get<string>("games_cache_timestamp") || "uhhh not sure",
		}
	}

	const games = await getGames();
	const cacheTimestamp = new Date().toLocaleString();

	cache.set<Game[]>("games", games);
	cache.set<string>("games_cache_timestamp", cacheTimestamp);

	return {
		games,
		cacheTimestamp,
	}
};

export const clearGamesCache = () => {
	cache.del(["games", "games_cache_timestamp"]);
};