<script lang="ts">
  import {onMount} from 'svelte'
  import {Button, Input, Checkbox} from '$lib/sui'
  import * as api from '~/api'
  import {sync, store} from '~/core'

  const {user} = store

  async function login() {
    const r = await api.login()
    location.href = r.url
  }

  onMount(() => {

  })
</script>

{#if user.name}
  <p class="flex items-center border-b border-dashed border-pink-500 w-main m-auto text-purple-500 pb-2">
    <img class="w-10 border-2 border-solid border-fuchsia-400 rounded-full mr-2" src={user.avatar} alt="avatar"/>
    <span>Hi, {user.name}</span>
  </p>
  {@render uploader()}
{:else}
  <Button variant="outlined" onclick={login}>Google</Button>
{/if}


{#snippet uploader()}
  <div class="w-16 aspect-square fixed bottom-8 right-8 bg-sky-400 rounded-full"></div>
{/snippet}
