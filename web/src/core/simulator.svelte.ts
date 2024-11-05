import {browser} from '$app/environment'
import * as store from './store.svelte'
import {delay} from './core'

class AI {
  player: Player

  constructor(player: Player) {
    this.player = player
  }

  /**
   * 只有3种情况：
   * 1. 过牌 如果可以过
   * 2. 跟注
   * 3. 弃牌
   * 4. all in
   */
  async run(handle: (data: yew.Action) => void, signal: AbortSignal) {
    // 等待5秒 模拟思考
    const ok = await delay(5, signal)
    if (!ok) return
    // 停止前端倒计时
    this.player.state.countdown = 0
    const bet = this.player.room!.state.currentBet
    if (bet < this.player.state.balance) {
      this.player.bet(bet)
      handle({action: 'call', v: bet})
    }
  }
}


export class Room {
  cards = [] as yew.Card[]
  lastDealer?: Player

  state = $state({
    id: '',
    players: {} as Record<string, Player>,
    cards: [
      {placeholder: true},
      {placeholder: true},
      {placeholder: true},
      {placeholder: true},
      {placeholder: true}
    ] as yew.Card[],
    logs: [] as string[],
    /** 当前房间最小下注金额 */
    minBet: 10,
    /** 最大下注金额：默认无限制 */
    maxBet: Infinity,
    turnsIndex: 0,
    turns: [{}] as Record<string, {money: number, allIn?: boolean}[]>[],
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
    currentBet: 0,
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
    const total = 3
    const {state} = this

    state.id = crypto.randomUUID()

    for (let i = 0; i < total; i++) {
      const p = new Player({ai: true})
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

  /** 发牌 */
  deal() {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    const suits = ['heart', 'diamond', 'club', 'spade'] as yew.Suit[]
    const cards = [] as yew.Card[]
    for (const n of nums) {
      for (const s of suits) {
        cards.push({num: n, suit: s})
      }
    }

    // 五张底牌
    for (let i = 0; i < 5; i++) {
      const i = cards.length * Math.random() | 0
      this.cards.push(...cards.splice(i, 1))
    }

    // 每个玩家两张
    for (const k in this.state.players) {
      const p = this.state.players[k]
      for (let i = 0; i < 2; i++) {
        const j = cards.length * Math.random() | 0
        p.state.cards[i] = cards.splice(j, 1)[0]
      }
    }
  }

  async start() {
    const {state} = this
    /** 庄家:
     * 1. 从上一局庄家顺延
     * 2. 第一局默认玩家序号为0的是庄家
     */
    const dealer = this.lastDealer ? this.lastDealer.next()! : this.getPlayer(0)
    state.dealer = dealer.state.id
    state.phase = 'deal'
    this.log('Game started')
    this.log(`Dealer: ${dealer.name}`)
    // 选取小盲并下注
    const sb = dealer.next()
    sb.bet(state.minBet)
    const bb = sb.next()
    bb.bet(state.minBet * 2)
  }
}

export class Player {
  room?: Room
  signal?: AbortSignal
  ai?: AI
  ws?: WebSocket
  handle?: (opts: yew.Action) => void

  get name() {return this.state.name || `No.${this.state.index}`}

  cards = [] as yew.Card[]

  state = $state({
    id: '',
    rid: '',
    index: 0,
    /** 发牌顺序 */
    dealIndex: 0,
    name: '',
    bet: 0,
    balance: 0,
    online: true,
    countdown: 0,
    cards: [{}, {}] as yew.Card[],
    /** 正在操作 */
    op: false,
    status: '' as 'fold' | 'all-in'
  })


  constructor(opts: {ai?: boolean} = {}) {
    this.state.id = crypto.randomUUID()
    if (opts.ai) this.ai = new AI(this)
  }

  async operate(opts: yew.Action) {
    this.handle?.(opts)
  }

  async tick(t: number, signal: AbortSignal): Promise<boolean> {
    this.state.countdown = t
    if (!t) return true
    await delay(1)
    if (signal.aborted || !this.state.countdown) {
      this.state.countdown = 0
      return false
    }
    return this.tick(t - 1, signal)
  }

  async run(type: 'act') {
    const {state} = this

    switch (type) {
      case 'act': {
        state.op = true
        // 等待玩家操作
        this.signal = AbortSignal.timeout(10e3)
        this.tick(10, this.signal)

        const p = new Promise<yew.Action>(resolve => {
          this.handle = resolve
          this.signal?.addEventListener('abort', () => {
            this.handle?.({action: 'fold'})
          }, {once: true})
        })

        if (this.ai) this.ai.run(this.handle!, this.signal)
        const r = await p
        state.op = false

        return r
      }
    }
  }

  bet(v: number) {
    const {room, state} = this
    if (!room) return
    const d = v - this.state.bet
    const records = room.state.turns[room.state.turnsIndex][state.id] ?? []

    if (d < this.state.balance) {
      state.bet += d
      state.balance -= d
      room.state.currentBet = v
      records.push({money: d})
    } else {
      state.bet += d
      state.balance -= d
      // room.
      records.push({money: d, allIn: true})
    }
  }

  /**
   * 获取下一位玩家
   */
  next(): Player
  /**
   * @param filter 为 true 则过滤出可以说话的玩家
   */
  next(filter: boolean): Player | undefined
  next(filter?: boolean): Player | undefined {
    if (!this.room) return
    let i = this.state.index + 1
    let p: Player
    let count = 0
    while (true) {
      p = this.room.getPlayer(i % this.room.state.playersCount)

      if (filter) {
        if (p.state.status === 'all-in' || p.state.status === 'fold') {
          i++
          count++
          if (count === this.room.state.playersCount) return
          continue
        }
      }

      return p
    }
  }

  /**
   * @param filter 为 true 则返回可以说话的玩家
   */
  prev(filter?: boolean): Player | undefined {
    if (!this.room) return
    let i = this.state.index - 1
    i = i < 0 ? i + this.room.state.playersCount : i

    let p: Player
    let count = 0
    while (true) {
      p = this.room.getPlayer(i % this.room.state.playersCount)

      if (filter) {
        if (p.state.status === 'all-in' || p.state.status === 'fold') {
          i++
          count++
          if (count === this.room.state.playersCount) return
          continue
        }
      }

      return p
    }
  }
}

export const room = new Room()

if (browser) window.room = room
