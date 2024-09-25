import n from './core'

export namespace room {
  export function create(data: {
    pid: string
    visitable: boolean
    password?: string
    capcity: number}) {
    return n.post<null, boolean>('/room/create', data)
  }
}
