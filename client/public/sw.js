// Service Worker for PWA functionality
const CACHE_NAME = 'loggin-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon-192x192.svg',
  '/icon-512x512.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Background sync for offline upload queue
self.addEventListener('sync', event => {
  if (event.tag === 'upload-queue') {
    event.waitUntil(processUploadQueue());
  }
});

async function processUploadQueue() {
  // Handle offline upload processing when connection returns
  const uploads = await getStoredUploads();
  for (const upload of uploads) {
    try {
      await fetch('/api/works', {
        method: 'POST',
        body: upload.formData
      });
      await removeStoredUpload(upload.id);
    } catch (error) {
      console.log('Upload failed, will retry:', error);
    }
  }
}

async function getStoredUploads() {
  // Implementation for IndexedDB storage
  return [];
}

async function removeStoredUpload(id) {
  // Implementation for removing processed uploads
}