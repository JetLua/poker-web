import {browser} from '$app/environment'
import * as store from './store.svelte'

export class Room {
  state = $state({
    players: {} as Record<string, Player>,
    cards: [{}, {}, {}, {}, {}],
    capcity: 4,
    password: '',
    visitable: true,
    /** 庄家id */
    banker: '',
    /** 房主id */
    owner: '',
    phase: 'ready',
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

  constructor() {
    const total = 10

    for (let i = 0; i < total; i++) {
      const p = new Player()
      p.state.index = i
      this.state.players[p.state.id] = p
    }

    // 随机设置当前用户的id
    store.user.id = this.getPlayer(total * Math.random() | 0).state.id

    // 随机设置房主
    this.state.owner = this.getPlayer(total * Math.random() | 0).state.id
  }

  start() {
    const {state: {playersCount, players}} = this
    // 抽取随机庄家
    this.state.banker = this.getPlayer(playersCount * Math.random() | 0).state.id
  }
}

export class Player {
  state = $state({
    id: '',
    index: 0,
    bet: 0,
    cards: [{}, {}],
  })

  constructor() {
    this.state.id = crypto.randomUUID()
  }
}

export const room = new Room()

if (browser) window.room = room
