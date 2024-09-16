<script lang="ts">
  import '~/app.scss'
  const {children} = $props()
</script>

<div>
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
