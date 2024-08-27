<script lang="ts">
  import {onMount} from 'svelte'
  import * as api from '~/api'
  import {store} from '~/core'
  import '~/app.css'
  import '$lib/sui/preset.scss'

  const {children} = $props()
  const snap = $state({
    loading: true
  })

  onMount(() => {
    api.info().then(r => {
      store.user.name = r.name
      store.user.avatar = r.avatar
    }).finally(() => snap.loading = false)
  })
</script>

{#if snap.loading}
  loading...
{:else}
<div class="pb-[max(env(safe-area-inset-bottom),16px)] pt-[max(env(safe-area-inset-top),16px)] px-[16px] overflow-auto h-[100%] px-4">
  {@render children()}
</div>
{/if}


<style global lang="scss">
  body {
    height: 100dvh;
    overflow: hidden;
    //background: linear-gradient(to right, #ddefbb, #ffeeee);
    background-color: #fff;
  }

  @media (display-mode: fullscreen) {
    body {
      height: 100vh;
    }
  }

  @media (max-width: 640px) {
    :root {
      font-size: 14px;
    }
  }
</style>
