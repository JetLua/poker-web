import {Hono} from 'hono'
import {cors} from 'hono/cors'
// import {getCookie, setCookie} from 'hono/cookie'
import {HTTPException} from 'hono/http-exception'
import {upgradeWebSocket} from 'hono/deno'
import {Room, Player, aes} from '~/core/mod.ts'

const app = new Hono()

app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json(err.message, err.status)
  return c.json(err.message, 500)
})

const rooms = new Map<string, Room>()
const players = new Map<string, Player>()

app.get('/ws', upgradeWebSocket(c => {
  let {rid, pid} = c.req.query()

  let p: Player | undefined

  return {
    async onOpen(_, ws) {
      if (pid && players.has(pid)) {
        // 是否游戏中
      } else {
        // 新建游客
        p = new Player({ws})
        pid = p.id
        players.set(pid, p)
      }
    },

    onMessage(e) {
      if (!p) return
      // p.onMessage(e.data)
      const data = decode(e.data as string) as yew.Msg

      switch (data.type) {
        case 'room:create': {
          const room = new Room(data.data)
          room.add(p)
          p.send({type: 'room:create', data: true})
          break
        }
      }
    }
  }
}))

app.use(cors({credentials: true, origin: o => o}))

Deno.serve(app.fetch)

function decode(data: string) {
  return JSON.parse(data)
}
