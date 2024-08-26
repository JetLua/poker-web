import {Hono} from 'hono'
import {cors} from 'hono/cors'
import {HTTPException} from 'hono/http-exception'

const app = new Hono()

app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json(err.message, err.status)
  return c.json(err.message, 500)
})

app.use(cors())
app.route('/auth', (await import('./route/auth.ts')).default)

Deno.serve(app.fetch)
