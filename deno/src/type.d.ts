declare namespace yew {
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
    data: any
  }
}
