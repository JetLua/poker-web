import {proxy, subscribe} from 'valtio/vanilla'
import type { WSContext } from 'hono/ws'

export class Room {
  id: string

  state = proxy({
    players: [] as Array<Player>
  })

  constructor(opts?: {}) {
    this.id = crypto.randomUUID()
    subscribe(this.state, ops => {
      console.log(ops)
    })
  }

  add(p: Player) {
    this.state.players.push(p)
  }
}

export class Player {
  id: string
  ws: WSContext

  constructor(opts: {
    ws: WSContext
    id?: string}) {
    this.id = opts.id ?? crypto.randomUUID()
    this.ws = opts.ws
  }
}
