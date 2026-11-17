import { globalEvents } from "../../../context/api/apiCache.jsx";

/**
 * In-memory stale-while-revalidate cache for the course outline used by the
 * Course Details pages (video + live).
 *
 * - Within FRESH_MS an entry is served as-is with no network request.
 * - Between FRESH_MS and MAX_AGE_MS it is served instantly and revalidated in
 *   the background.
 * - After MAX_AGE_MS it is dropped and the page loads normally.
 *
 * The key includes the viewer (enrollment_status differs per user) and the UI
 * language (the backend localizes by Accept-Language).
 */
export const OUTLINE_FRESH_MS = 60 * 1000;
export const OUTLINE_MAX_AGE_MS = 10 * 60 * 1000;
const MAX_ENTRIES = 50;

const store = new Map(); // key -> { data, timestamp, courseType, ids:Set<string> }
const inflight = new Map(); // key -> Promise

export const buildOutlineKey = ({ courseType, idOrSlug, viewer = "guest", lang = "en" }) =>
  `${courseType}_outline_${String(idOrSlug)}_${viewer}_${lang}`;

export function getCachedOutline(key) {
  const entry = store.get(key);
  if (!entry) return null;
  const age = Date.now() - entry.timestamp;
  if (age > OUTLINE_MAX_AGE_MS) {
    store.delete(key);
    return null;
  }
  return { data: entry.data, isStale: age > OUTLINE_FRESH_MS };
}

export function setCachedOutline(key, data, { courseType, idOrSlug } = {}) {
  if (!data) return;
  if (store.has(key)) store.delete(key); // refresh insertion order (LRU)
  store.set(key, {
    data,
    timestamp: Date.now(),
    courseType,
    ids: new Set([String(idOrSlug), String(data.id), String(data.slug)].filter(Boolean)),
  });
  while (store.size > MAX_ENTRIES) {
    store.delete(store.keys().next().value);
  }
}

/** Fetch through the cache, de-duplicating concurrent requests for the same key. */
export function fetchOutline(key, fetcher, meta) {
  if (inflight.has(key)) return inflight.get(key);
  const promise = Promise.resolve()
    .then(fetcher)
    .then((data) => {
      if (!data || (typeof data === "object" && !data.id && !data.title)) {
        throw new Error("Course not found");
      }
      setCachedOutline(key, data, meta);
      return data;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, promise);
  return promise;
}

/** Drop cached outlines for a course (by id or slug), or everything if no id is given. */
export function invalidateOutline(courseId, courseType) {
  if (courseId == null) {
    store.clear();
    return;
  }
  const id = String(courseId);
  for (const [key, entry] of store) {
    if ((!courseType || entry.courseType === courseType) && entry.ids.has(id)) {
      store.delete(key);
    }
  }
}

// A purchase changes enrollment_status, so the cached outline must not be reused.
globalEvents.on("dataUpdated", (payload) => {
  if (payload?.type === "purchaseSuccess") {
    invalidateOutline(payload.courseId, payload.courseType);
  }
});
