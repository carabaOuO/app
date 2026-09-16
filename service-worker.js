const CACHE_NAME = "reward-app-v2";

const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json"
];


/* =========================
   安裝
========================= */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(cache => {
                    return cache.addAll(APP_FILES);
                })

        );

        self.skipWaiting();

    }
);


/* =========================
   啟用
   刪除所有舊版快取
========================= */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()
                .then(cacheNames => {

                    return Promise.all(

                        cacheNames.map(
                            cacheName => {

                                if (
                                    cacheName !== CACHE_NAME
                                ) {

                                    return caches.delete(
                                        cacheName
                                    );

                                }

                            }
                        )

                    );

                })

        );

        self.clients.claim();

    }
);


/* =========================
   讀取檔案

   優先抓最新版網路檔案
   網路失敗才使用快取
========================= */

self.addEventListener(
    "fetch",
    event => {

        if (
            event.request.method !== "GET"
        ) {

            return;

        }


        event.respondWith(

            fetch(event.request)

                .then(response => {

                    const responseClone =
                        response.clone();


                    caches
                        .open(CACHE_NAME)
                        .then(cache => {

                            cache.put(
                                event.request,
                                responseClone
                            );

                        });


                    return response;

                })

                .catch(() => {

                    return caches.match(
                        event.request
                    );

                })

        );

    }
);