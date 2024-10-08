export * as store from './store.svelte'

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

export function delay(t = 0) {
  return new Promise(resolve => {
    setTimeout(resolve, t * 1e3)
  })
}
