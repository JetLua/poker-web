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
  <div class="w-10 aspect-square bg-indigo-200 rounded-md flex items-start justify-center gap-x">
    {#each data.cards as c}
      <Card class="!w-4"/>
    {/each}
  </div>
  <p class="leading-none text-sm text-white monospace">9000</p>
  <section
    class:top-full={orientation === 'top'}
    class:left-full={orientation === 'left'}
    class:right-full={orientation === 'right'}
    class:bottom-full={orientation === 'bottom'}
    class:flex-col={orientation === 'left' || orientation === 'right'}
    class={clsx('absolute flex items-center justify-center gap-1', orientation === 'top' || orientation === 'bottom' ? 'w-full h-5' : 'h-full w-5')}>
    {#if room.state.owner === data.id}
      <Key class="stroke-white stroke-2 w-6 h-6 block shrink-0"/>
      <XboxB class="stroke-white stroke-2 w-6 h-6 block shrink-0"/>
    {/if}

    {#if room.state.banker === data.id}
      <XboxB class="stroke-white stroke-2 w-6 h-6 block"/>
    {/if}

    <!-- 下注占位符 -->
    <div class="text-sm aspect-square w-6 bg-center bg-cover bg-no-repeat">
      <p class="flex items-center justify-center font-bold text-white backdrop-blur bg-purple-800/30 backdrop-opacity-50 w-full h-full rounded-full">90</p>
    </div>
  </section>
</div>

<style lang="scss">

</style>
