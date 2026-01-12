self.addEventListener("install", () => {
  console.log("Service Worker installed");
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open("renime-cache").then((cache) =>
      cache.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).then((res) => {
            cache.put(event.request, res.clone());
            return res;
          })
        );
      })
    )
  );
});
