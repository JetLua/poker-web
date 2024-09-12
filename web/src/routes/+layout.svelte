<script lang="ts">
  import {onMount} from 'svelte'
  import type {MouseEventHandler} from 'svelte/elements'

  import {Toast, Modal, Button} from '$lib/sui'
  import * as api from '~/api'
  import {delay, initWorker, store} from '~/core'
  import '~/app.css'
  import '$lib/sui/preset.scss'

  const {children} = $props()
  const snap = $state({
    loading: true,
    count: [],
    tgLoading: false
  })

  const login: MouseEventHandler<HTMLElement> = async e => {
    const id = e.currentTarget.dataset.id
    if (id === 'google') {
      const r = await api.login()
      location.href = r.url
    } else if (id === 'telegram') {
      const key = crypto.randomUUID()
      snap.tgLoading = true
      open(`https://t.me/laxia_bot?start=${key}`, '_blank')
      void function loop() {
        api.tgq(key).then(r => {
          if (r) return location.reload()
          delay(2).then(loop)
        })
      }()
    }
  }

  onMount(() => {
    initWorker()
    api.info().then(r => {
      store.user.name = r.name
      store.user.avatar = r.avatar
    }).finally(() => snap.loading = false)
  })
</script>

{#if snap.loading}
  loading...
{:else if store.user.name}
<div class="pb-[max(env(safe-area-inset-bottom),16px)] pt-[max(env(safe-area-inset-top),16px)] px-[16px] overflow-auto h-[100%] px-4">
  {@render children()}
</div>
{:else}
  <div class="flex flex-col  max-w-[40rem] w-full m-auto pt-4 px-4">
    <p class="bg-indigo-50 text-indigo-500 rounded-md text-center leading-10">You can quickly sign in using the following methods</p>
    <div class="flex items-center justify-center gap-x-2 mt-4">
      <Button textColor="#e91e63" variant="outlined" onclick={login} data-id="google">Google</Button>
      <Button textColor="#2196f3" loading={snap.tgLoading} variant="outlined" onclick={login} data-id="telegram">Telegram</Button>
    </div>
  </div>
{/if}

<Toast/>
<Modal/>


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
