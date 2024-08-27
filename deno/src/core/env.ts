const WX_ID = Deno.env.get('WX_ID')!
const WX_SECRET = Deno.env.get('WX_SECRET')!
const R2_ID = Deno.env.get('R2_ID')!
const R2_KEY = Deno.env.get('R2_KEY')!
const R2_BUCKET = Deno.env.get('R2_BUCKET')!
const R2_ENDPOINT = Deno.env.get('R2_ENDPOINT')!
const GOOGLE_ID = Deno.env.get('GOOGLE_ID')!
const GOOGLE_SECRET = Deno.env.get('GOOGLE_SECRET')!
const GOOGLE_REDIRECT_URI = Deno.env.get('GOOGLE_REDIRECT_URI')!
const PROD = Deno.env.get('PROD') === 'true'
const MONGO_URI = Deno.env.get('MONGO_URI')!
const AES_IV = Deno.env.get('AES_IV')!
const AES_KEY = Deno.env.get('AES_KEY')!
const WEBSITE = Deno.env.get('WEBSITE')!

if (!WX_ID || !WX_SECRET || !R2_ID || !R2_ENDPOINT || !R2_KEY || !R2_BUCKET || !GOOGLE_ID || !GOOGLE_SECRET || !GOOGLE_REDIRECT_URI || !MONGO_URI || !AES_KEY || !AES_IV || !WEBSITE) Deno.exit(-1)

export {
  WX_ID,
  WX_SECRET,
  R2_ID,
  R2_KEY,
  R2_ENDPOINT,
  R2_BUCKET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_ID,
  GOOGLE_SECRET,
  PROD,
  MONGO_URI,
  AES_IV,
  AES_KEY,
  WEBSITE
}
