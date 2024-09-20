<script lang="ts">
    import Player from './Player.svelte'

  const snap = $state({
    desktopRef: undefined as undefined | HTMLElement,
    pubCards: [1, 2, 3, 4, 5],
    pool: 0,
    players: [
      {banker: true},
      {banker: false},
      {banker: false},
      {banker: false},
      {banker: false},
      {banker: false},
    ] satisfies Array<yew.Player>
  })

  const r = $derived(snap.desktopRef?.offsetWidth ?? 0)
</script>


<div class="w-screen h-screen bg-indigo-100 m-auto mx-[-1rem] relative">
  <div class="desktop absolute m-auto top-0 left-0 right-0 bottom-0" bind:this={snap.desktopRef}>

    <div class="flex flex-col w-fit absolute m-auto top-0 left-0 right-0 bottom-0 h-fit gap-2">
      <div class="flex w-fit h-fit gap-2">
        {#each snap.pubCards as card}
          <div class="card"></div>
        {/each}
      </div>
      <div class="flex self-center absolute top-full justify-center items-center text-white font-[monospace] bg-black/40 h-7 rounded-md w-fit px-4 mt-2">Pot: {snap.pool}</div>
    </div>

    {#each snap.players as player, i}
      {@const total = snap.players.length}
      <Player r={r / 2} index={i} total={total} banker={player.banker}/>
    {/each}
  </div>
</div>

<style lang="scss">
  .desktop {
    width: 80%;
    max-width: 600px;
    aspect-ratio: 1;
    background-color: #206017;
    border-radius: 50%;
    border: .5rem solid #c3a1a1;
  }

  .card {
    aspect-ratio: 14/19;
    border: 1px dashed #fff;
    border-radius: .2rem;
    width: 2.5rem;
  }
</style>
