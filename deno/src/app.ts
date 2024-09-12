import {Hono} from 'hono'
import {cors} from 'hono/cors'
import {ObjectId} from 'mongo'
import {crypto} from 'jsr:@std/crypto'
import {setCookie} from 'hono/cookie'
import {HTTPException} from 'hono/http-exception'
import {env, httpErr, kv, db, aes, laxiaKv} from '~/core/mod.ts'
import * as api from '~/api/mod.ts'

const app = new Hono()

app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json(err.message, err.status)
  return c.json(err.message, 500)
})

app.use(cors({credentials: true, origin: o => o}))
app.route('/auth', (await import('./route/auth.ts')).default)

app.get('/login', async c => {
  const state = crypto.randomUUID()

  await kv.set([state], '', {expireIn: 18e4})

  const p = new URLSearchParams({
    client_id: env.GOOGLE_ID,
    redirect_uri: env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
    access_type: 'offline',
    state
  })

  return c.json({url: `https://accounts.google.com/o/oauth2/v2/auth?${p.toString()}`, id: state})
})

app.get('/oauth', async c => {
  const code = c.req.query('code')
  const state = c.req.query('state')

  if (!code || !state) throw httpErr.Bad

  let r
  r = await kv.get([state])
  if (!r) throw httpErr.Bad

  r = await api.oauth.google({
    code,
    client_id: env.GOOGLE_ID,
    client_secret: env.GOOGLE_SECRET,
    redirect_uri: env.GOOGLE_REDIRECT_URI
  })

  if (r.error) throw new Error(r.error)

  r = JSON.parse(atob(r.id_token.split('.')[1]))

  r = await db.user.findOneAndUpdate(
    {
      'google.email': r.email
    },
    [{$set: {
      name: {$ifNull: ['$name', r.name]},
      email: {$ifNull: ['$email', r.email]},
      avatar: {$ifNull: ['$avatar', r.picture]},
      createdAt: {$ifNull: ['$createdAt', Date.now()]},
      updatedAt: Date.now(),
      google: r
    }}],
    {upsert: true, returnDocument: 'after'}
  )

  if (!r) throw httpErr.Failed

  setCookie(c, 'token', await aes.encode(`${r._id}:${Date.now()}`), {
    // 一个月
    maxAge: 2592000,
    sameSite: 'None',
    secure: true,
    path: '/',
    httpOnly: true,
  })

  await kv.delete([state])

  return c.html(`<script>location.href="${env.WEBSITE}"</script><body>Success</body>`)
})

app.post('/tg/download', async c => {
  const {uri} = await c.req.json<{uri: string}>()
  const r = await fetch(uri).then(r => r.arrayBuffer())
  return c.text(await api.s3.uploader.put(r as any))
})

app.get('/tg/q', async c => {
  const k = c.req.query('key')
  if (!k) throw httpErr.Bad
  let r
  r = await laxiaKv.get<string>([k])
  if (!r || !r.value) return c.json(false)
  r = await db.user.findOne({_id: new ObjectId(r.value)})
  if (!r) throw httpErr.NotFound
  setCookie(c, 'token', await aes.encode(`${r._id}:${Date.now()}`), {
    // 一个月
    maxAge: 2592000,
    sameSite: 'None',
    secure: true,
    path: '/',
    httpOnly: true,
  })
  await laxiaKv.delete([k])
  return c.json(true)
})

Deno.serve(app.fetch)
