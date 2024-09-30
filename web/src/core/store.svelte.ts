export const user = $state<{id: string}>(loadUser())

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
  ownerId: '',
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

export const socket = {
  ws: undefined as undefined | WebSocket,

  connect() {
    const ws = this.ws = new WebSocket(`${import.meta.env.VITE_WS}`)
    ws.onmessage = e => {
      const {type, data} = this.decode(e.data) as yew.RMsg
      switch (type) {
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
          room.ownerId = data.ownerId
          break
        }
      }
    }
  },

  send<T extends yew.Msg>(data: T) {
    if (!this.ws) return
    this.ws.send(this.encode(data))
  },

  encode<T>(data: T) {
    return JSON.stringify(data)
  },

  decode<T>(data: string) {
    return JSON.parse(data) as T
  }
}
