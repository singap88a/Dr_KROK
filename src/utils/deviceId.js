// src/utils/deviceId.js
const KEY = 'drkrok_device_id';
const DB_NAME = 'drkrok_device_db';
const STORE = 'kv';

// ---------- localStorage ----------
const lsGet = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

const lsSet = (v) => {
  try {
    localStorage.setItem(KEY, v);
  } catch {}
};

// ---------- cookie (2 years) ----------
const cookieGet = () => {
  try {
    const m = document.cookie.match(new RegExp('(?:^|; )' + KEY + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
};

const cookieSet = (v) => {
  try {
    const maxAge = 60 * 60 * 24 * 365 * 2; // 2 years
    document.cookie = `${KEY}=${encodeURIComponent(v)}; max-age=${maxAge}; path=/; SameSite=Lax; Secure`;
  } catch {}
};

// ---------- IndexedDB ----------
const openDb = () =>
  new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });

const idbGet = async () => {
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readonly');
      const r = tx.objectStore(STORE).get(KEY);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

const idbSet = async (v) => {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(v, KEY);
  } catch {}
};

// ---------- Generate new ID ----------
const generate = () => {
  const id =
    (typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID()) ||
    Math.random().toString(36).slice(2) + Date.now().toString(36);
  return 'device_' + id.replace(/-/g, '');
};

// ---------- Main Function ----------
let cached = null;

export async function getDeviceId() {
  if (cached) return cached;

  const [ls, ck, idb] = [lsGet(), cookieGet(), await idbGet()];

  // Check also legacy key so existing registered users retain their exact device_id without disruption
  let legacyId = null;
  try {
    legacyId = localStorage.getItem('DR_KROK_device_id');
  } catch {}

  // Use any existing source, then restore all others
  let id = ls || ck || idb || legacyId;

  if (!id) {
    id = generate();
  }

  // Restore/Sync all storage locations
  if (ls !== id) lsSet(id);
  if (ck !== id) cookieSet(id);
  if (idb !== id) await idbSet(id);

  // Sync legacy key as well
  try {
    localStorage.setItem('DR_KROK_device_id', id);
  } catch {}

  // Request browser storage persistence so it doesn't get evicted under storage pressure
  try {
    if (navigator.storage && navigator.storage.persist) {
      await navigator.storage.persist();
    }
  } catch {}

  cached = id;
  return id;
}
