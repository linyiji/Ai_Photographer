# Privacy Boundary

Camera frames and optional transient keyframes remain in browser memory. No fetch, WebSocket, provider SDK, upload endpoint, service worker, or backend per-frame call exists in this package. Downloaded evidence is scalar JSON metadata only.

Hard counters: raw video upload 0; raw frame stream upload 0; third-party image upload 0; provider/Luna/backend per-frame calls 0; committed user media 0. Production retention and Main AssetRef mapping require separate consent and integration authority.
