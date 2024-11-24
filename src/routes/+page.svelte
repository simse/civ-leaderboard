<script lang="ts">
	  import { invalidateAll } from '$app/navigation';
    import type { PageData } from './$types';
    import CivBadge from '../components/CivBadge.svelte';
	  import Methodology from '../components/Methodology.svelte';

    let { data }: { data: PageData } = $props();
    const rankings = $derived(data.rankings.rankings);
    const gameResults = $derived(data.rankings.results);

    let reloadDataButtonLabel = $state('Reload data?')
    let showRankDiffDetails = $state<{
        [key: string]: boolean;
    }>({})
    let showRankDetails = $state(false)

    const resetCache = async () => {
        reloadDataButtonLabel = 'Reloading...';
        await fetch('/api/reset-cache');
        await invalidateAll();
        reloadDataButtonLabel = 'Reload data?';
    }

    const round = (num: number): number => {
        return Math.round((num + Number.EPSILON) * 100) / 100;
    }
</script>

<svelte:head>
    <title>Civ 6 Leaderboard</title>
</svelte:head>

<header class="my-12 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Civ Leaderboard</h1>
</header>

<main class=" max-w-3xl mx-auto ">
    <section class="mb-16">
        <table class="min-w-96 border border-zinc-700 bg-zinc-900">
            <thead class="font-bold">
                <tr class="">
                    <td class="p-2 pl-4">#</td>
                    <td class="p-2">Player</td>
                    <td
                      class="text-right pr-4 p-2 underline hover:cursor-pointer"
                      onclick={() => {showRankDetails = !showRankDetails}}
                    >MMR</td>
                </tr>
            </thead>

            <tbody>
                {#each rankings as ranking, index}
                <tr class="hover:bg-yellow-100/10 odd:bg-zinc-800">
                    <td class="pl-4 text-lg w-12 text-zinc-400">{index + 1}</td>
                    <td class="py-2 text-lg ">{ranking.player}</td>
                    <td class="text-right pr-4 py-2">
                        <p class="font-bold text-lg ">{ranking.ranking}</p>

                        {#if showRankDetails}
                        <ul class="text-zinc-300 text-sm">
                            <li>Base Skill (μ): {round(ranking.baseSkill)}</li>
                            <li>Skill Uncertainty (σ): {round(ranking.skillUncertainty)}</li>
                        </ul>
                        {/if}
                    </td>
                </tr>
                {/each}
            </tbody>
        </table>

        <p class="mt-4 text-sm text-zinc-400">Last updated from Google Sheets on {data.cacheTimestamp}. 
            <button class="text-zinc-200 hover:text-zinc-100" onclick={resetCache}>{reloadDataButtonLabel}</button>
        </p>
    </section>

    <Methodology />

    <section class="mb-8">
        <h2 class="text-lg font-bold">Games played</h2>

        {#each gameResults as result}
        <article class="my-4 border border-zinc-700 bg-zinc-900">
            <header class="flex gap-4 text-zinc-300 border-b border-zinc-700 p-2">
                <p class="font-mono">{result.gameId}</p>
                <p>Winner: <strong>{result.winner}</strong></p>
                <p>Turn {result.victoryTurn}</p>
                <p>{result.victoryType}</p>
                <p class="ml-auto">{result.dates}</p>
            </header>

            <table class="w-full">
                <thead class="font-semibold border-b border-dashed border-zinc-700">
                    <tr class="">
                        <td class="p-2 pl-4">#</td>
                        <td class="">Player</td>
                        <td class="">Civ</td>
                        <td class="">Score</td>
                        <td 
                            class="text-right pr-4 p-2 hover:cursor-pointer"
                            onclick={() => {
                                showRankDiffDetails[result.gameId] = !showRankDiffDetails[result.gameId];
                            }}
                        >
                            <span class="underline ">MMR Change</span>
                        </td>
                    </tr>
                </thead>
    
                <tbody>
                    {#each result.placements as p}
                    <tr class="hover:bg-zinc-800 " class:text-zinc-500={p.playerAI}>
                        <td class="pl-4 text-lg w-12 text-zinc-400">{p.placement}</td>
                        <td class="py-2 text-lg w-1/6">{p.player}</td>
                        <td class="w-2/5"><CivBadge civName={p.civ} /></td>
                        <td>{p.score}</td>
                        <td
                            class="text-right pr-4 py-2"
                            
                        >
                            <span
                                class="font-bold text-lg"
                                class:text-red-500={p.diff < 0 && !p.playerAI}
                                class:text-green-500={p.diff > 0 && !p.playerAI}
                            >
                                {p.diff > 0 ? '+' : ''}{p.diff}
                            </span>

                            {#if showRankDiffDetails[result.gameId]}
                            <ul class="text-sm" class:text-zinc-300={!p.playerAI}>
                                <li>
                                    Score Bonus: <strong>{p.weightFactors.scoreBonus * 100}%</strong>
                                </li>
                                <li>
                                    Playtime Penalty: <strong>{round((p.weightFactors.playtimePenalty - 1) * 100)}%</strong>
                                </li>
                            </ul>
                            {/if}
                        </td>
                    </tr>
                    {/each}
                </tbody>
            </table>
        </article>
        {/each}
    </section>
</main>