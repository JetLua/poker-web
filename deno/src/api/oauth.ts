import {env} from '~/core/mod.ts'

export function google(opts: {
  code: string
  client_id: string
  client_secret: string
  redirect_uri: string}) {

  const initial = env.PROD ? {} : {
    client: Deno.createHttpClient({
      proxy: {
        url: 'http://127.1:1080'
      }
    })
  }

  return fetch('https://oauth2.googleapis.com/token', {
    ...initial,
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({
      ...opts,
      grant_type: 'authorization_code'
    })
  }).then<{
    access_token: string
    expires_in: number
    scope: string
    token_type: string
    id_token: string
    error?: string
  }>(r => r.json())
}
