<script lang="ts">
  import clsx from 'clsx'
  import {Heart, Club, Diamond, Spade} from '$lib/sui/icon'

  interface Props {
    class?: string
    type: 'public' | 'hand' | 'effect'
    num?: number
    suit?: yew.Suit
    placeholder?: boolean
    showdown?: boolean
    /** 发牌动画结束事件 */
    onDeal?: () => void
  }

  const {placeholder, num, suit, onDeal, ...props}: Props = $props()

  let root: HTMLElement

  const _class = $derived.by(() => {
    const cls = [props.class, 'card']
    cls.push(props.type)
    if (props.showdown) cls.push('showdown')
    return clsx(cls)
  })

  function trNum(v: number) {
    if (v === 1) return 'A'
    else if (v === 11) return 'J'
    else if (v === 12) return 'Q'
    else if (v === 13) return 'K'
    return v.toString()
  }

  function init(el: HTMLDivElement) {
    const ac = new AbortController()

    el.addEventListener('transitionend', e => {
      onDeal?.()
    }, {signal: ac.signal})

    return {
      destroy() {
        ac.abort()
      }
    }
  }

  export {root}
</script>

<div
  use:init
  bind:this={root}
  class={_class}>
  {#if props.showdown}
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
  }

  .effect {
    @apply h-10;
    background: url("/game/card-back.png") center / cover no-repeat;
    transform-origin: center;
    transition: transform 1s ease, opacity 2s ease;
    transform: translate(0, 0);
    opacity: 0;

    @starting-style {
      transform: translate(var(--x), var(--y));
      opacity: 1;
    }
  }

  .public {
    aspect-ratio: 14/19;
    border: 1px dashed #fff;
    border-radius: .2rem;
    width: 2.5rem;
  }

  .hand {
    @apply h-10 relative;
    background-color: #fff;
    border-radius: .2rem;
  }
</style>
