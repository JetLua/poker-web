<script lang="ts">
  import {Button, Input, Checkbox} from '$lib/sui'
  import * as api from '~/api'
  import {sync} from '~/core'

  let input: HTMLInputElement

  /** 分片单个大小 */
  const BLOCK_SIZE = 5 * 1024 * 1024

  async function upload() {
    input.value = ''
    input.click()
    input.onchange = async () => {
      if (!input.files || !input.files.length) return
      const {files} = input
      const f = files.item(0)!
      if (f.size > BLOCK_SIZE) {
        const total = Math.ceil(f.size / BLOCK_SIZE)
        const [r, err] = await sync(api.multipart(total))
        if (err) return alert(err.message)
        const {uploadId, urls, key} = r
        Promise.all(urls.map(async (item, i) => {
          const part = f.slice(i * BLOCK_SIZE, (i + 1) * BLOCK_SIZE)
          return {ETag: await api.put(item, part), PartNumber: i + 1}
        })).then((parts) => {
          api.complete({uploadId, parts, key})
        })
      }
    }
  }
</script>

<Button variant="outlined" onclick={upload}>upload</Button>
<input type="file" bind:this={input} class="hidden">
