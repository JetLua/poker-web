<script lang="ts">
  import {untrack} from 'svelte'
  import {slide} from 'svelte/transition'
  import * as simulator from '~/core/simulator.svelte'
  import {audio, delay, store} from '~/core'
  import Player from './NewPlayer.svelte'
  import Card from './Card.svelte'
  import Digit from '$lib/sui/Digit.svelte'

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
    rPlayers: [] as simulator.Player[],

    dealCount: 0
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

    // 重新排序当前用户在第一个
    const i = players.findIndex(p => p.state.id === store.user.id)

    // 小于 i 的放到后面
    const parts = players.splice(0, i)

    players.push(...parts)

    untrack(() => {
      for (const p of players) {
        if (!snap.bPlayers.length) snap.bPlayers.push(p)
        else if (snap.lPlayers.length < lr) snap.lPlayers.push(p)
        else if (snap.tPlayers.length < tr) snap.tPlayers.push(p)
        else if (snap.rPlayers.length < lr) snap.rPlayers.push(p)
      }
    })
  })

  $effect(() => {
    if (room.state.phase !== 'deal') return
    if (snap.dealCount !== room.state.playersCount) return

    untrack(async () => {
      for (const c of room.state.cards) {
        c.placeholder = false
        audio.play('slide')
        await delay(.2)
      }
    })
  })

  const pot = $derived.by(() => {
    let v = 0
    for (const t of room.state.turns) {
      for (const k in t) {
        v += t[k]
      }
    }
    return v
  })
</script>

<div class="root w-screen h-dvh bg-indigo-100 m-auto mx-[-1rem] relative">
  <div class="w-fit h-fit absolute m-auto top-0 left-0 right-0 bottom-0" bind:this={snap.desktopRef}>
    <section class="absolute bottom-full w-full text-center text-white/50 mb-4 flex flex-col gap-y-2">
      {#each room.state.logs as l, i (`${l}${i}`)}
        <p in:slide={{duration: 3e2}}>{l}</p>
      {/each}
    </section>
    <div class="flex flex-col gap-2">
      <div class="flex w-fit h-fit gap-2">
        {#each room.state.cards as card, i (i)}
          <Card
            placeholder={card.placeholder}
            type="public"
            num={card.num}
            suit={card.suit}
            showdown={!!card.suit}
          />
        {/each}
      </div>
      <div class="flex self-center justify-center items-center text-white font-[monospace] bg-black/40 h-7 rounded-md w-fit px-4 mt-2">Pot: <Digit value={pot}/></div>
    </div>
  </div>

  <!-- 上插槽 -->
  {#if snap.tPlayers.length}
    <div class="absolute flex gap-x-8 items-center mx-auto left-0 right-0 top-0 h-fit w-fit">
      {#each snap.tPlayers as p (p.state.id)}
        <Player
          data={p.state}
          orientation="top"
          onDeal={() => snap.dealCount++}
        />
      {/each}
    </div>
  {/if}

  <!-- 左插槽 -->
  {#if snap.lPlayers.length}
    <div class="absolute gap-y-4 justify-center flex-col-reverse flex left-0 top-0 bottom-0 my-auto w-fit h-fit">
      {#each snap.lPlayers as p (p.state.id)}
        <Player
          data={p.state}
          orientation="left"
          onDeal={() => snap.dealCount++}
        />
      {/each}
    </div>
  {/if}

  <!-- 右插槽 -->
  {#if snap.rPlayers.length}
    <div class="absolute gap-y-4 justify-center flex-col flex right-0 top-0 bottom-0 my-auto w-fit h-fit">
      {#each snap.rPlayers as p (p.state.id)}
        <Player
          data={p.state}
          orientation="right"
          onDeal={() => snap.dealCount++}
        />
      {/each}
    </div>
  {/if}

  <!-- 下插槽 -->
  {#if snap.bPlayers.length}
    <div class="absolute gap-y-2 justify-center flex-col flex right-0 left-0 bottom-0 mx-auto w-fit h-fit">
      {#each snap.bPlayers as p (p.state.id)}
        <Player
          data={p.state}
          orientation="bottom"
          onDeal={() => snap.dealCount++}
        />
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .root {
    background: radial-gradient(circle, #80a8c6, #3b4389);
  }
</style>
