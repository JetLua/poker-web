<script lang="ts">
  import {onMount} from 'svelte'
  import type {HTMLAttributes} from 'svelte/elements'

  interface Props extends HTMLAttributes<HTMLElement> {
    data: Record<string, number>
  }

  const {data}: Props = $props()

  let log: Function

  // onMount(() => {
  //   log = console.log
  // })

  $effect(() => {
    log?.('first', Object.values(data))
  })

  $effect(() => {
    const items = Object.values(data)
    log?.('second', items)
  })

  onMount(() => {
    log = console.log
  })
</script>
