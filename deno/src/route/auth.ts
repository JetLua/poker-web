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
    /** user object id */
    id: string
  }
}>()

router.use(async (c, next) => {
  const token = getCookie(c, 'token')
  if (!token) throw httpErr.Bad
  const r = await aes.decode(token)
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

router.post('/folder', async c => {
  const {name, id, parent} = await c.req.json<{name: string, id?: string, parent?: string}>()
  if (!name) throw httpErr.Bad

  let r
  let _id!: ObjectId

  if (id) {
    _id = new ObjectId(id)
    r = await db.file.findOne({_id})
    if (!r) throw httpErr.NotFound
  }

  r = await db.file.findOne({owner: c.var.id, name, type: db.FileType.Folder, parent})
  if (r) throw httpErr.new('The folder already exists.')

  r = await db.file.findOneAndUpdate({_id: _id ?? new ObjectId()}, [{$set: {
    name,
    parent,
    type: db.FileType.Folder,
    owner: {$ifNull: ['$owner', c.var.id]},
    createdAt: {$ifNull: ['$createdAt', Date.now()]},
    updatedAt: Date.now(),
  }}], {upsert: true, returnDocument: 'after'})

  return c.json(true)
})

router.get('/files', async c => {
  let {parent, cursor = 0, size = 20} = c.req.query()
  size = +size
  cursor = +cursor

  return c.json(await db.file
    .find({parent, owner: c.var.id})
    .sort({type: -1, updatedAt: -1})
    .skip(cursor * size)
    .limit(size)
    .toArray())
})

export default router
