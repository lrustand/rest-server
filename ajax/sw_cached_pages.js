const cacheName = 'v4'

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

self.addEventListener('install', function(event) {
    event.waitUntil(
		caches.open(cacheName).then( function (cache) {
			cacheAssets.forEach(url => cache.add(url))

			// Henter liste over alle dikt og cacher diktsider
			fetch("/diktsamling/dikt")
			.then(res => res.json())
			.then(data => alle_dikt = data)
			.then(() => {
				alle_dikt.forEach(dikt => {
					// Cacher alle sider relatert til denne diktid
					cache.add(`/diktsamling/dikt/${dikt.diktid}`)
					cache.add(`/ajax/vis_dikt.html?diktid=${dikt.diktid}`)
					cache.add(`/ajax/endre_dikt.html?diktid=${dikt.diktid}`)
				})
			})
		})
	)
});

// Call Activate Event
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
	e.respondWith(
		fetch(e.request)
			.then(res => {
				// Make clone of response
				const resClone = res.clone()
				// Open cache
				caches.open(cacheName).then(cache => {
					// Add response to cache
					cache.put(e.request, resClone)
				})
				return res
			})
			.catch(err => caches.match(e.request).then(res => res))
	)
})
