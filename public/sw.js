const cacheVersion = 'v.2.7'
const cacheableHosts = ['i.ytimg.com']
const cacheableDynamicAssets = ['__DYNAMIC_ASSETS__']
const cacheableResources = [
  '/index.html',
  '/images/icons/icon-16.png',
  '/images/icons/icon-32.png',
  '/images/icons/icon-64.png',
  '/images/icons/icon-128.png',
  '/images/icons/icon-256.png',
  '/images/icons/icon-512.png',
]

const addResourcesToCache = async (resources) => {
  const cache = await caches.open(cacheVersion)
  await cache.addAll(resources)
}

const putInCache = async (request, response) => {
  const cache = await caches.open(cacheVersion)
  await cache.put(request, response)
}

const cacheFirst = async (request) => {
  const responseFromCache = await caches.match(request)
  if (responseFromCache) {
    return responseFromCache
  }

  const { hostname } = new URL(request.url)
  if (cacheableHosts.includes(hostname)) {
    const responseFromNetwork = await fetch(request.clone())

    putInCache(request, responseFromNetwork.clone())
    return responseFromNetwork
  }

  return await fetch(request)
}

self.addEventListener('install', (event) => {
  self.skipWaiting()

  event.waitUntil(
    addResourcesToCache(cacheableResources.concat(cacheableDynamicAssets))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())

  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      return keys.map(async (cache) => {
        if (cache !== cacheVersion) {
          return await caches.delete(cache)
        }
      })
    })()
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(cacheFirst(event.request))
})
