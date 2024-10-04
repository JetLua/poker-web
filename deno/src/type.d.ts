declare namespace yew {
  // 收到的消息
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
  } | {
    type: 'game:start'
  } | {
    type: 'game:bet'
    data: {
      pid: string
      num: number

    }
  }

  // reponse msg
  type RMsg = {
    type: 'room:create'
    data: boolean
  } | {
    type: 'room:sync'
    data: any
  } | {
    type: 'player:create'
    data: {id: string}
  }

  interface CreateRoomData {
    pid: string
    visitable: boolean
    password?: string
    capcity: number
  }

  // type IPlayer = {

  // }

  // type IRoom = {
  //   type: 'holdem'
  //   status: 'idle' | 'game'
  //   id: string
  //   capcity: number
  //   password: string
  //   visitable: boolean
  //   DSBA: number
  //   phase: 'blind' | 'deal' | 'player' | 'flop'
  //   phaseIndex: number
  //   turns: Array<{id: string, amount: number, allIn: boolean}>
  //   players: Record<string, IPlayer>

  //   remove(id: string): void
  //   broadcast(data: object): void
  // }
}
