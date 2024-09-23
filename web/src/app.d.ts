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
    }
  }
}



export { }
