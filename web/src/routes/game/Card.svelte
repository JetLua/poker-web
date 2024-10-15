<script lang="ts">
  import clsx from 'clsx'
  import type {Snippet} from 'svelte'

  interface Props {
    class?: string
    num?: number
    suit?: yew.Suit
    placeholder?: boolean
    pub?: boolean
  }

  const {class: _class, placeholder, pub}: Props = $props()



  let root: HTMLElement

  export {root}
</script>

<div
  bind:this={root}
  class={clsx(_class, placeholder ? '' : 'bg-[url("/game/card-back.png")] bg-cover bg-center bg-no-repeat !border-none', pub ? 'pub' : 'card')}
></div>

<style lang="scss">
  .card {
    aspect-ratio: 14/19;
    border: 1px dashed #fff;
    border-radius: .2rem;
    width: 2.5rem;
    transform-origin: center;
    transition: transform 1s ease, opacity 2s ease;
    transform: translate(0, 0);
    opacity: 0;

    @starting-style {
      transform: translate(var(--x), var(--y));
      opacity: 1;
    }
  }

  .pub {
    aspect-ratio: 14/19;
    border: 1px dashed #fff;
    border-radius: .2rem;
    width: 2.5rem;
  }
</style>
