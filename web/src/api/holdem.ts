import n from './core'

export function createRoom(data: {
  pid: string
  visitable: boolean
  password?: string
  capcity: number}) {
  return n.post<null, boolean>('/holdem/room/create', data)
}
