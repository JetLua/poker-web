<script lang="ts">
  import {Toast} from '$lib/sui'
  import {room} from '~/core/store.svelte'
  import '~/app.scss'

  const {children} = $props()

  $effect(() => {
    if (room.id) {
      // 跳转到房间

    }
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
