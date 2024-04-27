const cacheVersion = 1
const cacheName = `cache-v${cacheVersion}`
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
  const cache = await caches.open(cacheName)
  await cache.addAll(resources)
}

const putInCache = async (request, response) => {
  const cache = await caches.open(cacheName)
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

  // if requesting /[page].html return index.html so react can handle it
  if (request.mode === 'navigate') {
    const req = new Request('/index.html')
    const responseFromCache = await caches.match(req)

    if (responseFromCache) return responseFromCache
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
        if (cache !== cacheName) {
          return await caches.delete(cache)
        }
      })
    })()
  )
})

self.addEventListener('fetch', (event) => {
  const { pathname, hostname } = new URL(event.request.url)
  const isSameOrigin = location.hostname === hostname

  // skip service worker for api calls
  if (pathname.startsWith('/api') && isSameOrigin) {
    return
  }

  // skip sentry error reporting
  if (hostname.endsWith('sentry.io')) {
    return
  }

  event.respondWith(cacheFirst(event.request))
})
