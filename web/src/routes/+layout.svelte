<script lang="ts">
  import {onMount} from 'svelte'
  import {Toast} from '$lib/sui'
  // import {page} from '$app/stores'
  import {goto} from '$app/navigation'
  import {room, user, socket} from '~/core/store.svelte'
  import * as api from '~/api'

  import '~/app.scss'

  const {children} = $props()

  const snap = $state({
    loading: true,
    err: undefined as undefined | Error
  })

  $effect(() => {
    if (room.id) {
      // 跳转到房间
      // goto(`/game?id=${room.id}`)
    }
  })

  $effect(() => {
    localStorage.setItem('mg:user', JSON.stringify($state.snapshot(user)))
  })

  onMount(() => {
    api.login().then(data => {
      snap.loading = false
      user.id = data.id
      socket.connect()
    }).catch(() => {
      snap.loading = false
      snap.err = new Error('Oops!')
    })
  })
</script>

<Toast/>

<div class="px-4">
  {#if snap.loading}
    loading
  {:else if snap.err}
    {snap.err.message}
  {:else}
    {@render children()}
  {/if}
</div>


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

  @media (max-width: 480px) {
    :root {
      font-size: 10px;
    }
  }
</style>
