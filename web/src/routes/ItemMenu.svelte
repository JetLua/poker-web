<script lang="ts">
  import type {MouseEventHandler} from 'svelte/elements'
  import {Button, Popover, AsButton} from '$lib/sui'
  import {Dots, TrashX, WorldShare, PencilPlus, FileDownload} from '~/lib/sui/icon'

  type Action = 'download' | 'share' | 'rename' | 'delete'

  interface Props {
    type: yew.FileType
    onClick?: MouseEventHandler<HTMLButtonElement>
    onAction?: (action: Action) => void
  }

  const props: Props = $props()

  const snap = $state({
    popover: false,
    btn: undefined as undefined | HTMLButtonElement
  })

  const handle: MouseEventHandler<HTMLElement> = e => {
    props.onAction?.(e.currentTarget.dataset.id as Action)
    snap.popover = false
  }
</script>

<Button bind:ref={snap.btn} variant="icon" onclick={props.onClick}><Dots class="stroke-sky-500"/></Button>

<Popover target={snap.btn} bind:visible={snap.popover}>
  <ol class="py-2">
    {#if props.type === 1}<AsButton class="flex items-center cursor-pointer px-2 h-10 leading-10 hover:bg-slate-200 text-sm text-slate-500" onclick={handle} data-id="download"><FileDownload class="stroke-[2] w-5 h-5 mr-1"/><span>Download</span></AsButton>{/if}
    <AsButton class="flex items-center cursor-pointer px-2 h-10 leading-10 hover:bg-slate-200 text-sm text-slate-500"
      data-id="share" onclick={handle}><WorldShare class="stroke-[2] w-5 h-5 mr-1"/><span>Share</span></AsButton>
    <AsButton class="flex items-center cursor-pointer px-2 h-10 leading-10 hover:bg-slate-200 text-sm text-slate-500"
      data-id="rename" onclick={handle}><PencilPlus class="stroke-[2] w-5 h-5 mr-1"/><span>Rename</span></AsButton>
    <AsButton class="flex items-center cursor-pointer px-2 h-10 leading-10 hover:bg-slate-200 text-sm text-red-500"
      data-id="delete" onclick={handle}><TrashX class="stroke-red-500 stroke-[2] w-5 h-5 mr-1"/><span>Delete</span></AsButton>
  </ol>
</Popover>
