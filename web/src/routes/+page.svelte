<script lang="ts">
  import dayjs from 'dayjs'
  import {onMount, untrack} from 'svelte'

  import {goto} from '$app/navigation'
  import {page} from '$app/stores'
  import {Button, Input, Checkbox, AsButton, Popover, toast, modal} from '$lib/sui'
  import {Plus, FolderPlus, FileUpload, File, Folder, Dots} from '$lib/sui/icon'
  import * as api from '~/api'
  import {sync, store} from '~/core'
  import Uploader from './Uploader.svelte'
  import ItemMenu from './ItemMenu.svelte'

  // svelte-ignore non_reactive_update
  let input: HTMLInputElement
  let dialog: HTMLDialogElement

  const {user, mem} = store

  const snap = $state({
    folderName: '',
    folderNameId: '',
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

  async function loadFiles(dir?: string) {
    const r = await sync(api.file.get({parent: dir || mem.dir.id}))
    if (r[1]) return toast.error(r[1])
    snap.files = r[0]
  }

  type Action = 'dialog:close' | 'dialog:open' | 'folder:create' | 'file:choose' | 'to' | 'item:menu'
  async function handle(action: Action, ...args: any[]) {
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
        if (!fn) return
        if (snap.folderNameId) {
          const r = await sync(api.file.rename({id: snap.folderNameId, name: fn, parent: mem.dir.id}))
          snap.folderNameId = ''
          if (r[1]) return toast.error(r[1].message)
          toast.success('Success')
          handle('dialog:close')
          loadFiles()
          return
        }
        const r = await sync(api.file.set({name: fn, parent: mem.dir.id}))
        if (r[1]) return toast.error(r[1].message)
        toast.success('Success')
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

      case 'to': {
        mem.dir.id = args[0].id
        mem.dir.name = args[0].name
        mem.paths.push(args[0].name)
        goto(`/?id=${mem.dir.id}`)
        break
      }

      case 'item:menu': {
        args[0].stopPropagation()

        break
      }
    }
  }

  $effect(() => {
    const dir = $page.url.searchParams.get('id') || undefined
    mem.dir.id = dir ?? ''
    untrack(() => loadFiles(dir))
  })

  function formatSize(i = 0) {
    let count = 0

    while (i > 99) {
      i /= 1000
      count++
    }

    return `${i.toPrecision(2)}${['B', 'KB', 'MB', 'GB'][count]}`
  }

  function download(id: string) {
    toast.success('download')
  }

  async function del(id: string) {
    let ok = await modal.warn('Are you sure you want to delete?')
    if (!ok) return
    ok = await api.file.del(id)
    if (!ok) toast.error('Failed')
    loadFiles()
    toast.success('Success')
  }

  function rename(id: string) {
    snap.folderNameId = id
    dialog.showModal()
  }
</script>

{#if user.name}
  <div class="flex justify-between items-center border-b border-dashed border-pink-500 w-main m-auto text-purple-500 pb-2">
    <div class="flex items-center">
      <img class="w-10 border-2 border-solid border-fuchsia-400 rounded-full mr-2" src={user.avatar} alt="avatar"/>
      <span>Hi, {user.name}</span>
    </div>
    <Button class="text-sm" variant="outlined" bind:ref={snap.newBtn}>New</Button>
  </div>

  {#each snap.files as {name, id, type, updatedAt, size} (id)}
    <AsButton class="flex items-center w-main m-auto h-12 hover:bg-gray-100 cursor-pointer"
      onclick={() => type === 2 && handle('to', {name, id})}>
      {#if type === 1}<File/>{:else}<Folder class="stroke-indigo-400"/>{/if}
      <p class="text-sm text-slate-800 flex-1 text-ellipsis overflow-hidden whitespace-nowrap ml-2">{name}</p>
      {#if type === 1}<p class="text-sm font-[monospace] text-xs text-stone-500 text-slate-800 text-ellipsis overflow-hidden whitespace-nowrap mr-4">{formatSize(size ?? 0)}</p>{/if}
      <span class="text-xs text-stone-500 font-[monospace] mr-4 md:mr-8">{dayjs(updatedAt).format('MM/DD/YYYY HH:mm:ss')}</span>
      <!-- <Button variant="icon" onclick={e => handle('item:menu', e)}><Dots class="stroke-sky-500"/></Button> -->
      <ItemMenu {type} onClick={e => handle('item:menu', e)} onAction={action => {
        switch (action) {
          case 'download': {
            download(id)
            break
          }

          case 'delete': {
            del(id)
            break
          }

          case 'rename': {
            snap.folderName = name
            rename(id)
            break
          }
        }
      }}/>
    </AsButton>
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
  <Uploader files={snap.uploadFiles} parent={mem.dir.id}
    onComplete={ok => {
      loadFiles()
      if (ok) snap.uploadFiles = undefined
    }}/>
{/if}

<style lang="scss">
  dialog::backdrop {
    opacity: .5;
    background-color: #000;
  }
</style>
