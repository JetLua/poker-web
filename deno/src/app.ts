import * as api from '~/api/mod.ts'

const r = await api.token.get()

console.log(r)
