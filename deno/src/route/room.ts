import {Hono} from 'hono'
import {httpErr, players, rooms, Room} from '~/core/mod.ts'
import {cors} from 'hono/cors'

const router = new Hono()

router.use(cors({credentials: true, origin: o => o}))
router.post('/create', async c => {
  const data = await c.req.json<yew.CreateRoomData>()

  if (!players.has(data.pid)) throw httpErr.Bad

  const owner = players.get(data.pid)!

  const room = new Room({
    owner,
    capcity: data.capcity,
    visitable: data.visitable,
    password: data.password
  })

  rooms.set(room.id, room)
  return c.json(true)
})


export default router
