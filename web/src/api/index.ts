import n from './core'

export namespace room {
  export function create(data: {
    pid: string
    visitable: boolean
    password?: string
    capcity: number}) {
    return n.post<null, boolean>('/room/create', data)
  }

  export function get() {
    return n.get<null, yew.Room[]>('/room')
  }

  export function join(id: string) {
    return n.post<null, boolean>('/room/join', {id})
  }
}

export function login() {
  return n.get<null, {id: string}>('/login')
}
