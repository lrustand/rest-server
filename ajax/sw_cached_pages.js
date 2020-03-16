const cacheName = 'v1'

const cacheAssets = [
	'/ajax/index.html',
	'/ajax/style.css',
	'/diktsamling/sesjon',
	'/ajax/vis_dikt.html',
	'/ajax/login.html',
	'/diktsamling/dikt/',
	'/ajax/main.js',
	'/ajax/vis_dikt.js'
]

// Call Install Event
self.addEventListener('install', (e) => {
	console.log('Service Worker: Installed')

	e.waitUntil(
		caches
			.open(cacheName)
			.then(cache => {
				console.log('Service Worker: Caching Files')
				cache.addAll(cacheAssets)
			})
			.then(() => self.skipWaiting())
	)
})

// Call Acitvate Event
self.addEventListener('activate', (e) => {
	console.log('Service Worker: Activated')
	// Remove unwanted caches
	e.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(
				cacheNames.map(cache => {
					if(cache !== cacheName) {
						console.log('Service Worker: Clearing Old Cache')
						return caches.delete(cache)
					}
				})
			)
		})
	)
})

// Call Fetch Event
self.addEventListener('fetch', e => {
	console.log('Service Worker: Fetching')
	e.respondWith(fetch(e.request).catch(() => caches.match(e.request)))
})

