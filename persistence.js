/* ══════════════════════════════════════════════════════════════════════════
   PERSISTENCE LAYER
   ══════════════════════════════════════════════════════════════════════════
   This file is the ONLY thing that talks to storage. The rest of the app
   (script.js) never touches localStorage/sessionStorage/fetch directly for
   state — it just calls Persistence.loadState(username) / .saveState(...).

   HOW IT WORKS RIGHT NOW (no backend required)
   ----------------------------------------------------------------------
   Every user's state is cached in the browser under localStorage key
   `appState:<username>`. This already satisfies "persists across sessions
   on this device" and is exactly what runs today with no server at all —
   good for local development and demos.

   WHAT THE BACKEND TEAM NEEDS TO DO
   ----------------------------------------------------------------------
   To make progress persist for a user across *devices/browsers* (the real
   requirement), implement two JSON endpoints and the app will start using
   them automatically — no other change to this file or to script.js is
   required:

     GET  {API_BASE_URL}/state/:username
        → 200 { "state": { ...the user's saved state object... } }
        → 404 (or any non-2xx) if the user has no saved state yet

     PUT  {API_BASE_URL}/state/:username
        Body: { "state": { ...current state object... } }
        → 200/204 on success

   The `state` object is an opaque blob (plain JSON) — the frontend owns its
   shape (see defaultState() in script.js) and it may gain new fields over
   time. The backend does not need to understand its contents, just store
   and return it per username (e.g. one row per user in a `user_state`
   table with a `username` primary/unique key and a JSON/TEXT column).

   If you'd rather not add a generic key/value endpoint and instead already
   have a users table + auth session, the only thing you need to change is
   the two request URLs below (and, if useful, swap the username path param
   for "current logged-in user" resolved from your session/cookie instead).

   CONFIGURATION
   ----------------------------------------------------------------------
   Set API_BASE_URL below once the backend is deployed (e.g. "/api" or
   "https://your-api.example.com/api"). Leaving it as null makes the app
   run purely on localStorage, which is exactly today's local-only
   behavior — handy for running the frontend without any server.

   Even with API_BASE_URL set, if the request fails (server down, route
   not implemented yet, offline, etc.) the app automatically falls back to
   the local cache, so local development/testing keeps working even after
   this is pointed at a real backend.
   ══════════════════════════════════════════════════════════════════════ */

const PERSISTENCE_CONFIG = {
  // Example once deployed: '/api'  or  'https://myapp.example.com/api'
  API_BASE_URL: null,
  // Abort a network call after this long and fall back to the local cache.
  REQUEST_TIMEOUT_MS: 4000,
};

const Persistence = (function () {
  const LOCAL_PREFIX = 'appState:';

  function localKey(username) {
    return LOCAL_PREFIX + username;
  }

  function readLocal(username) {
    try {
      const raw = localStorage.getItem(localKey(username));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Persistence: failed to read local cache', e);
      return null;
    }
  }

  function writeLocal(username, state) {
    try {
      localStorage.setItem(localKey(username), JSON.stringify(state));
    } catch (e) {
      console.warn('Persistence: failed to write local cache', e);
    }
  }

  function apiUrl(username) {
    return `${PERSISTENCE_CONFIG.API_BASE_URL}/state/${encodeURIComponent(username)}`;
  }

  async function fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PERSISTENCE_CONFIG.REQUEST_TIMEOUT_MS);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  // Load a user's state. Tries the server first (if configured), and falls
  // back to the local cache if that's unavailable or the server has
  // nothing saved yet. Returns null if there is no saved state anywhere
  // (i.e. this is a brand new user).
  async function loadState(username) {
    if (PERSISTENCE_CONFIG.API_BASE_URL) {
      try {
        const res = await fetchWithTimeout(apiUrl(username), { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.state) {
            writeLocal(username, data.state); // keep local cache warm/offline-ready
            return data.state;
          }
        }
        // Non-2xx (e.g. 404 = no saved state yet server-side): fall through
        // to the local cache below rather than treating it as "new user"
        // outright, in case there's an un-synced local copy.
      } catch (e) {
        console.warn('Persistence: server load failed, using local cache', e);
      }
    }
    return readLocal(username);
  }

  // Save a user's state. Always writes to the local cache immediately
  // (synchronous-feeling, never fails silently in a way that loses data on
  // this device), then best-effort syncs to the server in the background.
  function saveState(username, state) {
    writeLocal(username, state);
    if (PERSISTENCE_CONFIG.API_BASE_URL) {
      fetchWithTimeout(apiUrl(username), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
      }).catch((e) => {
        console.warn('Persistence: background sync to server failed (local cache still saved)', e);
      });
    }
  }

  // Best-effort flush used on page unload so the last update isn't lost in
  // transit. Uses sendBeacon when available since it survives page close.
  // Note: sendBeacon always sends a POST, so if you implement the save
  // endpoint, accepting POST as an alias for PUT on that same route covers
  // this case too (or it's fine to skip — writeLocal() below already keeps
  // the local cache current, so the previous PUT is at worst a few
  // interactions behind).
  function flushOnUnload(username, state) {
    writeLocal(username, state);
    if (!PERSISTENCE_CONFIG.API_BASE_URL) return;
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify({ state })], { type: 'application/json' });
        navigator.sendBeacon(apiUrl(username), blob);
      }
    } catch (e) {
      // best-effort only
    }
  }

  return { loadState, saveState, flushOnUnload };
})();
