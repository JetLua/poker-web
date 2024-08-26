const WX_ID = Deno.env.get('WX_ID')!
const WX_SECRET = Deno.env.get('WX_SECRET')!
const R2_ID = Deno.env.get('R2_ID')!
const R2_KEY = Deno.env.get('R2_KEY')!
const R2_BUCKET = Deno.env.get('R2_BUCKET')!
const R2_ENDPOINT = Deno.env.get('R2_ENDPOINT')!

if (!WX_ID || !WX_SECRET || !R2_ID || !R2_ENDPOINT || !R2_KEY || !R2_BUCKET) Deno.exit(-1)

export {
  WX_ID,
  WX_SECRET,
  R2_ID,
  R2_KEY,
  R2_ENDPOINT,
  R2_BUCKET
}
