// 简单的 Service Worker
const CACHE_NAME = "cathealth-v1";

self.addEventListener("install", function(event) {
    console.log("Service Worker 安装完成");
});

self.addEventListener("fetch", function(event) {
    event.respondWith(fetch(event.request));
});
