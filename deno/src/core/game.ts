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
    index: 0,
    avatar: undefined as undefined | string,
    chip: 0,
    online: false,
  })

  get id() {return this.state.id}
  set id(v: string) {this.state.id = v}
  get online() {return this.state.online}
  set online(v: boolean) {this.state.online = v}
  get name() {return this.state.name}
  set name(v: string) {this.state.name = v}
  get avatar() {return this.state.avatar}
  set avatar(v: string | undefined) {this.state.avatar = v}
  get index() {return this.state.index}
  set index(v: number) {this.state.index = v}

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

  decode<T>(data: string) {
    return JSON.parse(data) as T
  }

  toJSON() {
    return this.state
  }
}

/**
 * ready: 准备阶段
 * deal: 发牌阶段
 * player: 玩家操作阶段
 * flop: 翻牌阶段
 */
type RoomPhase = 'ready' | 'deal' | 'player' | 'flop'

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
    bankerIndex: 0,
    /**
     * 每阶段圈数的押注
     * 带上id方便后面计算
     * 平分金额
     */
    turns: [] as Bet[][],
    players: {} as Record<string, Player>,

    get joinable() {
      return Object.keys(this.players).length < this.capcity && this.phase === 'ready'
    },

    get playersCount() {
      return Object.keys(this.players).length
    }
  })

  visitors = [] as Player[]

  get id() {return this.state.id}
  get players() {return this.state.players}

  constructor(opts: {
    owner: Player
    capcity?: number
    password?: string
    visitable?: boolean}) {
    this.state.capcity = opts.capcity ?? 4
    this.state.password = opts.password ?? ''
    this.state.visitable = opts.visitable ?? true
    this.state.id = crypto.randomUUID()

    this.add(opts.owner, true)
    this.broadcast(this.state)

    subscribe(this.state, () => {
      this.broadcast(this.state)
    })
  }

  add(p: Player, owner?: boolean) {
    if (p.id in this.players) return
    if (owner) this.state.ownerId = p.id

    p.room = this
    p.index = this.state.playersCount
    this.players[p.id] = p
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

  next() {
    switch (this.state.phase) {
      case 'ready': {
        this.state.phase = 'deal'
        break
      }
    }
  }

  start() {
    // todo: 一些准备工作
    // 决定谁是庄家：随机
    this.state.bankerIndex = this.state.playersCount * Math.random() | 0
    console.log('game:start')
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
