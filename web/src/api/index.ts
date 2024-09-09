import axios, {type AxiosProgressEvent} from 'axios'
import n from './core'

export function multipart(num: number, hash?: string) {
  return n.get<null, {urls: string[], uploadId: string, key: string} | {key: string}>('/auth/multipart', {
    params: {num, hash}
  })
}

export async function put(url: string, data: Blob, onUploadProgress?: (e: AxiosProgressEvent) => void) {
  // return fetch(url, {method: 'PUT', body: data})
    // .then<string>(r => JSON.parse(r.headers.get('etag')!) as string)
  return axios.put(url, data, {onUploadProgress})
    .then(r => (r.headers['etag'] as string).replaceAll('"', ''))
}

export async function preput(hash?: string) {
  return n.get<null, {key: string, url: string} | {key: string}>('/auth/preput', {params: {hash}})
}

export function complete(opts: {
  name: string
  key: string
  skipped?: boolean
  hash?: string
  uploadId?: string
  parent?: string
  parts?: Array<{PartNumber: number, ETag: string}>}) {
  return n.post<null, string>('/auth/complete', opts)
}

export function login() {
  return n.get<null, {url: string, id: string}>('/login')
}

export function info() {
  return n.get<null, {name: string, avatar: string}>('/auth/info')
}

export namespace file {
  export function set(opts: {name: string, id?: string, parent?: string}) {
    return n.post<null, boolean>('/auth/folder', opts)
  }

  export function get(opts?: {
    parent?: string
    cursor?: number
    size?: number
  }): Promise<Array<yew.File>>
  export function get(params?: any) {
    return n.get<null, any>('/auth/files', {params})
  }

  export function del(id: string) {
    return n.delete<null, boolean>('/auth/file', {params: {id}})
  }

  export function rename(opts: {id: string, name: string, parent?: string}) {
    return n.post<null, boolean>('/auth/rename', opts)
  }
}
