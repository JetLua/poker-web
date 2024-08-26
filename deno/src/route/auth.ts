import {Hono} from 'hono'
import {httpErr} from '~/core/mod.ts'
import * as api from '~/api/mod.ts'
import {type CompletedPart} from 's3'

const router = new Hono()


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

export default router
