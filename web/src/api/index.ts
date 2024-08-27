import n from './core'

export function multipart(num: number) {
  return n.get<null, {urls: string[], uploadId: string, key: string}>('/auth/multipart', {params: {num}})
}

export async function put(url: string, data: Blob) {
  return fetch(url, {method: 'PUT', body: data})
    .then<string>(r => JSON.parse(r.headers.get('etag')!) as string)
}

export function complete(opts: {
  key: string
  uploadId: string
  parts: Array<{PartNumber: number, ETag: string}>}) {
  return n.post<null, string>('/auth/multipart/complete', opts)
}

export function login() {
  return n.get<null, {url: string, id: string}>('/login')
}

export function info() {
  return n.get<null, {name: string, avatar: string}>('/auth/info')
}
