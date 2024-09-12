import {HTTPException} from 'hono/http-exception'
import {decodeBase64} from 'encoding/base64'
import {decodeHex, encodeHex} from 'encoding/hex'
import * as env from './env.ts'

export const kv = await Deno.openKv()
export const laxiaKv = await Deno.openKv('https://api.deno.com/databases/3acf5501-7de1-4ff5-b936-cf17db8b5c36/connect')

export * as env from './env.ts'

export * as db from './db.ts'

export const enc = new TextEncoder()
export const dec = new TextDecoder()

export const httpErr = {
  Bad: new HTTPException(400, {message: 'Bad Request'}),
  Failed: new HTTPException(500, {message: 'Unknown Error'}),
  NotFound: new HTTPException(404, {message: 'Not Found'}),
  new: (s: string) => new HTTPException(500, {message: s})
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
    }, this.key, typeof data === 'string' ? decodeHex(data) : data)

    return dec.decode(cipher)
  }
}
