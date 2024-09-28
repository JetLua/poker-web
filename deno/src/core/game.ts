import {ref, proxy, subscribe} from 'valtio/vanilla'
import type {WSContext} from 'hono/ws'

export const rooms = new Map<string, Room>()
export const players = new Map<string, Player>()

export class Player {
  ws?: WSContext
  room?: Room
  vRoom?: Room

  state = proxy({
    id: '',
    name: '',
    avatar: undefined as undefined | string,
    chip: 0,
    online: false,
  })

  get id() {return this.state.id}
  set id(v: string) {this.state.id = v}
  get online() {return this.state.online}
  set online(v: boolean) {this.state.online = v}

  constructor(opts: {
    ws?: WSContext
    id?: string} = {}) {
    this.state.id = opts.id ?? crypto.randomUUID()
    this.ws = opts.ws && ref(opts.ws)
  }

  send(data: yew.RMsg) {
    if (!this.ws) return
    if (this.ws.readyState !== 1) return
    this.ws.send(this.encode(data))
  }

  onMessage(data: unknown) {

  }

  leave() {
    if (!this.room) return
    this.room.remove(this.id)
    this.room = undefined
  }

  private encode(data: object) {
    return JSON.stringify(data)
  }

  private decode(data: string) {
    return JSON.parse(data)
  }

  toJSON() {
    return this.state
  }
}

/**
 * ready: 准备阶段
 * blind: 盲注阶段
 * deal: 发牌阶段
 * player: 玩家操作阶段
 * flop: 翻牌阶段
 */
type RoomPhase = 'ready' | 'blind' | 'deal' | 'player' | 'flop'

interface Bet {
  id: string
  amount: number
  allIn: boolean
}

export class Room {
  state = proxy({
    id: '',
    cards: [{}, {}, {}, {}, {}],
    banker: '',
    capcity: 4,
    password: '',
    visitable: true,
    ownerId: '',
    /** 默认小盲金额 */
    DSBA: 10,
    phase: 'ready' as RoomPhase,
    phaseIndex: 0,
    /**
     * 每阶段圈数的押注
     * 带上id方便后面计算
     * 平分金额
     */
    turns: [] as Bet[][],
    players: {} as Record<string, Player>,

    get joinable() {
      return Object.keys(this.players).length < this.capcity && this.phase === 'ready'
    }
  })

  visitors = [] as Player[]

  get id() {return this.state.id}

  constructor(opts: {
    owner: Player
    capcity?: number
    password?: string
    visitable?: boolean}) {
    this.state.capcity = opts.capcity ?? 4
    this.state.password = opts.password ?? ''
    this.state.visitable = opts.visitable ?? true
    this.state.id = crypto.randomUUID()
    this.state.players[opts.owner.id] = opts.owner

    this.broadcast(this.state)
    this.add(opts.owner, true)

    subscribe(this.state, () => {
      this.broadcast(this.state)
    })
  }

  add(p: Player, owner?: boolean) {
    if (owner) this.state.ownerId = p.id
    p.room = this
    this.state.players[p.id] = p
  }

  addVisitor(p: Player) {
    if (this.visitors.includes(p)) return
    this.visitors.push(p)
    p.vRoom = this
    p.send({type: 'room:sync', data: this.state})
  }

  remove(id: string) {
    delete this.state.players[id]
  }

  removeVisitor(p: Player) {
    const i = this.visitors.indexOf(p)
    if (i !== -1) this.visitors.splice(i, 1)
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

  toJSON() {
    return this.state
  }
}
