importScripts('https://unpkg.com/crypto-js/crypto-js.js')

onmessage = async e => {
  const {file, key, bs} = e.data
  const hash = await md5(file, bs)
  postMessage({key, hash})
}

/**
 *
 * @param {File} f
 * @param {number?} bs
 * @returns {Promise<string>}
 */
async function md5(f, bs) {
  const {MD5, lib} = CryptoJS

  if (bs) {
    const total = Math.ceil(f.size / bs)
    const parts = await Promise.all(Array.from({length: total}, async (_, i) => {
      const p = f.slice(i * bs, (i + 1) * bs)
      return MD5(lib.WordArray.create(await p.arrayBuffer()))
    }))

    const s = parts.reduce((p, n) => p.concat(n))
    return MD5(s).toString()
  } else {
    return MD5(lib.WordArray.create(await f.arrayBuffer())).toString()
  }
}
