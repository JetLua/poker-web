<script lang="ts">
  import {Button} from '$lib/sui'
    import {EyeOff, Lock} from '~/lib/sui/icon'

  const snap = $state({
    desktops: [{
      id: crypto.randomUUID(),
      users: 10,
      capcity: 10,
      started: false,
      visitable: false,
      password: true
    },{
      id: crypto.randomUUID(),
      users: 5,
      capcity: 5,
      started: true,
      visitable: true,
      password: false
    }]
  })
</script>

<div class="m-auto w-main">
  <div class="border-b border-solid border-indigo-300 py-2 flex justify-between">
    <h3 class="text-[2rem] font-bold text-gradient bg-gradient-to-r from-cyan-500 to-lime-500">Holdem Poker</h3>
    <Button variant="outlined">Create Room</Button>
  </div>
  <div class="grid grid-cols-2 mt-4 gap-4 md:grid-cols-3 lg:grid-cols-6">
    {#each snap.desktops as item (item.id)}
      {@const joinable = item.users < item.capcity && !item.started}
      {@render desktop(item, {joinable})}
    {/each}
  </div>
</div>

{#snippet desktop(data: typeof snap.desktops[number], opts: {joinable: boolean})}
  <div class="group w-full aspect-square rounded-lg bg-slate-400 flex flex-col justify-end bg-[url(/game/desktop.webp)] bg-center bg-cover bg-no-repeat overflow-hidden cursor-pointer relative">
    {#if data.password}
      <Lock class="stroke-white stroke-[2px] absolute top-2 right-2"/>
    {/if}
    {#if !data.visitable}
      <EyeOff class="stroke-white stroke-[2px] absolute top-2 left-2"/>
    {/if}
    <div class="bg-cyan-400 bg-opacity-30 p-2 text-white backdrop-blur">
      <p class="font-[monospace] text-xs">Players: {data.users}/{data.capcity}</p>
      <p class="font-[monospace] text-xs">Status: {data.started ? 'started' : 'waiting'}</p>
    </div>

    {#if opts.joinable || data.visitable}
      <div class="backdrop-blur w-full h-full absolute transition-transform translate-y-[100%] group-hover:translate-y-0 flex flex-col items-center justify-center gap-y-2">
        <p class="text-white font-bold px-4 h-8 leading-8 hover:bg-fuchsia-400 hover:rounded-[2.5rem]">Visit</p>
        <p class="h-[1px] w-10 border border-solid border-white"></p>
        <p class="text-white font-bold px-4 h-8 leading-8 hover:bg-lime-500 hover:rounded-[2.5rem]">Join</p>
      </div>
    {/if}
    </div>
{/snippet}
