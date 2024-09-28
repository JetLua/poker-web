import {Hono} from 'hono'
import {httpErr, players, rooms, Room} from '~/core/mod.ts'

const router = new Hono<{
  Variables: {
    id: string
  }
}>()

router.post('/create', async c => {
  const id = c.var.id
  const p = players.get(id)

  if (!p) throw httpErr.Bad
  if (p.room) throw httpErr.new('You are already in the room')

  const data = await c.req.json<yew.CreateRoomData>()

  const room = new Room({
    owner: p,
    capcity: data.capcity,
    visitable: data.visitable,
    password: data.password
  })

  rooms.set(room.id, room)
  return c.json(true)
})

router.post('/join', async c => {
  const data = await c.req.json<{id: string}>()
  const room = rooms.get(data.id)
  if (!room) throw httpErr.Bad
  room.add(players.get(c.var.id)!)
  return c.json(true)
})

router.get('/', c => {
  return c.json(rooms.values().toArray())
})


export default router
