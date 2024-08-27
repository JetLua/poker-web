/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />


import {build, files, version} from '$service-worker'

declare const self: ServiceWorkerGlobalScope

const CACHE = `cache-${version}`

const ASSETS = [
  ...build, // the app itself
  ...files  // everything in `static`
]

self.addEventListener('install', e => {
  async function addFilesToCache() {
    const cache = await caches.open(CACHE)
    await cache.addAll(ASSETS)
  }

  e.waitUntil(addFilesToCache())
})

self.addEventListener('activate', e => {
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key)
    }
  }

  e.waitUntil(deleteOldCaches())
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  if (!e.request.url.startsWith('http')) return

  async function respond() {
    const url = new URL(e.request.url)
    const cache = await caches.open(CACHE)

    if (ASSETS.includes(url.pathname)) {
      const res = await cache.match(e.request)
      if (res) return res
    }

    try {
      const response = await fetch(e.request)
      if (response.status === 200) cache.put(e.request, response.clone())
      return response
    } catch {
      const res = await cache.match(e.request)
      if (res) return res
      return new Response('404', {status: 404})
    }
  }

  e.respondWith(respond())
})
