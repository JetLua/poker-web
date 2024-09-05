import crypto from 'crypto-js'
export * as store from './store.svelte'

const {MD5, lib} = crypto

export function sync<T>(p: Promise<T>) {
  return p.then(ok).catch(error)
}

export function error(data: unknown): [null, Error] {
  if (data instanceof Error) return [null, data]
  return [null, new Error(data as any)]
}

export function ok<T>(data: T): [T, null] {
  return [data, null]
}

export async function md5(f: File, bs?: number) {
  if (bs) {
    const total = Math.ceil(f.size / bs)
    const parts = await Promise.all(Array.from({length: total}, async (_, i) => {
      const p = f.slice(i * bs, (i + 1) * bs)
      return MD5(lib.WordArray.create(await p.arrayBuffer()))
    }))

    const s = parts.reduce((p, n) => p.concat(n))
    return MD5(s).toString()
  } else {
    return MD5(lib.WordArray.create(await f.arrayBuffer())).toString()
  }
}
