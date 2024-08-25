<script lang="ts">
  import '~/app.css'
  import '$lib/sui/preset.scss'
  const {children} = $props()
</script>

<div class="pb-[max(env(safe-area-inset-bottom),16px)] pt-[max(env(safe-area-inset-top),16px)] px-[16px] overflow-auto h-[100%]">
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
