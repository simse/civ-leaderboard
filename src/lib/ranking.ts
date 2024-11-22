import { Rating, TrueSkill } from 'ts-trueskill';
import type { Game, Player } from './sheets';

interface Ranking {
    player: string;
    ranking: number;
    gamesPlayed: number;
}

interface Placement {
    player: string;
    playerAI: boolean;
    diff: number;
    placement: number;
    civ: string;
    score: number;
    weightFactors: {
        scoreBonus: number;
        playtimePenalty: number;
        weightedRank: number;
    }
}

interface GameResult {
    winner: string;
    gameId: string;
    dates: string;
    victoryTurn: number;
    victoryType: string;
    placements: Placement[];
}

const trueSkill = new TrueSkill(25, 8.333333333333334, 4.166666666666667, 0.08333333333333334, 0)

export const round = (num: number): number => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
     * Calculate weighted rank based on placement, score, and playtime
     * Lower weighted rank = better performance
     */
const calculateWeightedRank = (
    placement: number,
    score: number,
    playtime: number,
): {
    scoreBonus: number;
    playtimePenalty: number;
    weightedRank: number;
} => {
    // Score bonus: up to 10% better rank for scores above 1000
    // No penalty for scores below 1000
    const scoreBonus = score > 1000 
        ? Math.min((score - 1000) / 1000, 0.20) // Cap at 10% bonus
        : 0;
    
    // Playtime penalty (15% per 1000 hours)
    const playtimePenalty = 1 + (playtime / 1000) * 0.50;
    
    // Combine factors to get weighted rank
    // Base rank is the placement, improved by score bonus, worsened by playtime
    return {
        weightedRank: placement * (1 - scoreBonus) * playtimePenalty,
        scoreBonus: round(scoreBonus),
        playtimePenalty: round(playtimePenalty),
    };
};

const createAIPLayers = (players: Player[], totalPlayers: number): Player[] => {
    const newPlayers = players;

    for (let placement = 1; placement <= totalPlayers; placement++) {
        if (!newPlayers.find(player => player.placement === placement)) {
            newPlayers.push({
                ai: true,
                civ: '',
                name: 'AI ' + placement.toString(),
                placement,
                playtime: 0,
                score: 500,
            })
        }
    }

    return newPlayers;
}

export const getRankings = (games: Game[]): {
    rankings: Ranking[],
    results: GameResult[],
} => {
    const results: GameResult[] = [];
    const playerRankings = new Map<string, Rating>();
    const playerGamesPlayed = new Map<string, number>();

    for (const game of games) {
        const players = createAIPLayers(game.players, game.totalPlayers);

        // Add any new players to rankings
        for (const player of players) {
            if (!playerRankings.has(player.name)) {
                playerRankings.set(player.name, new Rating());
            }
            if (!playerGamesPlayed.has(player.name)) {
                playerGamesPlayed.set(player.name, 0);
            }

            // console.log(player.name, player.playtime)
        }

        // Sort players by placement and calculate weighted ranks
        const sortedPlayers = players.toSorted((a, b) => a.placement - b.placement);
        const weightedRanks = sortedPlayers.map(player => 
            calculateWeightedRank(
                player.placement,
                player.score,
                player.playtime,
            )
        );

        // Create arrays for TrueSkill calculation
        const currentRatings = sortedPlayers.map(player => ([
            playerRankings.get(player.name)
        ]));

        // Calculate updated rankings using weighted ranks
        const rankings = trueSkill.rate(currentRatings, null,  weightedRanks.map(rank => [rank.weightedRank]));

        const placements: Placement[] = [];

        // Apply new rankings
        sortedPlayers.forEach((player, index) => {
            // Calculate diff
            const beforeRank = ratingToElo(playerRankings.get(player.name));
            const afterRank = ratingToElo(rankings[index][0]);

            placements.push({
                player: player.name,
                diff: afterRank - beforeRank,
                weightFactors: weightedRanks[index],
                placement: player.placement,
                playerAI: player.ai,
                civ: player.civ,
                score: player.score,
            });

            playerRankings.set(player.name, rankings[index][0]);
            playerGamesPlayed.set(
                player.name,
                (playerGamesPlayed.get(player.name) || 0) + 1
            );
        });

        results.push({
            gameId: game.gameId,
            winner: sortedPlayers[0].name,
            placements,
            dates: game.dates,
            victoryTurn: game.victoryTurn,
            victoryType: game.victoryType,
        });

        // remove AI players from rankings map
        for (const name of playerRankings.keys()) {
            if (name.includes("AI")) {
                playerRankings.delete(name)
            }
        }

        // break;
    }

    const rankings: Ranking[] = Array.from(playerRankings.keys()).map((playerName) => {
        const ranking = playerRankings.get(playerName);
        const gamesPlayed = playerGamesPlayed.get(playerName) || 0;

        return {
            player: playerName,
            gamesPlayed: gamesPlayed,
            ranking: ratingToElo(ranking),
        };
    });

    return {
        rankings: rankings.toSorted((a, b) => b.ranking - a.ranking),
        results: results.toReversed(),
    };
};

export const ratingToElo = (rating?: Rating): number => {
    if (!rating) return 0;

    // Convert the conservative rating (μ - 3σ) to a familiar scale
    // Starting from base of 1000, similar to ELO
    const BASE_RATING = 100;
    const SCALE_FACTOR = 1.5; // Adjust this to change the spread of ratings
    
    // Use conservative rating (μ - 3σ) to account for uncertainty
    const conservativeRating = rating.mu - 3 * rating.sigma;
    //                                                ^^^^^ WHAT THE SIGMA!
    
    // Scale the rating to be around 1000-2000
    return Math.round(BASE_RATING + (conservativeRating * SCALE_FACTOR));
}