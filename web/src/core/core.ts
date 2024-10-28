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

export function delay(t = 0, signal?: AbortSignal) {
  if (signal?.aborted) return Promise.resolve(false)
  return new Promise<boolean>(resolve => {
    const id = setTimeout(resolve.bind(undefined, true), t * 1e3)
    signal?.addEventListener('abort', () => {
      clearTimeout(id)
      resolve(false)
    }, {once: true})
  })
}
