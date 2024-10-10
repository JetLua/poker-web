<script lang="ts">
  import {untrack} from 'svelte'
  // import {room, user} from '~/core/store.svelte'
  import Player from './NewPlayer.svelte'
  import * as simulator from '~/core/simulator.svelte'

  const room = simulator.room

  const snap = $state({
    desktopRef: undefined as undefined | HTMLElement,
    /** bottom slots */
    bPlayers: [] as simulator.Player[],
    /** top slots */
    tPlayers: [] as simulator.Player[],
    /** left slots */
    lPlayers: [] as simulator.Player[],
    /** right slots */
    rPlayers: [] as simulator.Player[]
  })

  $effect(() => {
    const players = Object.values(room.state.players)
    players.sort((a, b) => a.state.index - b.state.index)
    const r = (players.length - 1) % 3
    const d = (players.length - 1) / 3 | 0

    let tr = d
    let lr = d

    if (r === 1) tr = d + 1
    else if (r === 2) lr = d + 1

    untrack(() => {
      for (const p of players) {
        if (!snap.bPlayers.length) snap.bPlayers.push(p)
        else if (snap.lPlayers.length < lr) snap.lPlayers.push(p)
        else if (snap.tPlayers.length < tr) snap.tPlayers.push(p)
        else if (snap.rPlayers.length < lr) snap.rPlayers.push(p)
      }
    })
  })



  // for (const k in room.state.players) {
  //   const p = room.state.players[k]
  //   const rad = Math.PI * 2 / room.state.playersCount * p.state.index
  //   if (!rad) snap.bPlayers.push(p)
  //   else if (rad >= Math.PI * .25 && rad <= Math.PI * .75) snap.rPlayers.push(p)
  //   else if (rad >= Math.PI * 1.25 && rad <= Math.PI * 1.75) snap.lPlayers.push(p)
  //   else snap.tPlayers.push(p)
  // }
</script>


<div class="root w-screen h-screen bg-indigo-100 m-auto mx-[-1rem] relative">
  <div class="desktop absolute m-auto top-0 left-0 right-0 bottom-0" bind:this={snap.desktopRef}>
    <div class="flex flex-col gap-2">
      <div class="flex w-fit h-fit gap-2">
        {#each room.state.cards as card, i (i)}
          <div class="card"></div>
        {/each}
      </div>
      <div class="flex self-center justify-center items-center text-white font-[monospace] bg-black/40 h-7 rounded-md w-fit px-4 mt-2">Pot: 0</div>
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
  {#if snap.tPlayers.length}
    <div class="absolute flex gap-x-4 items-center mx-auto left-0 right-0 top-0 h-fit w-fit">
      {#each snap.tPlayers as p}
        <Player
          data={p.state}
          orientation="top"
        />
      {/each}
    </div>
  {/if}

  <!-- 左插槽 -->
  {#if snap.lPlayers.length}
    <div class="absolute gap-y-4 justify-center flex-col-reverse flex left-0 top-0 bottom-0 my-auto w-fit h-fit">
      {#each snap.lPlayers as p}
        <Player
          data={p.state}
          orientation="left"
        />
      {/each}
    </div>
  {/if}

  <!-- 右插槽 -->
  {#if snap.rPlayers.length}
    <div class="absolute gap-y-4 justify-center flex-col flex right-0 top-0 bottom-0 my-auto w-fit h-fit">
      {#each snap.rPlayers as p}
        <Player
          data={p.state}
          orientation="right"
        />
      {/each}
    </div>
  {/if}

  <!-- 下插槽 -->
  {#if snap.bPlayers.length}
    <div class="absolute gap-y-2 justify-center flex-col flex right-0 left-0 bottom-0 mx-auto w-fit h-fit">
      {#each snap.bPlayers as p}
        <Player
          data={p.state}
          orientation="bottom"
        />
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .root {
    background: radial-gradient(circle, #80a8c6, #3b4389);
  }

  .desktop {
    width: fit-content;
    height: fit-content;
    background-color: transparent;
  }

  .card {
    aspect-ratio: 14/19;
    border: 1px dashed #fff;
    border-radius: .2rem;
    width: 2.5rem;
  }
</style>
