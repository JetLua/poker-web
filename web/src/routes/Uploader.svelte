<script lang="ts">
  import {sync} from '~/core'
  import {toast} from '$lib/sui'
  // class Task {
  //   size = 5 * 1024 * 1024

  //   microTasks = [] as Array<{
  //     key: string
  //     file: File
  //     i: number
  //     uploadId: string
  //     url: string
  //     total: number
  //   }>

  //   macroTasks = new Map<string, {total: number, key: string}>()


  //   constructor(files: FileList) {
  //     this.run(files)
  //   }

  //   async run(files: FileList) {
  //     for (let i = 0; i < files.length; i++) {
  //       const f = files.item(i)!
  //       if (f.size > this.size) {
  //         await this.multipart(f)
  //       }
  //     }

  //     const doneTasks = new Map<string, {i: number, key: string, eTag: string}[]>()

  //     // 每次选取10个任务
  //     while (this.microTasks.length) {
  //       const tasks = this.microTasks.splice(0, 10)
  //       const r = await sync(Promise.all(tasks.map(async ({i, file, url, key, total, uploadId}) => {
  //         const j = i + 1
  //         const part = file.slice(i * this.size, j * this.size)
  //         return {
  //           i: j,
  //           key,
  //           total,
  //           uploadId,
  //           eTag: await api.put(url, part, e => console.log(e.progress)),
  //         }
  //       })))

  //       if (r[1]) return alert(r[1].message)

  //       for (const item of r[0]) {
  //         const t = doneTasks.get(item.uploadId)
  //         if (t) t.push(item)
  //         else doneTasks.set(item.uploadId, [item])
  //       }
  //     }

  //     console.log(doneTasks, this.macroTasks)

  //     for (const id of doneTasks.keys()) {
  //       const mat = this.macroTasks.get(id)
  //       const dt = doneTasks.get(id)
  //       if (!mat || !dt) continue
  //       const {total} = mat
  //       if (total === dt.length) {
  //         // complete
  //         api.complete({
  //           key: mat.key,
  //           uploadId: id,
  //           parts: dt.map(item => {
  //             return {
  //               PartNumber: item.i,
  //               ETag: item.eTag
  //             }
  //           })
  //         })
  //       }
  //     }
  //   }

  //   async multipart(file: File) {
  //     const total = Math.ceil(file.size / this.size)
  //     const [r, err] = await sync(api.multipart(total))
  //     if (err) return [null, err]
  //     const {uploadId, urls, key} = r
  //     this.macroTasks.set(uploadId, {total, key})
  //     this.microTasks.push(...Array.from({length: total}, (_, i) => {
  //       return {
  //         i,
  //         key,
  //         file,
  //         total,
  //         uploadId,
  //         url: urls[i],
  //       }
  //     }))
  //   }
  // }

  // function upload() {
  //   input.value = ''
  //   input.click()
  //   input.onchange = () => {
  //     const files = input.files
  //     if (!files || !files.length) return
  //     new Task(files)
  //   }
  // }
  import * as api from '~/api'
  import {onMount} from 'svelte'

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
    parts: {
      PartNumber: number
      ETag: string
    }[]
  } | {
    name: string
    key: string
    uploadedSize: number
    total: number
  }

  const snap = $state({
    uploadedSize: 0,
    total: 0,
    files: [] as F[],
    queue: [] as Q[]
  })

  const progress = $derived(snap.total ? snap.uploadedSize / snap.total : 0)

  interface Props {
    files: FileList
  }

  const BLOCK_SIZE = 5 * 1024 * 1024
  const {files}: Props = $props()

  function toPrecent(i: number) {
    return (i * 100).toFixed(0) + '%'
  }

  async function chunk(f: File) {
    const total = Math.ceil(f.size / BLOCK_SIZE)
    const {urls, key, uploadId} = await api.multipart(total)
    snap.files.push({
      key,
      uploadId,
      name: f.name,
      total: f.size,
      uploadedSize: 0,
      parts: []
    })
    snap.queue.push(...urls.map((url, i) => {
      return {
        i,
        f,
        url,
        key,
        uploadId
      }
    }))
  }

  async function init() {
    // todo: md5 验证是否已有相同文件
    for (let i = 0; i < files.length; i++) {
      const f = files.item(i)!
      snap.total += f.size
      if (f.size > BLOCK_SIZE) {
        await chunk(f)
      } else {
        const r = await sync(api.preput())
        if (r[1]) return toast.error(r[1])
        snap.queue.push({
          f,
          key: r[0].key,
          url: r[0].url,
        })
        snap.files.push({
          uploadedSize: 0,
          total: f.size,
          name: f.name,
          key: r[0].key
        })
      }
    }

    // 预处理完成开始上传
    // 但每次只传10个
    while (snap.queue.length) {
      const tasks = snap.queue.splice(0, 10)
      await Promise.all(tasks.map(async item => {
        if ('uploadId' in item) {
          const {i, f, key, url} = item
          const j = i + 1
          const part = f.slice(i * BLOCK_SIZE, j * BLOCK_SIZE)
          const tf = snap.files.find(f => f.key === key)!
          const eTag = await api.put(url, part)

          snap.uploadedSize += part.size
          tf.uploadedSize += part.size

          if ('parts' in tf) tf.parts.push({PartNumber: j, ETag: eTag})
        } else {
          const tf = snap.files.find(f => f.key === item.key)!
          await api.put(item.url, item.f)
          snap.uploadedSize += item.f.size
          tf.uploadedSize += item.f.size
        }
      }))
    }

    console.log(snap.uploadedSize, snap.total)

    // 过滤出分片上传的文件
    const _files = snap.files.filter(item => 'uploadId' in item)

    while (_files.length) {
      const items = _files.splice(0, 10)
      Promise.all(items.map(item => {
        return api.complete({
          key: item.key,
          parts: item.parts,
          uploadId: item.uploadId
        })
      }))
    }
  }

  onMount(() => {
    init()
  })
</script>

<div class="root h-20 w-20 bg-indigo-500 fixed bottom-8 right-4">
  <div class="w-full font-[monospace] h-full flex items-center justify-center text-white font-bold text-lg">{toPrecent(progress)}</div>
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
    }
  }

</style>
