<script lang="ts">
  import clsx from 'clsx'
  import {Player, room} from '~/core/simulator.svelte'
  import {audio} from '~/core'
  import Card from './Card.svelte'
  import {Button, Digit} from '$lib/sui'
  import {Key, CircleD} from '$lib/sui/icon'
  import * as store from '~/core/store.svelte'

  interface Props {
    data: Player['state']
    orientation: yew.Orientation
  }

  const {data, orientation}: Props = $props()
  const snap = $state({
    holeCards: [
      {ref: undefined as ReturnType<typeof Card>, x: 0, y: 0},
      {ref: undefined as ReturnType<typeof Card>, x: 0, y: 0},
    ],
    avatarRef: undefined as undefined | HTMLElement,

  })

  $effect(() => {
    if (data.bet) {
      audio.play('chip')
    }
  })

  $effect(() => {
    if (room.state.phase !== 'deal') return
    const {innerWidth: w, innerHeight: h} = window

    let r

    r = snap.avatarRef.getBoundingClientRect()

    // 获取中心点
    const c = [(r.left + r.right) / 2, (r.top + r.bottom) / 2]

    for (const card of snap.holeCards) {
      card.x = w / 2 - c[0]
      card.y = h / 2 - c[1]
    }
  })
</script>



<div class="relative flex flex-col justify-center gap-y-2 items-center p-2">
  <!-- 开始按钮 -->
  {#if store.user.id === data.id && data.id === room.state.owner && room.state.phase === 'ready'}
    <Button
      variant="outlined"
      textColor="#fff"
      class="!absolute bottom-[calc(100%_+_2rem)] mb-2"
      onclick={room.start.bind(room)}
    >Start</Button>
  {/if}
  <p class="text-white text-sm leading-none monospace">No.{data.index}</p>
  <div bind:this={snap.avatarRef} class="relative w-10 aspect-square bg-white rounded-md flex items-center justify-center gap-x-1 bg-[url('/game/avatar/boy-11.png')] bg-center bg-cover bg-no-repeat">
    {#each snap.holeCards as c, i (`${c.x}${c.y}${i}`)}
      <Card
        class={clsx('!w-4', room.state.phase !== 'deal' ? 'hidden' : '')}
        bind:this={c.ref}
        --x={`${c.x}px`}
        --y={`${c.y}px`}
      />
    {/each}
    {#if data.countdown}
      <div class="absolute top-0 left-0 text-white bg-black/80 font-bold flex items-center justify-center w-full h-full rounded-md">{data.countdown}</div>
    {/if}
  </div>
  <Digit class="leading-none text-sm text-white monospace" value={data.balance}/>
  <section
    class={clsx('absolute flex gap-1', orientation === 'top' || orientation === 'bottom' ? 'w-fit h-fit' : 'h-full w-fit', orientation === 'right' ? 'justify-center items-end right-full flex-col' : orientation === 'left' ? 'justify-center items-start left-full flex-col' : orientation === 'top' ? 'justify-center items-center top-full' : 'justify-center items-center bottom-full')}>
    {#if room.state.owner === data.id}
      <Key class="stroke-white stroke-2 w-6 h-6 block shrink-0"/>
      <!-- <XboxB class="stroke-white stroke-2 w-6 h-6 block shrink-0"/> -->
    {/if}

    {#if room.state.dealer === data.id}
      <CircleD class="stroke-white stroke-2 w-6 h-6 block"/>
    {/if}

    <!-- 下注占位符 -->
    {#if data.bet}
      <div class="text-sm w-max flex justify-center items-center gap-x-1 shrink-0">
        <div class="aspect-square w-6 bg-[url('/game/chip.png')] bg-center bg-cover bg-no-repeat bg-[length:80%]"></div>
        <Digit class="text-white text-sm monospace" value={data.bet}/>
      </div>
    {/if}
  </section>
</div>

<style lang="scss">

</style>
