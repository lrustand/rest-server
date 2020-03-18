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
	'/diktsamling/dikt/',
	'/diktsamling/bruker',
	'/diktsamling/sesjon'
]

self.addEventListener('install', function(event) {
	console.log('Service Worker: Install')
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


function doFetch(e) {
	return fetch(e.request)
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
		.catch(err => null)
}


// Genererer respons basert på cachet diktdatabase
function doDynamic(e) {
	const url = e.request.url
	return caches.match('/diktsamling/dikt/')
		.then(res =>  res.json())
		.then(alle_dikt => {
			// Forespørsler til rest api genereres fra cachet diktdatabase
			if (url.startsWith('http://127.0.0.1:3000/diktsamling/dikt/')
				&& url != 'http://127.0.0.1:3000/diktsamling/dikt/') {
				const diktid = url.split("/")[5]
				for (a in alle_dikt) {
					const dikt = alle_dikt[a]
					if (dikt.diktid == diktid) {
						return new Response(JSON.stringify([dikt]))
					}
				}
			}

			// Selve html-filene er like uavhengig av query string
			if (url.startsWith('http://127.0.0.1:3000/ajax/vis_dikt.html?')) {
				return caches.match('/ajax/vis_dikt.html')
			}
			if (url.startsWith('http://127.0.0.1:3000/ajax/endre_dikt.html?')) {
				return caches.match('/ajax/endre_dikt.html')
			}

			return null
		})
}

// Call Fetch Event
self.addEventListener('fetch', (e) => {
	console.log(`Service Worker: Client requested ${e.request.url}`)
	e.respondWith(async function(){
		const fetched = await doFetch(e)
		if (fetched) {
			console.log("Responding with fetched content")
			return fetched
		}

		const dynamic = await doDynamic(e)
		if (dynamic) {
			console.log("Responding with dynamic content")
			return dynamic
		}

		const cached = caches.match(e.request).then(res => res)
		if (cached) {
			console.log("Responding with cached content")
			return cached
		}

	}())
})
