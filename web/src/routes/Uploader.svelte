<script lang="ts">
  import {onMount, untrack} from 'svelte'
  import {md5, sync} from '~/core'
  import {toast} from '$lib/sui'
  import * as api from '~/api'

  type Q = {
    i: number
    f: File
    url: string
    key: string
    uploadId: string
  } | {key: string, url: string, f: File}

  type F = {
    name: string
    key: string
    uploadedSize: number
    total: number
    uploadId: string
    skipped?: boolean
    hash?: string
    parts: {
      PartNumber: number
      ETag: string
    }[]
  } | {
    skipped?: boolean
    hash?: string
    name: string
    key: string
    uploadedSize: number
    total: number
  }

  const snap = $state({
    uploadedSize: 0,
    total: 0,
    done: true,
    files: [] as F[],
    queue: [] as Q[],
    tasks: [] as Q[],
  })

  const progress = $derived(snap.total ? snap.uploadedSize / snap.total : 0)

  interface Props {
    files: FileList
    parent?: string
  }

  const BLOCK_SIZE = 5 * 1024 * 1024
  const {files, parent}: Props = $props()

  function toPrecent(i: number) {
    return (i * 100).toFixed(0) + '%'
  }

  async function multipart(f: File) {
    const total = Math.ceil(f.size / BLOCK_SIZE)
    const hash = await md5(f, BLOCK_SIZE)
    api.multipart(total, hash).then(r => {
      if ('uploadId' in r) {
        const {key, uploadId, urls} = r
        snap.files.push({
          key,
          uploadId,
          uploadedSize: 0,
          parts: [],
          total: f.size,
          name: f.name,
        })
        snap.tasks.push(...urls.map((url, i) => ({i, f, url, key, uploadId})))
      } else {
        snap.files.push({
          key: r.key,
          name: f.name,
          total: f.size,
          uploadedSize: f.size,
          skipped: true
        })

        snap.uploadedSize += f.size

        // 直接完成
        api.complete({
          key: r.key,
          name: f.name,
          skipped: true,
          parent,
          hash
        })
      }
    })
  }

  async function preput(f: File) {
    const hash = await md5(f)
    const r = await api.preput(hash)
    if ('url' in r) {
      snap.tasks.push({f, ...r})
      snap.files.push({
        key: r.key,
        uploadedSize: 0,
        total: f.size,
        name: f.name
      })
    } else {
      snap.files.push({
        uploadedSize: f.size,
        total: f.size,
        name: f.name,
        key: r.key,
        skipped: true
      })

      snap.uploadedSize += f.size

      // 直接完成
      api.complete({
        hash,
        name: f.name,
        skipped: true,
        key: r.key,
        parent
      })
    }
  }
  /**
   * 1. 创建上传任务
   * 2. 创建文件列表
   */
  async function handle(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const f = files.item(i)!
      snap.total += f.size
      if (f.size > BLOCK_SIZE) multipart(f)
      else preput(f)
    }
  }

  async function loop(tasks: Q[]) {
    if (!snap.done) return
    while (tasks.length) {
      const _tasks = tasks.splice(0, 10)
      await Promise.all(_tasks.map(async item => {
        if ('uploadId' in item) {
          const {i, f, key, url} = item
          const j = i + 1
          const part = f.slice(i * BLOCK_SIZE, j * BLOCK_SIZE)
          const tf = snap.files.find(f => f.key === key)!
          const hash = await api.put(url, part)

          snap.uploadedSize += part.size
          tf.uploadedSize += part.size
          // @ts-expect-error
          tf.parts.push({PartNumber: j, ETag: hash})

          // 上传完成
          if (tf.uploadedSize === tf.total) {
            await api.complete({
              key,
              hash,
              name: f.name,
              // @ts-expect-error
              parts: tf.parts,
              // @ts-expect-error
              uploadId: tf.uploadId
            })
          }
        } else {
          const tf = snap.files.find(f => f.key === item.key)!
          const hash = await api.put(item.url, item.f)
          snap.uploadedSize += item.f.size
          tf.uploadedSize += item.f.size
          tf.hash = hash
          if (tf.uploadedSize === tf.total) {
            await api.complete({
              key: tf.key,
              hash,
              name: tf.name,
            })
          }
        }
      }))
    }
    snap.done = true
  }

  $effect(() => {
    const _files = files
    untrack(() => handle(_files))
  })

  $effect(() => {
    const tasks = snap.tasks
    untrack(() => loop(tasks))
  })
</script>

<div class="root group h-20 w-20 fixed bottom-8 right-4 overflow-hidden hover:shadow">
  <div class="group-hover:hidden bg-indigo-500 w-full font-[monospace] h-full flex items-center justify-center text-white font-bold text-lg">{toPrecent(progress)}</div>
  <ol class="list h-full w-full hidden group-hover:block absolute top-0 left-0 bg-white overflow-auto">
    {#each snap.files as f (f.key)}
      <li class="text-slate-500 whitespace-nowrap text-ellipsis h-10 w-full flex justify-between items-center text-sm px-2 relative" style:--w="50%">
        <span class="flex-1">{f.name}</span>
        <span class="shrink-0 text-pink-500 font-[monospace]">{toPrecent(f.uploadedSize / f.total)}</span>
      </li>
    {/each}
  </ol>
</div>

<style lang="scss">
  .root {
    border-radius: 2.5rem;
    transition: width .3s ease, height .3s ease, border-radius .3s ease;

    &:hover {
      border-radius: .5rem;
      width: 20rem;
      height: 32rem;
      cursor: default;
      border: 1px solid #eee;
    }

    li:not(:first-child) {
      border-top: 1px dashed #ccc;
    }
  }

</style>
