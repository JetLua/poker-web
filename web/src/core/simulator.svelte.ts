export class Room {
  state = $state({
    players: {} as Record<string, Player>,
    cards: [{}, {}, {}, {}, {}],
    capcity: 4,
    password: '',
    visitable: true,
    get playersCount() {
      return Object.keys(this.players).length
    }
  })

  constructor() {
    for (let i = 0; i < 10; i++) {
      const p = new Player()
      p.state.index = i
      this.state.players[p.state.id] = p
    }
  }
}

export class Player {
  state = $state({
    id: '',
    index: 0
  })

  constructor() {
    this.state.id = crypto.randomUUID()
  }
}
