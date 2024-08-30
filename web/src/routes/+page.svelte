<script lang="ts">
  import {onMount} from 'svelte'
  import {Button, Input, Checkbox, AsButton} from '$lib/sui'
  import {Plus} from '$lib/sui/icon'
  import * as api from '~/api'
  import {sync, store} from '~/core'

  let input: HTMLInputElement

  const {user} = store

  async function login() {
    const r = await api.login()
    location.href = r.url
  }

  class Task {
    size = 5 * 1024 * 1024

    microTasks = [] as Array<{
      key: string
      file: File
      i: number
      uploadId: string
      url: string
      total: number
    }>

    macroTasks = new Map<string, {total: number, key: string}>()


    constructor(files: FileList) {
      this.run(files)
    }

    async run(files: FileList) {
      for (let i = 0; i < files.length; i++) {
        const f = files.item(i)!
        if (f.size > this.size) {
          await this.multipart(f)
        }
      }

      const doneTasks = new Map<string, {i: number, key: string, eTag: string}[]>()

      // 每次选取10个任务
      while (this.microTasks.length) {
        const tasks = this.microTasks.splice(0, 10)
        const r = await sync(Promise.all(tasks.map(async ({i, file, url, key, total, uploadId}) => {
          const j = i + 1
          const part = file.slice(i * this.size, j * this.size)
          return {
            i: j,
            key,
            total,
            uploadId,
            eTag: await api.put(url, part, e => console.log(e.progress)),
          }
        })))

        if (r[1]) return alert(r[1].message)

        for (const item of r[0]) {
          const t = doneTasks.get(item.uploadId)
          if (t) t.push(item)
          else doneTasks.set(item.uploadId, [item])
        }
      }

      console.log(doneTasks, this.macroTasks)

      for (const id of doneTasks.keys()) {
        const mat = this.macroTasks.get(id)
        const dt = doneTasks.get(id)
        if (!mat || !dt) continue
        const {total} = mat
        if (total === dt.length) {
          // complete
          api.complete({
            key: mat.key,
            uploadId: id,
            parts: dt.map(item => {
              return {
                PartNumber: item.i,
                ETag: item.eTag
              }
            })
          })
        }
      }
    }

    async multipart(file: File) {
      const total = Math.ceil(file.size / this.size)
      const [r, err] = await sync(api.multipart(total))
      if (err) return [null, err]
      const {uploadId, urls, key} = r
      this.macroTasks.set(uploadId, {total, key})
      this.microTasks.push(...Array.from({length: total}, (_, i) => {
        return {
          i,
          key,
          file,
          total,
          uploadId,
          url: urls[i],
        }
      }))
    }
  }

  function upload() {
    input.value = ''
    input.click()
    input.onchange = () => {
      const files = input.files
      if (!files || !files.length) return
      new Task(files)
    }
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

  <input type="file" class="hidden" bind:this={input}/>
{:else}
  <Button variant="outlined" onclick={login}>Google</Button>
{/if}


{#snippet uploader()}
  <button class="w-16 flex items-center cursor-pointer justify-center aspect-square fixed bottom-8 right-8 bg-sky-400 rounded-full" onclick={upload}>
    <Plus class="w-8 h-8" --stroke="white"/>
  </button>
{/snippet}
