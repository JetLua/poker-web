import {browser} from '$app/environment'
import * as store from './store.svelte'

export class Room {
  state = $state({
    id: '',
    players: {} as Record<string, Player>,
    cards: [
      {placeholder: true},
      {placeholder: true},
      {placeholder: true},
      {placeholder: true},
      {placeholder: true}
    ],
    logs: [] as string[],
    capcity: 4,
    password: '',
    visitable: true,
    /** 庄家id */
    dealer: '',
    /** 房主id */
    owner: '',
    /**
     * ready: 准备阶段，游戏未开始
     * deal: 发牌阶段，客户端实现发牌动画
     */
    phase: 'ready' as yew.Phase,
    get playersCount() {
      return Object.keys(this.players).length
    }
  })

  /** 通过id或者索引获取玩家 */
  getPlayer(index: number): Player
  getPlayer(id: string): Player
  getPlayer(v: number | string) {
    if (typeof v === 'number') {
      for (const k in this.state.players) {
        const p = this.state.players[k]
        if (p.state.index === v) return p
      }
    }
    return this.state.players[v]
  }

  log(s: string) {
    this.state.logs.push(s)
    if (this.state.logs.length > 5) this.state.logs.shift()
  }

  constructor() {
    const total = 10
    const {state} = this

    state.id = crypto.randomUUID()

    for (let i = 0; i < total; i++) {
      const p = new Player()
      p.room = this
      p.state.index = i
      p.state.rid = state.id
      p.state.balance = 9000
      this.state.players[p.state.id] = p
    }

    // 随机设置当前用户的id
    store.user.id = this.getPlayer(total * Math.random() | 0).state.id

    // 随机设置房主
    // 测试时 将当前用户设置为房主
    this.state.owner = store.user.id // this.getPlayer(total * Math.random() | 0).state.id
  }

  async start() {
    const {state} = this
    // 抽取随机庄家
    const dealer = this.getPlayer(state.playersCount * Math.random() | 0)
    state.dealer = dealer.state.id
    state.phase = 'deal'
    this.log('游戏开始')
    this.log(`庄家: ${dealer.name}`)
    // 分配大小盲注
    const sb = dealer.next()
    const bb = sb.next()
    sb.bet(10)
    bb.bet(2 * 10)
    this.log(`小盲: ${sb.name}`)
    this.log(`大盲: ${bb.name}`)

    //
  }
}

export class Player {
  room?: Room

  get name() {return this.state.name || `No.${this.state.index}`}

  state = $state({
    id: '',
    rid: '',
    index: 0,
    name: '',
    bet: 0,
    balance: 0,
    cards: [{}, {}],
  })

  constructor() {
    this.state.id = crypto.randomUUID()
  }

  bet(v: number) {
    if (v < this.state.balance) {
      this.state.bet += v
      this.state.balance -= v
    } else {
      // todo
    }
  }

  next() {
    if (!this.room) return
    return this.room.getPlayer((this.state.index + 1) % this.room.state.playersCount)
  }
}

export const room = new Room()

if (browser) window.room = room
