/*! coi-serviceworker v0.1.7 - Guido Zuidhof, licensed under MIT */
let coepCredentialless = false;
if (typeof window === 'undefined') {
    self.addEventListener('install', () => self.skipWaiting());
    self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

    self.addEventListener('fetch', (event) => {
        if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') return;

        event.respondWith(
            fetch(event.request).then((response) => {
                if (response.status === 0) return response;

                const newHeaders = new Headers(response.headers);
                newHeaders.set('Cross-Origin-Embedder-Policy', coepCredentialless ? 'credentialless' : 'require-corp');
                newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: newHeaders,
                });
            }).catch((e) => console.error(e))
        );
    });
} else {
    (() => {
        const script = document.currentScript;
        const reloadedByCOI = window.sessionStorage.getItem('coiReloadedBySW');
        if (reloadedByCOI) {
            window.sessionStorage.removeItem('coiReloadedBySW');
        }
        if (window.crossOriginIsolated) return;

        const registration = navigator.serviceWorker.register(script.src);
        registration.then((reg) => {
            reg.addEventListener('updatefound', () => {
                const installingWorker = reg.installing;
                installingWorker.addEventListener('statechange', () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            window.sessionStorage.setItem('coiReloadedBySW', 'true');
                            window.location.reload();
                        }
                    }
                });
            });
        });
    })();
}