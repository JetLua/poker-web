<script lang="ts">
  import {Button, Input, Checkbox} from '$lib/sui'
  import * as api from '~/api'
  import {sync} from '~/core'

  async function login() {
    const r = await api.login()
    location.href = r.url
  }
</script>

<Button variant="outlined" onclick={login}>Google</Button>
