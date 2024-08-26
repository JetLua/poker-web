import {HTTPException} from 'hono/http-exception'

export * as env from './env.ts'

export const httpErr = {
  Bad: new HTTPException(400),
  Failed: new HTTPException(500),
  NotFound: new HTTPException(404)
}
