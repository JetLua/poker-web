import {Hono} from 'hono'
import {ObjectId} from 'mongo'
import {getCookie} from 'hono/cookie'
import {type CompletedPart} from 's3'

import {aes, db, httpErr} from '~/core/mod.ts'
import * as api from '~/api/mod.ts'

// type Env = {
//   Variables: {
//     id: string
//   }
// }

const router = new Hono<{
  Variables: {
    id: string
  }
}>()

router.use(async (c, next) => {
  const token = getCookie(c, 'token')
  if (!token) throw httpErr.Bad
  let r
  r = await aes.decode(token)
  const [id] = r.split(':')
  c.set('id', id)
  await next()
})

router.get('/multipart', async c => {
  const num = c.req.query('num')
  if (!num) throw httpErr.Bad
  return c.json(await api.s3.uploader.multipart({acl: 'private', num: +num}))
})

router.post('/multipart/complete', async c => {
  const {uploadId, parts, key} = await c.req.json<{key: string, uploadId: string, parts: CompletedPart[]}>()
  if (!uploadId) throw httpErr.Bad
  return c.json(await api.s3.uploader.complete({key, uploadId, parts}))
})

router.get('/info', async c => {
  const r = await db.user.findOne(
    {_id: new ObjectId(c.var.id)},
    {projection: {name: 1, avatar: 1, _id: 0}}
  )
  return c.json(r)
})

export default router
