<script lang="ts">
  import clsx from 'clsx'
  import {onMount} from 'svelte'
  import {slide} from 'svelte/transition'
  import {delay, store} from '~/core'
  import {Key} from '$lib/sui/icon'
  import {Button} from '$lib/sui'

  interface Props {
    index: number
    r: number
    total: number
    banker: boolean
    data: yew.Room['players'][string]
  }

  const {index, r, total, data, banker}: Props = $props()

  const pos = $derived.by(() => {
    const rad = Math.PI * 2 / total * index

    const x = Math.sin(rad) * r
    const y = Math.cos(rad) * r

    return [x, y, rad / Math.PI * -180]
  })

  const room = store.room
  const owner = $derived.by(() => {
    return room.ownerId === data.id
  })

  let bet = $state(false)
</script>

<div class="root w-fit h-fit m-auto absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center"
  style:--x={`${pos[0]}px`} style:--y={`${pos[1]}px`} style:--angle={`${pos[2]}deg`}>
  <div class="w-10 aspect-square">
    {#if bet}
      <div transition:slide class="w-full h-full rounded-full overflow-hidden bg-cover bg-center bg-no-repeat bg-[url(/game/chip.png)]"><p class="backdrop-blur bg-purple-800/30 backdrop-opacity-50 w-full h-full flex items-center justify-center font-bold monospace text-white">15</p></div>
    {/if}
  </div>

  <div class="flex gap-2 mt-2 hidden">
    <div class="card"></div>
    <div class="card"></div>
  </div>
  <div class="relative w-12 border-2 border-solid border-white aspect-square rounded-full bg-indigo-500 mt-2"></div>
  <p class="flex items-center justify-center mt-1">
    {#if banker}<img class="w-2.5 mr-2" src="/game/banker.png" alt="banker"/>{/if}
    {#if owner}<Key class="stroke-[2px] mr-2 w-5 stroke-white"/>{/if}
    <span class="monospace text-white">{data.name || `Player_${data.index}`}</span>
  </p>

  <!-- 如果是房主且可以开始 -->
  {#if room.phase === 'ready' && owner && data.id === store.user.id && room.playersCount > 1}
    <Button class="text-xs mt-2" variant="outlined"
      onclick={() => store.socket.send({type: 'game:start'})}
    >Start</Button>
  {/if}
</div>

<style lang="scss">
  .root {
    transform: translate(var(--x), var(--y)) rotate(var(--angle));
  }

  .card {
    aspect-ratio: 14/19;
    width: 2.5rem;
    background: url("/game/card-back.png") center / cover no-repeat;
  }
</style>
