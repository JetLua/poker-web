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

    type Msg = {
      type: 'room:create'
      data: {
        visitable: boolean
        password?: string
        capcity: number
      }
    } | {
      type: 'common'
      data: unknown
    }

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

    type RoomPhase = 'ready' | 'blind' | 'deal' | 'player' | 'flop'

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
      password: string
      phase: RoomPhase
      phaseIndex: number
      players: Record<string, {
        id: string
        chip: number
      }>
      turns: []
      visitable: boolean
      joinable: boolean
    }
  }
}



export { }
