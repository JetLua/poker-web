<script lang="ts">
  import type {MouseEventHandler} from 'svelte/elements'
  import {Button, Popover} from '$lib/sui'
  import {Dots} from '~/lib/sui/icon'

  interface Props {
    type: yew.FileType
    onClick?: MouseEventHandler<HTMLButtonElement>
  }

  const props: Props = $props()

  const snap = $state({
    popover: false,
    btn: undefined as undefined | HTMLButtonElement
  })
</script>

<Button bind:ref={snap.btn} variant="icon" onclick={props.onClick}><Dots class="stroke-sky-500"/></Button>

<Popover target={snap.btn} bind:visible={snap.popover}>
  <ol class="py-2">
    {#if props.type === 1}<li class="cursor-pointer px-2 h-10 leading-10 hover:bg-slate-200 text-sm text-slate-500">Download</li>{/if}
    <li class="cursor-pointer px-2 h-10 leading-10 hover:bg-slate-200 text-sm text-slate-500">Share</li>
    <li class="cursor-pointer px-2 h-10 leading-10 hover:bg-slate-200 text-sm text-slate-500">Rename</li>
    <li class="cursor-pointer px-2 h-10 leading-10 hover:bg-slate-200 text-sm text-red-500">Delete</li>
  </ol>
</Popover>
