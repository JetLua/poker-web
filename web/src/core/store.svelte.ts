export const user = $state({
  name: '',
  avatar: ''
})

export const mem = $state({
  paths: [] as string[],
  dir: {name: '', id: ''}
})

export const room = $state({
  id: '',
  players: [] as yew.Player[]
})

class Socket {
  private s: WebSocket
  private handles = {
    createRoom: undefined as Function | undefined
  }

  constructor() {
    this.s = new WebSocket(`${import.meta.env.VITE_WS}?pid=123`)
    this.on('message', e => {
      const data = this.decode(e.data) as yew.Msg
      switch (data.type) {
        case 'room:create': {
          this.handles.createRoom?.()
          break
        }
      }
    })
  }

  on(type: 'message', fn: (e: MessageEvent) => void): void
  on(type: keyof WebSocketEventMap, fn: (e: any) => void) {
    this.s.addEventListener(type, fn)
  }

  send<T extends yew.Msg>(data: T) {
    this.s.send(this.encode(data))
  }

  private encode<T>(data: T) {
    return JSON.stringify(data)
  }

  private decode<T>(data: string) {
    return JSON.parse(data) as T
  }

  createRoom(data: Extract<yew.Msg, {type: 'room:create'}>['data']) {
    return new Promise(resolve => {
      this.send({type: 'room:create', data})
      this.handles.createRoom = resolve
    })
  }
}

export const ws = new Socket()
