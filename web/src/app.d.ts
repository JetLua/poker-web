/// <reference types="vite/client" />

declare global {
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
      num: number
      suit: 'heart' | 'spade' | 'diamond' | 'club'
    }

    interface Room {
      cards: Card[]
      /** 庄家id */
      banker: string
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
