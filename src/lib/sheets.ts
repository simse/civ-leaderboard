import { env } from '$env/dynamic/private';
import { GoogleSpreadsheet } from 'google-spreadsheet';

interface RawGame {
    gameId: string;
    dates?: string;
    player: string;
    civ: string;
    placement: string;
    score: string;
    playtime: string;
    totalPlayers: string;
    victoryType?: 'Science' | 'Religious' | 'Culture';
    victoryTurn?: string;
}

export interface Game {
    gameId: string;
    dates: string;
    victoryType: 'Science' | 'Religious' | 'Culture';
    victoryTurn: number;
    totalPlayers: number;
    players: Player[];
}

export interface Player {
    name: string;
    civ: string;
    placement: number;
    score: number;
    playtime: number;
    ai: boolean;
};

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
            }
        }

        games[gameId].players.push({
            civ: row.get('civ'),
            placement: Number(row.get('placement')),
            name: row.get('player'),
            score: Number(row.get('score')),
            playtime: Number(row.get('playtime')),
            ai: false,
        })
    }

    const result = Object.values(games);

    return result;
}
