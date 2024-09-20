export const user = $state({
  name: '',
  avatar: ''
})

export const mem = $state({
  paths: [] as string[],
  dir: {name: '', id: ''}
})

export const room = $state({
  players: [] as yew.Player[]
})

class Socket {
  private s: WebSocket

  constructor() {
    this.s = new WebSocket(import.meta.env.VITE_WS)
    this.on('message', e => {
      console.log(e.data)
    })
  }

  on(type: 'message', fn: (e: MessageEvent) => void): void
  on(type: keyof WebSocketEventMap, fn: (e: any) => void) {
    this.s.addEventListener(type, fn)
  }

  send<T>(data: T) {
    this.s.send(this.encode(data))
  }

  encode<T>(data: T) {
    return JSON.stringify(data)
  }

  decode<T>(data: string) {
    return JSON.parse(data) as T
  }
}

export const ws = new Socket()
