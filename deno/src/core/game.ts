import {proxyMap} from 'valtio/vanilla/utils'
import {proxy, subscribe, ref} from 'valtio/vanilla'

import type {WSContext} from 'hono/ws'

/**
 * blind: 盲注阶段
 * deal: 发牌阶段
 * player: 玩家操作阶段
 * flop: 翻牌阶段
 */
type RoomPhase = 'blind' | 'deal' | 'player' | 'flop'

interface Bet {
  id: string
  amount: number
  allIn: boolean
}

export class Room {
  id: string

  state = proxy({
    /** 默认小盲金额 */
    DSBA: 10,
    phase: '' as RoomPhase,
    phaseIndex: 0,
    /**
     * 每阶段圈数的押注
     * 带上id方便后面计算
     * 平分金额
     */
    turns: [] as Bet[][],
    players: proxyMap<string, Player>()
  })

  constructor(opts?: {}) {
    this.id = crypto.randomUUID()

    subscribe(this.state, ops => {
      console.log(ops)
    })
  }

  add(p: Player) {
    this.state.players.set(p.id, p)
  }

  async next() {

  }

  async start() {
    while (true) {
      const r = await this.next()
    }
  }

  broadcast(data: object) {
    this.state.players.forEach(p => {
      p.send(data)
    })
  }
}

export class Player {
  id: string
  ws: WSContext
  chip = 0

  constructor(opts: {
    ws: WSContext
    id?: string}) {
    this.id = opts.id ?? crypto.randomUUID()
    this.ws = ref(opts.ws)
  }

  send(data: object) {
    this.ws.send(this.encode(data))
  }

  private encode(data: object) {
    return JSON.stringify(data)
  }
}
