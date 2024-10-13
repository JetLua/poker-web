<script lang="ts">
  import {onMount} from 'svelte'
  import {goto} from '$app/navigation'
  import {Button, AsButton, Input, Switch, toast} from '$lib/sui'
  import {EyeOff, Lock} from '$lib/sui/icon'
  import {store, sync} from '~/core'
  import * as api from '~/api'

  let dialogRef: HTMLDialogElement

  const snap = $state({
    rooms: [] as yew.Room[],

    roomConf: {
      visitable: true,
      capcity: '4',
      password: ''
    },

    pending: {
      createRoom: false,
    }
  })

  function onVisit(id: string) {
    // goto(`/game?id=${id}&action=visit`)
  }

  async function onJoin(id: string) {
    const r = await sync(api.room.join(id))
    if (r[1]) return toast.error(r[1])
    goto(`/game?id=${id}`)
  }

  function showModal() {
    dialogRef.showModal()
  }

  function cancel() {
    dialogRef.close()
  }

  async function createRoom() {
    snap.pending.createRoom = true
    const r = await sync(api.room.create({
      pid: store.user.id,
      capcity: +snap.roomConf.capcity,
      password: snap.roomConf.password,
      visitable: snap.roomConf.visitable
    }))
    snap.pending.createRoom = false
    if (r[1]) return toast.error(r[1])
    dialogRef.close()
    loadRooms()
  }

  async function loadRooms() {
    const r = await sync(api.room.get())
    if (r[1]) return toast.error(r[1])
    // console.log(r[0])
    snap.rooms = r[0]
  }

  onMount(() => {
    loadRooms()
  })
</script>

<div class="m-auto w-main">
  <div class="border-b border-solid border-indigo-300 py-2 flex justify-between">
    <h3 class="text-[2rem] font-bold text-gradient bg-gradient-to-r from-cyan-500 to-lime-500">Texas Holdem Poker</h3>
    {#if store.user.id}<Button variant="outlined" onclick={showModal}>Create Room</Button>{/if}
  </div>
  <div class="grid grid-cols-2 mt-4 gap-4 md:grid-cols-3 lg:grid-cols-6">
    {#each snap.rooms as item (item.id)}
      {@render room(item)}
    {/each}
  </div>
</div>

<dialog bind:this={dialogRef} class="rounded-md backdrop-blur bg-inidigo-400/40 backdrop-opacity-50">
  <div class="p-4 rounded-md w-[20rem]">
    <div class="flex items-center justify-between">
      <span class="text-teal-500 monospace">Allow watching</span>
      <Switch bind:checked={snap.roomConf.visitable}/>
    </div>
    <p class="text-sm monospace text-pink-500 mt-4">Capcity(2~10):</p>
    <Input
      bind:value={snap.roomConf.capcity}
      onblur={() => {
        const v = +snap.roomConf.capcity
        if (v > 1 && v < 11) snap.roomConf.capcity = `${v | 0}`
        else snap.roomConf.capcity = '4'
      }}
      class="w-full"
      type="text"
      placeholder="Default to 4 players if empty"
    />
    <p class="text-sm monospace text-pink-500 mt-4">Password:</p>
    <Input
      bind:value={snap.roomConf.password}
      class="w-full"
      type="password"
      placeholder="Empty means no password required"
    />
    <div class="flex items-center mt-4 justify-end">
      {#if !snap.pending.createRoom}
        <Button
          variant="text"
          class="text-sm"
          textColor="#999"
          onclick={cancel}
        >Cancel</Button>
      {/if}
      <Button variant="text" class="text-sm" onclick={createRoom} loading={snap.pending.createRoom}>Create</Button>
    </div>
  </div>
</dialog>

{#snippet room(data: typeof snap.rooms[number])}
  <div class="group w-full aspect-square rounded-lg bg-slate-400 flex flex-col justify-end bg-[url(/game/desktop.webp)] bg-center bg-cover bg-no-repeat overflow-hidden relative">
    {#if data.password}
      <Lock class="stroke-white stroke-[2px] absolute top-2 right-2"/>
    {/if}
    {#if !data.visitable}
      <EyeOff class="stroke-white stroke-[2px] absolute top-2 left-2"/>
    {/if}
    <div class="bg-cyan-400 bg-opacity-30 p-2 text-white backdrop-blur">
      <p class="font-[monospace] text-xs">Players: {Object.keys(data.players).length}/{data.capcity}</p>
      <p class="font-[monospace] text-xs">Status: {data.phase !== 'ready' ? 'started' : 'waiting'}</p>
    </div>

    {#if data.joinable || data.visitable}
      <div class="backdrop-blur w-full h-full absolute transition-transform translate-y-[100%] group-hover:translate-y-0 flex flex-col items-center justify-center gap-y-2">
        <AsButton
          onclick={() => onVisit(data.id)}
          class="text-white font-bold px-4 h-8 leading-8 hover:bg-fuchsia-400 hover:rounded-[2.5rem] cursor-pointer"
        >Visit</AsButton>
        {#if data.joinable}
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
