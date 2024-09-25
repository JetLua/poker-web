import {Hono} from 'hono'
import {HTTPException} from 'hono/http-exception'
import {upgradeWebSocket} from 'hono/deno'

import {players, Player} from '~/core/mod.ts'

const app = new Hono()

app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json(err.message, err.status)
  return c.json(err.message, 500)
})

app.get('/ws', upgradeWebSocket(c => {
  let {pid, rid} = c.req.query()

  return {
    onOpen(_, ws) {
      if (pid && players.has(pid)) {
        // 已存在
        const player = players.get(pid)!
        player.ws = ws
        console.log(player.room)
        if (player.room) {
          player.room.broadcast(player.room.state)
        }
      } else {
        const player = new Player({ws})
        players.set(player.id, player)
        player.send({type: 'player:create', data: {id: player.id}})
      }
    },

    onMessage(e) {

    }
  }
}))

app.route('/room', (await import('~/route/room.ts')).default)

Deno.serve(app.fetch)
