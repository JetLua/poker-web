const WX_ID = Deno.env.get('WX_ID')!
const WX_SECRET = Deno.env.get('WX_SECRET')!

if (!WX_ID || !WX_SECRET) Deno.exit(-1)

export {
  WX_ID,
  WX_SECRET
}
