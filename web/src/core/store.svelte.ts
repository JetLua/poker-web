export const user = $state(loadUser())

function loadUser() {
  try {
    const raw = localStorage.getItem('mg:user')
    if (!raw) return {
      id: '',
      name: '',
      avatar: ''
    }
    return JSON.parse(raw)
  } catch {
    return {
      id: '',
      name: '',
      avatar: ''
    }
  }
}

export const room = $state<yew.Room>({
  id: '',
  banker: '',
  cards: [] as yew.Card[],
  joinable: false,
  players: {},
  DSBA: 10,
  capcity: 4,
  password: '',
  phase: '' as yew.RoomPhase,
  phaseIndex: 0,
  turns: [],
  visitable: true
})

class Socket {
  private s: WebSocket
  private handles = {
    createRoom: undefined as Function | undefined
  }

  constructor() {
    this.s = new WebSocket(`${import.meta.env.VITE_WS}?pid=${user.id}`)
    this.on('message', e => {
      const {type, data} = this.decode(e.data) as yew.RMsg
      switch (type) {
        case 'room:create': {
          this.handles.createRoom?.(data)
          break
        }

        case 'room:sync': {
          room.id = data.id
          room.password = data.password
          room.capcity = data.capcity
          room.DSBA = data.DSBA
          room.players = data.players
          room.turns = data.turns
          room.visitable = data.visitable
          room.phase = data.phase
          room.phaseIndex = data.phaseIndex
          room.cards = data.cards
          room.banker = data.banker
          room.joinable = data.joinable
          break
        }

        case 'player:create': {
          user.id = data.id

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
}

export const ws = new Socket()
