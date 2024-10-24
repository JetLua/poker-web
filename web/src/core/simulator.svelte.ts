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
  async run(signal: AbortSignal): Promise<yew.Action> {
    // 等待5秒 模拟思考
    await delay(5)
    // 停止前端倒计时
    this.player.state.countdown = 0
    const bet = this.player.prev().state.bet
    if (bet < this.player.state.balance) {
      this.player.bet(bet)
      return {action: 'call', v: bet}
    }
  }
}


export class Room {
  cards = [] as yew.Card[]

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
    turnsIndex: 0,
    turns: [{}] as Record<string, number>[],
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
    const total = 10
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
    // 抽取随机庄家
    const dealer = this.getPlayer(state.playersCount * Math.random() | 0)
    state.dealer = dealer.state.id
    state.phase = 'deal'
    this.log('Game started')
    this.log(`Dealer: ${dealer.name}`)
    // 分配大小盲注
    const sb = dealer.next()
    const bb = sb.next()
    sb.bet(10)
    bb.bet(2 * 10)
    this.log(`Small blind: ${sb.name}`)
    this.log(`Big blind: ${bb.name}`)

    let r, p
    // 等待发牌结束
    this.deal()
    await delay(3)

    p = bb
    while (true) {
      p = p.next()
      this.log(`${p.name}: Making a decision`)
      r = await p.run('act')
      this.log(`${p.name}: ${r.action} ${r.v}`)
      break
    }
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
    name: '',
    bet: 0,
    balance: 0,
    online: true,
    countdown: 0,
    cards: [{}, {}] as yew.Card[],
    status: '' as 'act'
  })


  constructor(opts: {ai?: boolean} = {}) {
    this.state.id = crypto.randomUUID()
    if (opts.ai) this.ai = new AI(this)
  }

  async respond(signal: AbortSignal) {
    return new Promise<yew.Action>(resolve => {
      this.handle = resolve
      signal.addEventListener('abort', () => {
        this.handle({action: 'fold'})
      }, {once: true})
    })
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
    switch (type) {
      case 'act': {
        // 等待玩家操作
        this.state.status = 'act'
        this.signal = AbortSignal.timeout(10e3)
        this.tick(10, this.signal)
        return this.ai ? this.ai.run(this.signal) : this.respond(this.signal)
      }
    }
  }

  bet(v: number) {
    if (v < this.state.balance) {
      this.room.state.currentBet = v
      this.state.bet += v
      this.state.balance -= v
      this.room.state.turns[this.room.state.turnsIndex][this.state.id] = this.state.bet
    } else {
      // todo
    }
  }

  next() {
    if (!this.room) return
    return this.room.getPlayer((this.state.index + 1) % this.room.state.playersCount)
  }

  prev() {
    if (!this.room) return
    let i = this.state.index - 1
    if (i < 0) i += this.room.state.playersCount
    return this.room.getPlayer(i % this.room.state.playersCount)
  }
}

export const room = new Room()

if (browser) window.room = room
