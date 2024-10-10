<script lang="ts">
  import clsx from 'clsx'

  interface Props {
    class?: string
    num?: number
    suit?: yew.Suit
    placeholder?: boolean
  }

  const {class: _class, placeholder}: Props = $props()
</script>

<div class={clsx('card', _class, placeholder ? '' : 'bg-[url("/game/card-back.png")] bg-cover bg-center bg-no-repeat !border-none')}>

</div>

<style lang="scss">
  .card {
    aspect-ratio: 14/19;
    border: 1px dashed #fff;
    border-radius: .2rem;
    width: 2.5rem;
  }
</style>
