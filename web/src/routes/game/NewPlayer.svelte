<script lang="ts">
  import clsx from 'clsx'
  import {on} from 'svelte/events'
  import {fly} from 'svelte/transition'
  import type {Action} from 'svelte/action'

  import {Player, room} from '~/core/simulator.svelte'
  import {audio, delay} from '~/core'
  import Card from './Card.svelte'
  import {Button, Digit, onKeyDown} from '$lib/sui'
  import {Key, CircleD, CircleMinus, CirclePlus} from '$lib/sui/icon'
  import * as store from '~/core/store.svelte'

  interface Props {
    data: Player['state']
    orientation: yew.Orientation
    onDeal: () => void
  }

  const {data, orientation, onDeal}: Props = $props()
  const snap = $state({
    // holeCards: [
    //   {ref: undefined as ReturnType<typeof Card>, x: 0, y: 0},
    //   {ref: undefined as ReturnType<typeof Card>, x: 0, y: 0},
    // ],
    holeCard: {x: 0, y: 0},
    avatarRef: undefined as undefined | HTMLElement,
    /** 发牌动画结束 */
    dealt: false,

    progressBar: {
      step: 0,
      totalStep: 0,
      stepWidth: 0
    },

    raisePanel: {
      dom: undefined as undefined | HTMLElement,
      active: false,
      trigger: undefined as undefined | HTMLElement,
    }
  })

  $effect(() => {
    if (data.bet) {
      audio.play('chip')
    }
  })

  $effect(() => {
    if (room.state.phase !== 'deal') return
    const {innerWidth: w, innerHeight: h} = window

    let r

    r = snap.avatarRef.getBoundingClientRect()

    // 获取中心点
    const c = [(r.left + r.right) / 2, (r.top + r.bottom) / 2]

    snap.holeCard.x = w / 2 - c[0]
    snap.holeCard.y = h / 2 - c[1]
  })

  const bet = $derived.by(() => {
    let currentBet = room.state.currentBet + room.state.minBet * snap.progressBar.step
    currentBet |= 0 // 取整
    const r = currentBet % 10
    if (r < 5) currentBet -= r
    else currentBet += (10 - r)
    return currentBet
  })

  // 开牌
  const showdown = $derived(store.user.id === data.id && snap.dealt)

  const acts = $derived.by(() => {
    return ['fold', 'check', 'call', 'raise']
  }) as yew.ActionType[]

  /** 拖动进度条下注的操作 */
  const drag: Action = el => {
    let down = false
    let s = 0
    let x = 0

    const ms = el.offsetWidth
    const ac = new AbortController()

    // 划分格子
    const dl = data.balance - room.state.currentBet
    const totalStep = Math.ceil(dl / room.state.minBet)
    const stepWidth = ms / totalStep
    const hStepWidth = stepWidth / 2

    snap.progressBar.stepWidth = stepWidth
    snap.progressBar.totalStep = totalStep

    function onEnd() {
      down = false
      el.classList.remove('pressed')
    }

    function calc() {
      let _s = s
      const r = _s % stepWidth

      if (r < hStepWidth) _s -= r
      else _s += stepWidth - r

      snap.progressBar.step = _s / stepWidth
    }

    on(el, 'pointerdown', e => {
      const target = e.target as HTMLElement
      if (target.parentElement !== el && target !== el) return
      down = true
      x = e.pageX
      if (target.classList.contains('dot')) return
      s = e.offsetX
      calc()
    }, {passive: true, signal: ac.signal})

    on(document, 'pointermove', e => {
      if (!down) return
      el.classList.add('pressed')
      s += e.pageX - x
      x = e.pageX
      if (s < 0) s = 0
      else if (s > ms) s = ms
      calc()
    }, {passive: true, signal: ac.signal})

    on(el, 'pointerup', onEnd, {signal: ac.signal})
    on(el, 'pointercancel', onEnd, {signal: ac.signal})
    on(document, 'pointerup', e => {
      onEnd()
      const target = e.target as HTMLElement
      if (snap.raisePanel.dom?.contains(target) || snap.raisePanel.trigger?.contains(target)) return
      // 如果点到了外面隐藏
      snap.raisePanel.active = false
    }, {signal: ac.signal})

    $effect(() => {
      return () => {
        ac.abort()
      }
    })
  }

  function stepBet(v: 1 | -1) {
    if ((snap.progressBar.step < 1 && v === -1) ||
      (snap.progressBar.step === snap.progressBar.totalStep && v === 1)
    ) return
    snap.progressBar.step += v
  }
