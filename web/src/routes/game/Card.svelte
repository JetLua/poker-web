<script lang="ts">
  import clsx from 'clsx'
  import {Heart, Club, Diamond, Spade} from '$lib/sui/icon'
    import {audio} from '~/core'

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
    if (placeholder) cls.push('placeholder')
    if (props.showdown || (props.type === 'public' && suit)) cls.push('showdown')
    return clsx(cls)
  })

  function trNum(v: number) {
    if (v === 1) return 'A'
    else if (v === 11) return 'J'
    else if (v === 12) return 'Q'
    else if (v === 13) return 'K'
    return v?.toString()
  }

  /** 防止多个 transtion 导致的重复调用 */
  let dealt = false

  function onTransitionEnd() {
    if (dealt) return
    dealt = true
    onDeal?.()
  }

  export {root}
</script>

<div
  ontransitionend={onTransitionEnd}
  bind:this={root}
  class={_class}>
  {#if props.showdown}
    <span class={clsx('font-bold', suit === 'heart' || suit === 'diamond' ? 'text-red-500' : 'text-stone-800', 'left-px absolute leading-none top-px')}>{trNum(num)}</span>
    {#if suit === 'heart'}
      <Heart class="stroke-red-500 fill-red-500 w-4 h-4 absolute right-px bottom-px"/>
    {:else if suit === 'club'}
      <Club class="stroke-stone-800 fill-stone-800 w-4 h-4 absolute right-px bottom-px"/>
    {:else if suit === 'diamond'}
      <Diamond class="stroke-red-500 fill-red-500 w-4 h-4 absolute right-px bottom-px"/>
    {:else if suit === 'spade'}
      <Spade class="stroke-stone-800 fill-stone-800 w-4 h-4 absolute right-px bottom-px"/>
    {/if}
  {/if}
</div>

<style lang="scss">
  .card {
    aspect-ratio: 14/19;
  }

  .effect {
    @apply w-4;
    background: url("/game/card-back.png") center / cover no-repeat;
    transform-origin: center;
    transition: transform 1.5s ease, opacity 3s ease-out;
    transform: translate(0, 0);
    opacity: 0;

    @starting-style {
      transform: translate(var(--x), var(--y)) scale(2);
      opacity: 1;
    }
  }

  .public {
    aspect-ratio: 14/19;
    border: 1px dashed #fff;
    border-radius: .2rem;
    width: 2.5rem;
    position: relative;

    &:not(.placeholder, .showdown) {
      border: none;
      border-radius: 0;
      background: url("/game/card-back.png") center / cover no-repeat;
    }

    &.showdown {
      background-color: #fff;
    }
  }

  .hand {
    @apply h-10 relative;
    background-color: #fff;
    border-radius: .2rem;
    opacity: 1;
    transform: translate(0, 0);
    transition: transform 1s ease, opacity 2s ease;

    @starting-style {
      opacity: 0;
      transform: translateX(-50%);
    }
  }
</style>
