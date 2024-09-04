<script lang="ts">
  import dayjs from 'dayjs'
  import {onMount} from 'svelte'
  import {Button, Input, Checkbox, AsButton, Popover, toast} from '$lib/sui'
  import {Plus, FolderPlus, FileUpload, File, Folder, Dots} from '$lib/sui/icon'
  import * as api from '~/api'
  import {sync, store} from '~/core'
  import Uploader from './Uploader.svelte'

  // svelte-ignore non_reactive_update
  let input: HTMLInputElement
  let dialog: HTMLDialogElement

  const {user} = store

  const snap = $state({
    folderName: '',
    newBtn: undefined as undefined | HTMLButtonElement,
    popover: false,
    files: [] as yew.File[],
    uploadFiles: undefined as undefined | FileList,
    loading: {
      createFolder: false
    }
  })

  async function login() {
    const r = await api.login()
    location.href = r.url
  }

  async function loadFiles() {
    const r = await sync(api.file.get())
    if (r[1]) return toast.error(r[1])
    snap.files = r[0]
  }

  async function handle(action: 'dialog:close' | 'dialog:open' | 'folder:create' | 'file:choose') {
    switch (action) {
      case 'dialog:open': {
        snap.popover = false
        dialog.showModal()
        break
      }

      case 'dialog:close': {
        dialog.close()
        snap.folderName = ''
        break
      }

      case 'folder:create': {
        const fn = snap.folderName?.trim()
        const r = await sync(api.file.set(fn))
        if (r[1]) return toast.error(r[1].message)
        toast.success('Done')
        handle('dialog:close')
        loadFiles()
        break
      }

      case 'file:choose': {
        snap.popover = false
        input.value = ''
        input.click()
        input.onchange = () => {
          snap.uploadFiles = input.files!
        }
        break
      }
    }
  }

  onMount(() => {
    loadFiles()
  })
</script>

{#if user.name}
  <div class="flex justify-between items-center border-b border-dashed border-pink-500 w-main m-auto text-purple-500 pb-2">
    <div class="flex items-center">
      <img class="w-10 border-2 border-solid border-fuchsia-400 rounded-full mr-2" src={user.avatar} alt="avatar"/>
      <span>Hi, {user.name}</span>
    </div>
    <Button class="text-sm" variant="outlined" bind:ref={snap.newBtn}>New</Button>
  </div>

  {#each snap.files as {name, id, type, createdAt, updatedAt} (id)}
    <div class="flex items-center w-main m-auto h-12 hover:bg-gray-100 cursor-pointer">
      {#if type === 1}<File/>{:else}<Folder class="stroke-indigo-400"/>{/if}
      <p class="text-sm text-slate-800 flex-1 text-ellipsis overflow-hidden whitespace-nowrap ml-2">{name}</p>
      <span class="text-xs text-stone-500 font-[monospace] mr-4 md:mr-8">{dayjs(updatedAt).format('MM/DD/YYYY HH:mm:ss')}</span>
      <Button variant="icon"><Dots class="stroke-sky-500"/></Button>
    </div>
  {/each}

  <input type="file" multiple class="hidden" bind:this={input}/>
  <Popover target={snap.newBtn} bind:visible={snap.popover}>
    <div class="py-2 w-[16rem]">
      <AsButton class="flex items-center gap-x-2 text-sm leading-10 hover:bg-stone-100 px-2 text-slate-500 cursor-pointer" onclick={() => handle('dialog:open')}>
        <FolderPlus class="w-5 h-5"/>
        <span>New folder</span>
      </AsButton>
      <AsButton class="flex items-center gap-x-2 text-sm leading-10 hover:bg-stone-100 px-2 cursor-pointer text-slate-500" onclick={() => handle('file:choose')}>
        <FileUpload class="w-5 h-5"/>
        <span>File upload</span>
      </AsButton>
    </div>
  </Popover>
{:else}
  <Button variant="outlined" onclick={login}>Google</Button>
{/if}

<dialog bind:this={dialog} class="rounded-md">
  <div class="bg-white p-4 rounded-md">
    <Input placeholder="Folder name" class="w-[20rem]" bind:value={snap.folderName}/>
    <div class="flex justify-end mt-2">
      <Button variant="text" class="text-sm" onclick={() => handle('dialog:close')}>cancel</Button>
      <Button variant="text" class="text-sm" onclick={() => handle('folder:create')}>ok</Button>
    </div>
  </div>
</dialog>

{#if snap.uploadFiles}
  <Uploader files={snap.uploadFiles}/>
{/if}

<style lang="scss">
  dialog::backdrop {
    opacity: .5;
    background-color: #000;
  }
</style>
