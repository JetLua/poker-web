<script lang="ts">
  import {Toast} from '$lib/sui'
  import {page} from '$app/stores'
  import {room, user} from '~/core/store.svelte'
  import '~/app.scss'
    import {goto} from '$app/navigation'

  const {children} = $props()

  $effect(() => {
    if (room.id) {
      // 跳转到房间
      goto(`/game?id=${room.id}`)
    }
  })

  $effect(() => {
    localStorage.setItem('mg:user', JSON.stringify($state.snapshot(user)))
  })
</script>

<Toast/>

<div class="px-4">
  {@render children()}
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
</style>
