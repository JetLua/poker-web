<script lang="ts">
  import {goto} from '$app/navigation'
  import {Button, AsButton, Input, Switch} from '$lib/sui'
  import {EyeOff, Lock} from '$lib/sui/icon'

  let dialogRef: HTMLDialogElement

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

  function onVisit(id: string) {
    goto(`/holdem/game?id=${id}&action=visit`)
  }

  function onJoin(id: string) {
    goto(`/holdem/game?id=${id}&action=join`)
  }

  function showModal() {
    dialogRef.showModal()
  }

  function cancel() {
    dialogRef.close()
  }

  function createRoom() {

  }
</script>

<div class="m-auto w-main">
  <div class="border-b border-solid border-indigo-300 py-2 flex justify-between">
    <h3 class="text-[2rem] font-bold text-gradient bg-gradient-to-r from-cyan-500 to-lime-500">Holdem Poker</h3>
    <Button variant="outlined" onclick={showModal}>Create Room</Button>
  </div>
  <div class="grid grid-cols-2 mt-4 gap-4 md:grid-cols-3 lg:grid-cols-6">
    {#each snap.desktops as item (item.id)}
      {@const joinable = item.users < item.capcity && !item.started}
      {@render desktop(item, {joinable})}
    {/each}
  </div>
</div>

<dialog bind:this={dialogRef} class="rounded-md backdrop-blur bg-inidigo-400/40 backdrop-opacity-50">
  <div class="p-4 rounded-md w-[20rem]">
    <div class="flex items-center justify-between">
      <span class="text-teal-500 monospace">Allow watching</span>
      <Switch checked/>
    </div>
    <p class="text-sm monospace text-pink-500 mt-4">Password:</p>
    <Input class="w-full" type="password" placeholder="Empty means no password required"/>
    <div class="flex items-center mt-4 justify-end">
      <Button variant="text" class="text-sm" textColor="#999" onclick={cancel}>Cancel</Button>
      <Button variant="text" class="text-sm" onclick={createRoom}>Create</Button>
    </div>
  </div>
</dialog>

{#snippet desktop(data: typeof snap.desktops[number], opts: {joinable: boolean})}
  <div class="group w-full aspect-square rounded-lg bg-slate-400 flex flex-col justify-end bg-[url(/game/desktop.webp)] bg-center bg-cover bg-no-repeat overflow-hidden relative">
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
        <AsButton
          onclick={() => onVisit(data.id)}
          class="text-white font-bold px-4 h-8 leading-8 hover:bg-fuchsia-400 hover:rounded-[2.5rem] cursor-pointer"
        >Visit</AsButton>
        {#if opts.joinable}
          <p class="h-[1px] w-10 border border-solid border-white"></p>
          <AsButton
            onclick={() => onJoin(data.id)}
            class="text-white font-bold px-4 h-8 leading-8 hover:bg-lime-500 hover:rounded-[2.5rem] cursor-pointer"
          >Join</AsButton>
        {/if}
      </div>
    {/if}
    </div>
{/snippet}

<style lang="scss">

</style>
