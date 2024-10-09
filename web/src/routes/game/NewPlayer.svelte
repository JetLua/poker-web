<script lang="ts">
  import {Player} from '~/core/simulator.svelte'
  import Card from './Card.svelte'

  interface Props {
    data: Player['state']
  }
  const {data}: Props = $props()
</script>

<div class="flex flex-col justify-center gap-y-2 items-center p-2">
  <p class="text-white text-sm leading-none">player_{data.index}</p>
  <div class="w-10 aspect-square bg-indigo-200 rounded-md flex items-center justify-center gap-x-1">
    {#each data.cards as c}
      <Card class="!flex-1"/>
    {/each}
  </div>
  <p class="leading-none text-sm text-white monospace">9000</p>
</div>

<style lang="scss">

</style>
