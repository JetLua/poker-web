<script lang="ts">
  import clsx from 'clsx'
  import {Player, room} from '~/core/simulator.svelte'
  import Card from './Card.svelte'
  import {Key, XboxB} from '$lib/sui/icon'
  import * as store from '~/core/store.svelte'

  interface Props {
    data: Player['state']
    orientation: yew.Orientation
  }
  const {data, orientation}: Props = $props()
</script>

<div class="relative flex flex-col justify-center gap-y-2 items-center p-2">
  <p class="text-white text-sm leading-none monospace">No.{data.index}</p>
  <div class="w-10 aspect-square bg-white rounded-md flex items-start justify-center gap-x bg-[url('/game/avatar/boy-11.png')] bg-center bg-cover bg-no-repeat">
    <!-- {#each data.cards as c}
      <Card class="!w-4"/>
    {/each} -->
    {#if store.user.id === data.id}
      self
    {/if}
  </div>
  <p class="leading-none text-sm text-white monospace">9000</p>
  <section
    class={clsx('absolute flex gap-1', orientation === 'top' || orientation === 'bottom' ? 'w-fit h-fit' : 'h-full w-fit', orientation === 'right' ? 'justify-center items-end right-full flex-col' : orientation === 'left' ? 'justify-center items-start left-full flex-col' : orientation === 'top' ? 'justify-center items-center top-full' : 'justify-center items-center bottom-full')}>
    {#if room.state.owner === data.id}
      <Key class="stroke-white stroke-2 w-6 h-6 block shrink-0"/>
      <XboxB class="stroke-white stroke-2 w-6 h-6 block shrink-0"/>
    {/if}

    {#if room.state.banker === data.id}
      <XboxB class="stroke-white stroke-2 w-6 h-6 block"/>
    {/if}

    <!-- 下注占位符 -->
    {#if data.bet}
      <div class="text-sm w-max flex justify-center items-center gap-x-1 shrink-0">
        <img src="/game/chip.png" class="w-5" alt="chip">
        <p class="text-white text-sm monospace">90</p>
      </div>
    {/if}
  </section>
</div>

<style lang="scss">

</style>
