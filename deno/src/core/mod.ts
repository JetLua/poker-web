import {HTTPException} from 'hono/http-exception'
import {decodeBase64, encodeBase64} from 'encoding/base64'
import {encodeHex} from 'encoding/hex'
import * as env from './env.ts'

export const kv = await Deno.openKv()

export * as env from './env.ts'

export * as db from './db.ts'

export const enc = new TextEncoder()
export const dec = new TextDecoder()

export const httpErr = {
  Bad: new HTTPException(400, {message: 'Bad Request'}),
  Failed: new HTTPException(500, {message: 'Unknown Error'}),
  NotFound: new HTTPException(404, {message: 'Not Found'})
}

export const aes = {
  key: await crypto.subtle.importKey(
    'raw',
    decodeBase64(env.AES_KEY),
    'AES-GCM',
    false,
    ['encrypt', 'decrypt']
  ),

  iv: decodeBase64(env.AES_IV),

  async encode(data: string) {
    const cipher = await crypto.subtle.encrypt({
      name: 'AES-GCM',
      iv: this.iv,
    }, this.key, enc.encode(data))

    return encodeHex(cipher)
  },

  async decode(data: ArrayBuffer | string) {
    const cipher = await crypto.subtle.decrypt({
      name: 'AES-GCM',
      iv: this.iv,
    }, this.key, typeof data === 'string' ? enc.encode(data) : data)

    return dec.decode(cipher)
  }
}
