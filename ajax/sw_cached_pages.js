const cacheName = 'v3'

const cacheAssets = [
	'/ajax/endre_dikt.html',
	'/ajax/endre_dikt.js',
	'/ajax/index.html',
	'/ajax/login.html',
	'/ajax/login.js',
	'/ajax/main.js',
	'/ajax/mine_dikt.html',
	'/ajax/mine_dikt.js',
	'/ajax/opprett_dikt.html',
	'/ajax/opprett_dikt.js',
	'/ajax/style.css',
	'/ajax/vis_dikt.html',
	'/ajax/vis_dikt.js',
	'/diktsamling/sesjon',
	'/diktsamling/dikt/',
	'/diktsamling/bruker'
]

function install_cache(caches)
{
	caches
		.open(cacheName)
		.then(cache => {
			console.log('Service Worker: Caching Files')
			cache.addAll(cacheAssets)

			// Leg til alle vis dikt responser
			// cache.match('/diktsamling/dikt/').then(function(dikt) {
			//	console.log(dikt.body)
			// })
		})
		.then(() => self.skipWaiting())
}

// Call Install Event
self.addEventListener('install', (e) => {
	console.log('Service Worker: Installed')

	e.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(
				cacheNames.map(cache => {
					console.log(cache)
					if(cache !== cacheName) {
						install_cache(caches)
					}
				})
			).catch(install_cache(caches))
		})
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
self.addEventListener('fetch', (e) => {
	console.log('Service Worker: Fetching')
	e.respondWith(fetch(e.request).catch(() => caches.match(e.request)))
})

