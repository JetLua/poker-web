<script lang="ts">
  import clsx from 'clsx'
  import {Heart, Club, Diamond, Spade} from '$lib/sui/icon'

  interface Props {
    class?: string
    num?: number
    suit?: yew.Suit
    placeholder?: boolean
    pub?: boolean
    self?: boolean
  }

  const {placeholder, pub, num, suit, self, ...props}: Props = $props()

  let root: HTMLElement

  const opened = $derived.by(() => {
    return !!num && self
  })

  const _class = $derived.by(() => {
    return ''
  })

  function trNum(v: number) {
    if (v === 1) return 'A'
    else if (v === 11) return 'J'
    else if (v === 12) return 'Q'
    else if (v === 13) return 'K'
    return v.toString()
  }

  function init(el: HTMLDivElement) {
    el.addEventListener('transitionend', e => {
      el.classList.remove('!w-4')
      el.classList.add('h-full')
    })

    return {
      destroy() {

      }
    }
  }

  export {root}
</script>

<div
  use:init
  bind:this={root}
  class={clsx(_class, placeholder ? '' : 'bg-cover bg-center bg-no-repeat !border-none', pub ? 'pub' : 'card', self && 'self', opened ? 'bg-white' : 'bg-[url("/game/card-back.png")]', 'relative')}>
  {#if num}
    <span class="font-bold">{trNum(num)}</span>
    {#if suit === 'heart'}
      <Heart class="stroke-red-500 fill-red-500 w-4 h-4 absolute right-1 bottom-1"/>
    {:else if suit === 'club'}
      <Club class="stroke-stone-800 fill-stone-800 w-4 h-4 absolute right-1 bottom-1"/>
    {:else if suit === 'diamond'}
      <Diamond class="stroke-red-500 fill-red-500 w-4 h-4 absolute right-1 bottom-1"/>
    {:else if suit === 'spade'}
      <Spade class="stroke-stone-800 fill-stone-800 w-4 h-4 absolute right-1 bottom-1"/>
    {/if}
  {/if}
</div>

<style lang="scss">
  .card {
    aspect-ratio: 14/19;
    border: 1px dashed #fff;
    border-radius: .2rem;
    width: 2.5rem;
    transform-origin: center;
    transition: transform 1s ease, opacity 2s ease;
    transform: translate(0, 0);

    &:not(.self) {
      opacity: 0;
    }

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
