const CACHE_NAME = "reward-app-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json"
];


/* 安裝時先快取基本檔案 */
self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(APP_FILES);
            })

    );

    self.skipWaiting();

});


/* 啟用新版 Service Worker 時，
   刪掉舊版本快取 */
self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames.map(name => {

                        if (name !== CACHE_NAME) {
                            return caches.delete(name);
                        }

                    })

                );

            })

    );

    self.clients.claim();

});


/* 讀取檔案時：
   先找快取，
   找不到再抓網路 */
self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        caches.match(event.request)
            .then(cachedResponse => {

                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request);

            })

    );

});