import {proxy, subscribe} from 'valtio/vanilla'
import type { WSContext } from 'hono/ws'

/**
 * blind: 盲注阶段
 * deal: 发牌阶段
 * player: 玩家操作阶段
 * flop: 翻牌阶段
 */
type RoomPhase = 'blind' | 'deal' | 'player' | 'flop'

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
    turns: [],
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

  next() {

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
