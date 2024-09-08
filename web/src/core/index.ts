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

const es = new Map<string, Function>()

export async function md5(key: string, file: File, bs?: number) {
  return new Promise<string>(resolve => {
    w.postMessage({
      key,
      file,
      bs
    })
    es.set(key, resolve)
  })
}

let w: Worker
export function initWorker() {
  if (w) return w
  w = new Worker('/worker.js')
  w.addEventListener('message', e => {
    console.log(e.data)
    const fn = es.get(e.data.key)!
    fn(e.data.hash)
  })
  return w
}
