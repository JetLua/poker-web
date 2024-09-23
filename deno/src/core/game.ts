import {proxyMap} from 'valtio/vanilla/utils'
import {proxy, subscribe, ref, snapshot} from 'valtio/vanilla'

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
  state = proxy({
    id: '',
    capcity: 4,
    password: '',
    visitable: true,
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
    players: {} as Record<string, Player>
  })

  get id() {return this.state.id}

  constructor(opts?: {
    capcity?: number
    password?: string
    visitable?: boolean}) {
    this.state.capcity = opts?.capcity ?? 4
    this.state.password = opts?.password ?? ''
    this.state.visitable = opts?.visitable ?? true
    this.state.id = crypto.randomUUID()

    subscribe(this.state, () => {
      this.broadcast(this.state)
    })
  }

  add(p: Player) {
    this.state.players[p.id] = p
  }

  async next() {

  }

  async start() {
    while (true) {
      const r = await this.next()
    }
  }

  broadcast(data: object) {
    for (const k in this.state.players) {
      const p = this.state.players[k]
      p.send({type: 'room:sync', data})
    }
  }
}

export class Player {
  ws: WSContext
  id: string
  chip = 0

  constructor(opts: {
    ws: WSContext
    id?: string}) {
    this.id = opts.id ?? crypto.randomUUID()
    this.ws = ref(opts.ws)
  }

  send(data: yew.RMsg) {
    this.ws.send(this.encode(data))
  }

  onMessage(data: unknown) {

  }

  private encode(data: object) {
    return JSON.stringify(data)
  }

  private decode(data: string) {
    return JSON.parse(data)
  }

  toJSON() {
    return {
      id: this.id,
      chip: this.chip
    }
  }
}