</script>



<div class="relative flex flex-col justify-center gap-y-2 items-center p-2 root">
  <!-- 开始按钮 -->
  {#if store.user.id === data.id && data.id === room.state.owner && room.state.phase === 'ready'}
    <Button
      variant="outlined"
      textColor="#fff"
      class="!absolute bottom-[calc(100%+2rem)] mb-2"
      onclick={room.start.bind(room)}
    >Start</Button>
  {/if}
  {#if store.user.id === data.id && data.id === room.state.owner &&
    room.state.phase === 'deal' && data.op}
    <div class="absolute bottom-[calc(100%_+_2rem)] mb-2 z-[3] w-fit h-fit flex gap-2">
      {#each acts as act, i (act)}
        <div
          class={clsx('relative action text-center capitalize w-[4rem] h-fit bg-pink-500/80 text-white rounded-md p-2 text-normal', act)}
          tabindex="0"
          onkeydown={onKeyDown}
          role="button"
          onclick={e => {
            const target = e.target as HTMLElement
            snap.raisePanel.trigger = e.currentTarget
            if (snap.raisePanel.dom?.contains(target) || act !== 'raise') return
            // 点击了加注按钮
            snap.raisePanel.active = !snap.raisePanel.active
          }}>
          <span>{act}</span>
          {#if act === 'raise' && snap.raisePanel.active}
            <div class="absolute w-fit h-fit bg-white rounded-md bottom-[calc(100%+8px)] right-0 shadow-lg px-4 py-2"
              transition:fly={{x: 50}}
              bind:this={snap.raisePanel.dom}>
              <div class="flex items-center gap-x-2 w-full">
                <button onclick={stepBet.bind(null, -1)}><CircleMinus class="stroke-lime-500"/></button>
                <div class="progress-bar flex-1" use:drag
                  style:--x={`${snap.progressBar.step * snap.progressBar.stepWidth}px`}>
                  <!-- 进度条 -->
                  <i></i>
                  <!-- 位置点 -->
                  <div
                    class="dot w-4 h-4 rounded-full bg-sky-500 absolute top-0 bottom-0 my-auto left-[-.5rem] shadow-md flex justify-center">
                    <div class="bubble"><Digit value={bet} anime={false}/></div>
                  </div>
                </div>
                <button onclick={stepBet.bind(null, 1)}><CirclePlus class="stroke-pink-500"/></button>
              </div>

              <div class="flex items-center justify-end gap-2 mt-2 whitespace-nowrap">
                <button class="text-white bg-sky-500 rounded-md p-2 py-1">1/2 Pot</button>
                <button class="text-white bg-sky-500 rounded-md p-2 py-1">All in</button>
                <button class="text-white bg-lime-500 rounded-md p-2 py-1">Done</button>
              </div>
            </div>
          {/if}
          </div>
      {/each}
    </div>
  {/if}
  <p class="text-white text-sm leading-none monospace">No.{data.index}</p>
  <section class="flex items-center gap-x-2">
    <div bind:this={snap.avatarRef} class="relative w-10 aspect-square bg-white rounded-md flex items-center justify-center gap-x-1 bg-[url('/game/avatar/boy-11.png')] bg-center bg-cover bg-no-repeat"
      style:--x={`${snap.holeCard.x}px`} style:--y={`${snap.holeCard.y}px`}>
      {#if room.state.phase === 'deal'}
        {@const c = snap.holeCard}
        {#key `${c.x}${c.y}`}
          {#await delay(data.dealIndex * .2) then}
            <Card
              type="effect"
              --x={`${snap.holeCard.x}px`}
              --y={`${snap.holeCard.y}px`}
              onDeal={() => {
                snap.dealt = true
                onDeal()
              }}
            />
          {/await}
        {/key}
      {/if}
      {#if data.countdown}
        <div class="absolute top-0 left-0 text-white bg-black/80 font-bold flex items-center justify-center w-full h-full rounded-md">{data.countdown}</div>
      {/if}
    </div>
    {#if showdown}
      <div class="flex items-center gap-x-2">
        {#each data.cards as c, i (`${c.num}${c.suit}`)}
          <Card
            showdown
            type="hand"
            class={clsx('!h-10')}
            suit={data.cards[i].suit}
            num={data.cards[i].num}
          />
        {/each}
      </div>
    {/if}
  </section>

  <Digit class="leading-none text-sm text-white monospace" value={data.balance} abbr/>
  <section
    class={clsx('absolute flex gap-1', orientation === 'top' || orientation === 'bottom' ? 'w-fit h-fit' : 'h-full w-fit', orientation === 'right' ? 'justify-center items-end right-full flex-col' : orientation === 'left' ? 'justify-center items-start left-full flex-col' : orientation === 'top' ? 'justify-center items-center top-full' : 'justify-center items-center bottom-full')}>
    {#if room.state.owner === data.id}
      <Key class="stroke-white stroke-2 w-6 h-6 block shrink-0"/>
    {/if}

    {#if room.state.dealer === data.id}
      <CircleD class="stroke-white stroke-2 w-6 h-6 block"/>
    {/if}

    <!-- 下注占位符 -->
    {#if data.bet}
      <div class="text-sm w-max flex justify-center items-center gap-x-1 shrink-0">
        <div class="aspect-square w-6 bg-[url('/game/chip.png')] bg-center bg-cover bg-no-repeat"></div>
        <Digit class="text-white text-sm monospace" value={data.bet}/>
      </div>
    {/if}
  </section>
</div>

<style lang="scss">
  .action {
    opacity: 1;
    transform: translateY(0);
    transition: opacity .5s ease, transform .5s ease, background-color .2s ease;
    user-select: none;

    @starting-style {
      opacity: 0;
      transform: translateY(20px);
    }

    &.fold {
      @apply bg-teal-500 hover:bg-teal-600;
    }

    &.check {
      @apply bg-lime-500 hover:bg-lime-600;
    }

    &.call {
      @apply bg-pink-500 hover:bg-pink-600;
    }

    &.raise {
      @apply bg-sky-500 hover:bg-sky-600;
    }

    .progress-bar {
      @apply h-6 flex items-center relative;

      &:not(:global(.pressed)) {
        & > i::before {
          transition: width .3s ease;
        }

        .dot {
          transition: transform .3s ease;
        }
      }

      & > i {
        @apply block h-2 rounded-full bg-indigo-200 w-full content-[""];

        &::before {
          @apply block h-full bg-sky-500 content-[""] w-[var(--x,0)] rounded-full;
        }
      }

      .dot {
        transform: translateX(var(--x));
      }

      .bubble {
        $color: #e66190;

        @apply w-fit h-fit py-2 px-3 absolute bottom-[calc(100%+.8rem)] text-stone-500 rounded-md m-auto bg-white;
        background-color: #fff;
        box-shadow: 0 0 6px 0 $color;

        &::after {
          @apply w-0 h-0 content-[""] block absolute m-auto left-0 right-0 bottom-0 top-full;
          border: .5rem solid transparent;
          border-top-color: #fff;
          filter: drop-shadow(0 1px 0 $color);
          transform: translateY(calc(50% - 1px));
        }
      }
    }
  }
</style>
