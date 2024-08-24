import { createWriteStream, removeVideo } from '@/lib/FileSystemManager'
import { del } from '@/lib/videoStore'

declare const self: ServiceWorkerGlobalScope

const cacheVersion = 7
const cacheNames = {
  APP_SHELL: `cache-v${cacheVersion}`,
  // used in the app for media data like images
  DYNAMIC: `dynamic-cache`,
}
const externalMediaHosts = ['i.ytimg.com', 'yt3.ggpht.com']
const appAssets = ['__DYNAMIC_ASSETS__']
const cacheableResources = [
  '/index.html',
  '/images/icons/icon-16.png',
  '/images/icons/icon-32.png',
  '/images/icons/icon-64.png',
  '/images/icons/icon-128.png',
  '/images/icons/icon-256.png',
  '/images/icons/icon-512.png',
]

const CacheAppShell = async () => {
  const cache = await caches.open(cacheNames.APP_SHELL)
  await cache.addAll(cacheableResources.concat(appAssets))
}

const putInCache = async (request: Request, response: Response) => {
  const cache = await caches.open(cacheNames.APP_SHELL)
  await cache.put(request, response)
}

const cacheFirst = async (request: Request) => {
  const responseFromCache = await caches.match(request)
  if (responseFromCache) {
    return responseFromCache
  }

  const responseFromNetwork = await fetch(request.clone())
  if (responseFromNetwork.ok) {
    putInCache(request, responseFromNetwork.clone())
    return responseFromNetwork
  }
}

const networkFirst = async (request: Request) => {
  try {
    const fetchedResponse = await fetch(request.url)

    if (fetchedResponse.ok) {
      putInCache(request, fetchedResponse.clone())

      return fetchedResponse
    }
    return caches.match(request)
  } catch (error) {
    return caches.match(request)
  }
}

self.addEventListener('install', (event) => {
  self.skipWaiting()

  event.waitUntil(CacheAppShell())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())

  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      return keys.map(async (cache) => {
        const cacheValues: string[] = Object.values(cacheNames)

        if (!cacheValues.includes(cache)) {
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

  // these are cached when the user decides to download the media
  if (externalMediaHosts.includes(hostname)) {
    return
  }

  // skip sentry error reporting
  if (hostname.endsWith('sentry.io')) {
    return
  }

  // if requesting /[page].html return index.html so react can handle it
  if (event.request.mode === 'navigate') {
    const req = new Request('/index.html')
    event.respondWith(networkFirst(req))
  } else {
    event.respondWith(cacheFirst(event.request))
  }
})

addEventListener(
  'backgroundfetchsuccess',
  async (event: BackgroundFetchUpdateUIEvent) => {
    event.waitUntil(handleBackgroundFetchSuccess(event))
  }
)

addEventListener(
  'backgroundfetchfailure',
  async (event: BackgroundFetchUpdateUIEvent) => {
    event.waitUntil(handleBackgroundFetchFailure(event))
  }
)
addEventListener(
  'backgroundfetchabort',
  async (event: BackgroundFetchUpdateUIEvent) => {
    event.waitUntil(handleBackgroundFetchFailure(event))
  }
)

async function handleBackgroundFetchSuccess(
  event: BackgroundFetchUpdateUIEvent
) {
  const bgFetch = event.registration
  const videoId = bgFetch.id
  const fileWriteStream = await createWriteStream(videoId)

  const records = await bgFetch.matchAll()
  const response = await records[0].responseReady

  if (response.body) {
    return response.body.pipeTo(fileWriteStream)
  }

  // response.body is null when the request fails midway through
  await del(videoId)
  await removeVideo(videoId)
  event.updateUI({ title: 'Download Failed' })
}

async function handleBackgroundFetchFailure(
  event: BackgroundFetchUpdateUIEvent
) {
  const { id } = event.registration

  await del(id)
  await removeVideo(id)
  let message: string = event.registration.failureReason

  switch (event.registration.failureReason) {
    case 'aborted':
      message = 'Download Canceled!'
      break

    case 'fetch-error':
      message = 'Download Error!'
      break

    case 'quota-exceeded':
      message = 'Quota Exceeded Error!'
  }

  event?.updateUI({ title: message })
}
