import axios, {type AxiosProgressEvent} from 'axios'
import n from './core'

export function multipart(num: number) {
  return n.get<null, {urls: string[], uploadId: string, key: string}>('/auth/multipart', {
    params: {num}
  })
}

export async function put(url: string, data: Blob, onUploadProgress?: (e: AxiosProgressEvent) => void) {
  // return fetch(url, {method: 'PUT', body: data})
    // .then<string>(r => JSON.parse(r.headers.get('etag')!) as string)
  return axios.put(url, data, {onUploadProgress})
    .then(r => r.headers['etag'])
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

export namespace file {
  interface File {
    id: string
  }
  export function set(name: string, id?: string) {
    return n.post<null, boolean>('/auth/folder', {name, id})
  }

  export function get(opts?: {
    parent?: string
    cursor?: number
    size?: number
  }): Promise<Array<File>>
  export function get(params?: any) {
    return n.get<null, any>('/auth/files', {params})
  }
}
