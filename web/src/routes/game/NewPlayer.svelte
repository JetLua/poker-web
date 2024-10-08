<script lang="ts">
  import {Player} from '~/core/simulator.svelte'
  interface Props {
    data: Player['state']
  }
  const props: Props = $props()
</script>

<div>
  <div class="w-10 aspect-square bg-indigo-500 rounded-full border-[2px]">
    {props.data.index}
  </div>
</div>
