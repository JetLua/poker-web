import {Hono} from 'hono'
import {cors} from 'hono/cors'
import {setCookie, getCookie} from 'hono/cookie'
import {HTTPException} from 'hono/http-exception'
import {upgradeWebSocket} from 'hono/deno'

import {players, Player, aes, sync} from '~/core/mod.ts'

const app = new Hono<{
  Variables: {
    id: string
  }
}>()

app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json(err.message, err.status)
  return c.json(err.message, 500)
})

app.use(async (c, next) => {
  const token = getCookie(c, 'token')
  if (token) {
    const r = await sync(aes.decode(token))
    if (r[0]) c.set('id', r[0])
  }
  return await next()
})

app.get('/ws', upgradeWebSocket(c => {
  const id = c.var.id

  return {
    onOpen(_, ws) {
      const p = players.get(id)
      if (!p) return ws.close()
      p.ws = ws
      p.online = true
    },

    onMessage(e) {
      const p = players.get(id)
      if (!p) return
      const r = p.decode<yew.Msg>(e.data as string)
      switch (r.type) {
        case 'game:start': {
          p.room?.start()
          break
        }

        case 'game:bet': {

          break
        }
      }
    },

    onClose() {
      const p = players.get(id)
      if (!p) return
      p.online = false
      // 如果观战则移除
      if (p.vRoom) p.vRoom.removeVisitor(p)
    }
  }
}))

app.use(cors({credentials: true, origin: o => o}))

app.get('/login', async c => {
  const id = c.var.id
  if (id && players.has(id)) return c.json({id})
  // 否则预创建player
  const p = new Player()
  players.set(p.id, p)

  setCookie(c, 'token', await aes.encode(p.id), {
    secure: false,
    sameSite: 'lax',
    domain: 'jarvis.local',
    path: '/',
    httpOnly: true,
    maxAge: 2592000
  })
  return c.json({id: p.id})
})

app.route('/room', (await import('~/route/room.ts')).default)

Deno.serve(app.fetch)
