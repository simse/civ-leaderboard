export type VictoryType = 'Science' | 'Religious' | 'Culture' | 'Score' | 'Domination' | 'Diplomatic';

export interface Game {
	gameId: string;
	dates: string;
	victoryType: VictoryType;
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
}