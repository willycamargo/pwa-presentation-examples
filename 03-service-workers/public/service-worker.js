const ASSETS = [
  '/',
  '/css/reset.css',
  '/css/style.css',
  '/js/generate-nickname.js',
  '/js/main.js',
  '/img/logo-medium.svg',
  '/img/logo-small.svg',
  '/img/logo.svg'
]

const CACHE_NAME = 'assets'
let allPostsCaching = false

// Utils
const delay = async (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Handlers
const cacheLocalAssets = async () => {
  const cache = await caches.open(CACHE_NAME)

  return Promise.all(
    ASSETS.map(async (url) => {
      try {
        const fetchOptions = {
          method: 'GET',
          cache: 'no-store'
        }
        const res = await fetch(url, fetchOptions)
        if (res.ok) {
          return cache.put(url, res)
        }
      }
      catch (err) {
        console.error(`Error trying to cache file ${url}:`, err)
      }
    })
  )
}

const cacheAllPosts = async () => {
  if (allPostsCaching) return
  allPostsCaching = true

  await delay(5000)

  const cache = await caches.open(CACHE_NAME)
  let postsIds

  try {
    const fetchOptions = {
      method: 'GET',
      cache: 'no-store'
    }
    const res = await fetch('/posts', fetchOptions)
    if (res && res.ok) {
      await cache.put('/posts', res.clone())
      const data = await res.json()
      postsIds = data.map(({ id }) => id)
    }
  } catch (error) {
    console.error(error)
  }

  const cachePost = async (postId) => {
    const postURL = `/posts/${postId}`
    let needCaching = true

    const cacheResponse = await cache.match(postURL)
    if (cacheResponse) {
      needCaching = false
    }

    if (needCaching) {
      await delay(1000)

      try {
        const fetchOptions = {
          method: "GET",
          cache: "no-store",
          credentials: "omit"
        }
        const res = await fetch(postURL, fetchOptions)
        if (res && res.ok) {
          await cache.put(postURL, res.clone())
        }
      } catch (error) {
        console.error(error)
      }
    }

    if (postsIds.length > 0) {
      return cachePost(postsIds.shift())
    }
    else {
      allPostsCaching = false
    }
  }

  if (postsIds && postsIds.length > 0) {
    cachePost(postsIds.shift(), cache)
  }
  else {
    allPostsCaching = false
  }
}

const router = async (request) => {
  const cacheResponse = await caches.match(request)

  if (cacheResponse) {
    return cacheResponse
  } else if (/fonts.(googleapis|gstatic).com/.test(request.url) || /robohash.org/.test(request.url)) {
    const cache = await caches.open(CACHE_NAME)
    const fetchOptions = {
      method: request.method,
      cache: 'no-store'
    }
    const response = await fetch(request.url, fetchOptions)

    if (response.ok) {
      await cache.put(request.url, response.clone())
    }

    return response
  } else {
    return fetch(request)
  }
}

// Setup Listeners
self.addEventListener('install', async (event) => {
  event.waitUntil(cacheLocalAssets())
})

self.addEventListener('activate', async (event) => {
  await self.clients.claim()
  cacheAllPosts()
})

self.addEventListener('fetch', async (event) => {
  event.respondWith(router(event.request))
})