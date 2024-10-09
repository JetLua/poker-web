<script lang="ts">
  import clsx from 'clsx'

  interface Props {
    class?: string
  }

  const {class: _class}: Props = $props()
</script>

<div class={clsx('card', _class)}>

</div>

<style lang="scss">
  .card {
    aspect-ratio: 14/19;
    border: 1px dashed #fff;
    border-radius: .2rem;
    width: 2.5rem;
  }
</style>
