<script lang="ts">
    let collapsed = $state(true);
</script>

<section class="my-8 bg-zinc-900 border border-zinc-700">
    <button class="font-bold text-lg hover:cursor-pointer w-full text-left p-4" onclick={() => collapsed = !collapsed}>
        <span class="w-6 inline-block">
        {#if collapsed}
        ▶
        {:else}
        ▼
        {/if}
        </span>
        How are rankings calculated?
    </button>

    {#if !collapsed}
    <div class="p-4">
        <p class="mb-2">Everyone starts with a base MMR of <strong>100</strong>.</p>
        <p class="mb-2">After every game, a new MMR will be calculated based on your placement.</p>
        <p class="mb-2">You receive a <strong class="text-red-400">50% penalty</strong> for every 1000 hours of playtime.</p>
        <p class="mb-2">
            And you gain up to a <strong class="text-green-400">20% bonus</strong> for getting a score above 1000.
            <span class="text-sm text-zinc-300">0% bonus at 1000, up to 20% at 2000.</span>
        </p>
        <p class="mb-2">To see which factors impacted an MMR change, click on <strong>MMR Change</strong> in the game overviews below.</p>
        <hr class="my-4 border-zinc-700" />
        <p class="mb-2">How much MMR you lose or gain is based on who you beat.</p>
        <p class="mb-2">If you usually beat <strong>Player A</strong>, beating them again is expected. However, if you lose to <strong>Player A</strong>, you will lose more MMR than if you lost to someone you typically don't beat.</p>
        <p>The system is designed to reward players doing better than expected, and punish those doing worse.</p>
    </div>
    {/if}
</section>