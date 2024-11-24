<script lang="ts">
    const { civName }: { civName: string } = $props();

    const civs: {
        [key: string]: {
            logo: string;
            borderColour: string;
            textColour: string;
        }
    } = {
        'Babylon': {
            logo: '/leaders/hammurabi.webp',
            borderColour: 'border-blue-900',
            textColour: 'text-blue-300',
        },
        'Germany': {
            logo: '/leaders/frederick_barbarossa.webp',
            borderColour: 'border-zinc-600',
            textColour: 'text-zinc-200'
        },
        'Korea': {
            logo: '/leaders/seondeok.webp',
            borderColour: 'border-purple-900',
            textColour: 'text-purple-300'
        },
        'Georgia': {
            logo: '/leaders/tamar.webp',
            borderColour: 'border-zinc-600',
            textColour: 'text-zinc-200'
        },
        'Byzantine (Theodora)': {
            logo: '/leaders/Theodora_(Civ6).webp',
            borderColour: 'border-purple-600',
            textColour: 'text-purple-300'
        },
        'Mali (Sundiata Keita)': {
            logo: '/leaders/Sundiata_Keita_(Civ6).webp',
            borderColour: 'border-yellow-500',
            textColour: 'text-yellow-200'
        },
        'Hungary': {
            logo: '/leaders/Matthias_Corvinus_(Civ6).webp',
            borderColour: 'border-green-700',
            textColour: 'text-orange-400',
        },
        'China (Wu Zetian)': {
            logo: '/leaders/Wu_Zetian_(Civ6).webp',
            borderColour: 'border-red-700',
            textColour: 'text-yellow-300',
        }
    }

    const knownCiv = (name: string): boolean => {
        return name in civs;
    }

    const civ = (name: string) => {
        if (name in civs) {
            return civs[name];
        }

        return {
            logo: '',
            borderColour: '',
            textColour: ''
        };
    }
</script>

<p class={`flex items-center gap-2 font-bold ${civ(civName).textColour}`}>
    {#if knownCiv(civName)}
    <img 
        class={`h-8 w-8 border-2 rounded-full ${civ(civName).borderColour}`}
        src={civ(civName).logo}
        alt={`${civName} leader portrait`}
        />
    {/if}
    {civName}
</p>