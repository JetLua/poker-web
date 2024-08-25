// deno-lint-ignore-file no-namespace
import axios from 'axios'
import * as core from '~/core/mod.ts'

export namespace token {
  export function get() {
    return axios.get('https://api.weixin.qq.com/cgi-bin/token', {
      params: {
        grant_type: 'client_credential',
        appid: core.env.WX_ID,
        secret: core.env.WX_SECRET
      }
    })
  }
}
