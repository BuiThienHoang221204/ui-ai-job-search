// Service worker Careelot: chỉ cache tệp tĩnh, KHÔNG BAO GIỜ đụng /api (dữ liệu phải mới và đúng phiên đăng nhập).
// Đổi VERSION mỗi khi sửa file này hoặc offline.html để máy người dùng bỏ cache cũ.
const VERSION = "careelot-v4";
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/Careelot_Square.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// Chỉ font và icon: không đổi giữa các bản build. /_next/static để HTTP cache lo (đã immutable), cache ở đây chỉ phình dần qua mỗi lần deploy.
const isStaticAsset = (url) =>
  url.pathname.startsWith("/fonts/") || url.pathname.startsWith("/icons/");

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // /api đi thẳng mạng, không respondWith: 401/403 và vai trò đọc từ /auth/me phải luôn là bản thật.
  if (url.pathname.startsWith("/api/")) return;

  // Trang: luôn lấy mạng; chỉ khi mạng ném lỗi (mất kết nối) mới trả trang offline, không bao giờ trả HTML cũ.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(VERSION).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});

// Nhắc học (ADR 0018 ở backend): máy chủ gửi { title, body, url }; bấm thông báo thì mở hoặc chuyển tới đúng trang.
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Careelot", {
      body: data.body || "",
      icon: "/icons/notification-192.png",
      badge: "/icons/notification-192.png",
      tag: "study-reminder",
      data: { url: data.url || "/dashboard/upskill" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const open = windows.find((client) => client.url === target);
      if (open) return open.focus();
      return self.clients.openWindow(target);
    }),
  );
});
