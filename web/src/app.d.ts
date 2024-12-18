/// <reference types="vite/client" />

declare global {
  interface Window {
    room: any
  }

  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }

  interface ImportMetaEnv {
    readonly VITE_BASE_URL: string
    readonly VITE_WS: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }

  namespace yew {
    /** 花色 */
    type Suit = 'heart' | 'spade' | 'diamond' | 'club'
    /** 方位 */
    type Orientation = 'top' | 'left' | 'right' | 'bottom'
    /** 房间状态 */
    type Phase = 'ready' | 'deal'

    /**
     * 玩家可以采取的行动
     * call: 跟注
     * raise: 加注
     * fold: 弃牌
     * all in: 下注所有筹码
     * check: 过牌
     */
    type ActionType = 'call' | 'raise' | 'fold' | 'all in' | 'check'

    interface Action {
      action: ActionType
      v?: number
    }

    interface Player {
      banker: boolean
    }

    /** 发送的消息 */
    type Msg = {
      type: 'room:create'
      data: {
        visitable: boolean
        password?: string
        capcity: number
      }
    } | {
      type: 'game:start'
      data?: unknown
    }

    /** 接收的消息 */
    type RMsg = {
      type: 'room:create'
      data: boolean
    } | {
      type: 'room:sync'
      data: Room
    } | {
      type: 'player:create'
      data: {id: string}
    }

    type RoomPhase = 'ready' | 'deal' | 'player' | 'flop'

    interface Card {
      placeholder?: boolean
      num: number
      suit: 'heart' | 'spade' | 'diamond' | 'club'
    }

    interface Room {
      cards: Card[]
      /** 庄家id */
      banker: string
      bankerIndex: number
      /** 默认最小盲注 */
      DSBA: number
      capcity: number
      id: string
      ownerId: string
      password: string
      phase: RoomPhase
      phaseIndex: number
      players: Record<string, {
        id: string
        chip: number
        index: number
        name: string
        avatar?: string
      }>
      playersCount: number
      turns: []
      visitable: boolean
      joinable: boolean
    }
  }
}



export { }
