import {Hono} from 'hono'
import {cors} from 'hono/cors'
import {HTTPException} from 'hono/http-exception'
import {upgradeWebSocket} from 'hono/deno'
import {Room, Player} from '~/core/mod.ts'

const app = new Hono()

app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json(err.message, err.status)
  return c.json(err.message, 500)
})

app.use(cors({credentials: true, origin: o => o}))


const rooms = new Map<string, Room>()

app.get('/ws', upgradeWebSocket(c => {
  const {rid, pid} = c.req.query()

  return {
    onOpen(_, ws) {
      if (rid) {

      } else {
        const room = new Room()
        const player = new Player({ws})
        room.add(player)
      }
    },

    onMessage(_, ws) {

    }
  }
}))

Deno.serve(app.fetch)
