<script lang="ts">
  import {Button, AsButton} from '$lib/sui'

  const snap = $state({
    items: [{
      name: 'Holdem Poker',
      cover: '/game/holdem.webp',
      players: 0,
      path: '/holdem'
    }]
  })

  function handle() {

  }
</script>

<div class="max-w-[1080px] m-auto">
  <h3 class="border-b border-solid border-indigo-300 py-2">Multiplayer game</h3>
  <div class="grid gap-2 grid-cols-2 md:grid-cols-4 md:gap-4 mt-4">
    {#each snap.items as k (k.name)}
      {@render item(k, handle)}
    {/each}
  </div>
  <div class="mt-4 hidden">
    <Button variant="outlined" textColor="#4285f9" class="flex items-center gap-x-2">
      <img class="w-5" src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA" alt="google"/>
      <span>Google</span>
    </Button>
  </div>
</div>

{#snippet item(opts: typeof snap.items[0], handle: () => void)}
  <a href={opts.path} class="cursor-pointer">
    <div class="aspect-square w-full bg-center bg-no-repeat bg-cover rounded-lg"
      style:background-image={`url(${opts.cover})`}>
    </div>
    <p class="font-bold text-lime-500 my-2">{opts.name}</p>
    <p class="font-[monospace] text-indigo-500">Online users: {opts.players}</p>
  </a>
{/snippet}

<style lang="scss">
  h3 {
    font-size: 2rem;
    font-weight: bold;
    background: -webkit-linear-gradient(right, #e34b4b, #35aeaa, #ace04a);
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
</style>
