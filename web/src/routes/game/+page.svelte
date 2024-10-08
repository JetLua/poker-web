<script lang="ts">
  // import {room, user} from '~/core/store.svelte'
  import Player from './NewPlayer.svelte'
  import {Room} from '~/core/simulator.svelte'

  const room = new Room()

  const snap = $state({
    desktopRef: undefined as undefined | HTMLElement,
  })


  for (const k in room.state.players) {
    const p = room.state.players[k]
    console.log(p.state.index)
  }
</script>


<div class="root w-screen h-screen bg-indigo-100 m-auto mx-[-1rem] relative">
  <div class="desktop absolute m-auto top-0 left-0 right-0 bottom-0" bind:this={snap.desktopRef}>
    <div class="flex flex-col w-fit absolute m-auto top-0 left-0 right-0 bottom-0 h-fit gap-2">
      <div class="flex w-fit h-fit gap-2">
        {#each room.state.cards as card, i (i)}
          <div class="card"></div>
        {/each}
      </div>
      <div class="flex self-center absolute top-full justify-center items-center text-white font-[monospace] bg-black/40 h-7 rounded-md w-fit px-4 mt-2">Pot: 0</div>
    </div>

    <!-- {#each Object.entries(room.players) as [id, player], i (id)}
      {@const total = Object.keys(room.players).length}
      <Player
        r={r / 2}
        index={i - ci}
        total={total}
        banker={room.bankerIndex === i}
        data={player}
      />
    {/each} -->
  </div>

  <!-- 上插槽 -->
  <div class="absolute flex gap-x-2 items-center mx-auto left-0 right-0 top-0 h-fit w-fit bg-indigo-200">
    <Player/>
    <Player/>
    <Player/>
  </div>

  <!-- 左插槽 -->
  <div class="absolute gap-y-2 justify-center flex-col flex left-0 top-0 bottom-0 my-auto w-fit h-fit bg-indigo-200">
    <Player/>
    <Player/>
  </div>

  <!-- 右插槽 -->
  <div class="absolute gap-y-2 justify-center flex-col flex right-0 top-0 bottom-0 my-auto w-fit h-fit bg-indigo-200">
    <Player/>
  </div>

  <!-- 下插槽 -->
  <div class="absolute gap-y-2 justify-center flex-col flex right-0 left-0 bottom-0 mx-auto w-fit h-fit bg-indigo-200">
    <Player/>
  </div>
</div>

<style lang="scss">
  .root {
    background: radial-gradient(circle, #80a8c6, #3b4389);
  }

  .desktop {
    width: 80%;
    max-width: 600px;
    aspect-ratio: 1;
    background-color: transparent;
    border-radius: 50%;
  }

  .card {
    aspect-ratio: 14/19;
    border: 1px dashed #fff;
    border-radius: .2rem;
    width: 2.5rem;
  }
</style>
