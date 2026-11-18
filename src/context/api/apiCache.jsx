/**
 * Tiered API cache
 * ----------------
 * - In-memory Map for every cached entry (fast path).
 * - Optional persistent layer (localStorage) for long-lived public/static data so a
 *   browser refresh does not re-trigger heavy static queries.
 * - Policies (CACHE_POLICIES) + endpoint rules (resolveCachePolicy) decide TTL,
 *   persistence and stale-while-revalidate per endpoint.
 */

// Bump this whenever the shape of cached responses changes to drop old persisted entries.
export const CACHE_VERSION = 1;
const PERSIST_PREFIX = "DR_KROK_cache:";

const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;

export const CACHE_POLICIES = {
  // Tier 1 — platform settings & static pages (settings, contact, about, policies)
  STATIC_LONG: { name: "STATIC_LONG", ttl: 6 * HOUR, persistent: true, swr: false },
  // Tier 1 — reference lists (universities, specializations, categories, cities…)
  STATIC_MEDIUM: { name: "STATIC_MEDIUM", ttl: 3 * HOUR, persistent: true, swr: false },
  // Tier 2 — catalog data, in-memory + stale-while-revalidate
  CATALOG: { name: "CATALOG", ttl: 20 * MINUTE, persistent: false, swr: true },
  // Tier 3 — real-time / user-specific data: never cached unless a caller opts in explicitly
  DYNAMIC: { name: "DYNAMIC", ttl: 0, persistent: false, swr: false },
  // Fallback for unclassified public GETs (legacy behaviour)
  DEFAULT: { name: "DEFAULT", ttl: 10 * MINUTE, persistent: false, swr: false },
};

/**
 * Endpoint rules, evaluated in order (first match wins). Matched against the path
 * with leading "/" and query string stripped.
 * DYNAMIC rules come first so e.g. `video_course/1/ratings` never falls into CATALOG.
 */
const CACHE_RULES = [
  // ---- Tier 3: dynamic / real-time ----
  [/(^|\/)ratings(\/|$)/, CACHE_POLICIES.DYNAMIC],
  [/(^|\/)user-review$/, CACHE_POLICIES.DYNAMIC],
  [/^(profile|auth|user|orders|favorites|cart|checkout|chat|notifications?|study-tracker|progress|student_test|checkStudentTest|add_student_test|check_coupon|flash-offers|essay-questions|job_applications|university-representative|paint_order_data|message)(\/|$)/, CACHE_POLICIES.DYNAMIC],
  [/^place_/, CACHE_POLICIES.DYNAMIC],
  [/\/lessons(\/|$)/, CACHE_POLICIES.DYNAMIC],
  [/\/interactions$/, CACHE_POLICIES.DYNAMIC],
  [/(^|\/)(progress|live|schedule)(\/|$)/, CACHE_POLICIES.DYNAMIC],

  // ---- Tier 1: static platform settings & pages (6h, persistent) ----
  [/^(setting|settings|general_settings|contact|contact_us|about|about_us|static_pages|purchase_policy|termsandcondition|terms|privacypolicy|privacy)(\/|$)/, CACHE_POLICIES.STATIC_LONG],

  // ---- Tier 1: reference lists (3h, persistent) ----
  [/^(universities|categories|specializations|college-years|cities)(\/|$)/, CACHE_POLICIES.STATIC_MEDIUM],

  // ---- Tier 2: catalog (20min, in-memory, SWR) ----
  [/^(video_course|live_course)\/[^/]+\/outline$/, CACHE_POLICIES.CATALOG],
  [/^(video_course|live_course|video_courses|live_courses|center-courses|placementCourses|courses\/filter|books|apparels|medical-tools|blog|instructor|instructors|merchants|job|banner|testimonial)(\/|$)/, CACHE_POLICIES.CATALOG],
];

export const normalizeCachePath = (path = "") =>
  String(path).replace(/^https?:\/\/[^/]+\/api\//, "").replace(/^\/+/, "").split("?")[0];

export const resolveCachePolicy = (path) => {
  const clean = normalizeCachePath(path);
  for (const [pattern, policy] of CACHE_RULES) {
    if (pattern.test(clean)) return policy;
  }
  return null;
};

// ---------------- Persistent layer (localStorage) ----------------
const persistentStore = {
  read(key) {
    try {
      const raw = localStorage.getItem(PERSIST_PREFIX + key);
      if (!raw) return null;
      const item = JSON.parse(raw);
      if (!item || item.version !== CACHE_VERSION) {
        localStorage.removeItem(PERSIST_PREFIX + key);
        return null;
      }
      return item;
    } catch {
      return null;
    }
  },

  write(key, item) {
    const payload = JSON.stringify({ ...item, version: CACHE_VERSION });
    try {
      localStorage.setItem(PERSIST_PREFIX + key, payload);
    } catch {
      // Quota exceeded or storage blocked: prune expired entries and retry once.
      this.prune();
      try {
        localStorage.setItem(PERSIST_PREFIX + key, payload);
      } catch {
        // Give up silently — memory cache still works.
      }
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(PERSIST_PREFIX + key);
    } catch {
      // ignore
    }
  },

  keys() {
    const out = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PERSIST_PREFIX)) out.push(k.slice(PERSIST_PREFIX.length));
      }
    } catch {
      // ignore
    }
    return out;
  },

  /** Remove expired / outdated-version entries. */
  prune() {
    const now = Date.now();
    for (const key of this.keys()) {
      const item = this.read(key);
      if (!item || now - item.timestamp > item.ttl) this.remove(key);
    }
  },
};

// Create a simple cache system with event emitter
export const apiCache = {
  data: new Map(),
  events: new Map(), // Event system for real-time updates

  /**
   * @param {string} key
   * @param {*} value
   * @param {number|object} ttlOrOptions  ttl in ms, or { ttl, persistent, swr }
   */
  set(key, value, ttlOrOptions = CACHE_POLICIES.DEFAULT.ttl) {
    const opts = typeof ttlOrOptions === "number" ? { ttl: ttlOrOptions } : ttlOrOptions || {};
    const item = {
      value,
      timestamp: Date.now(),
      ttl: opts.ttl ?? CACHE_POLICIES.DEFAULT.ttl,
      swr: !!opts.swr,
    };
    this.data.set(key, item);
    if (opts.persistent) persistentStore.write(key, item);

    // Trigger cache update events
    this.triggerEvent("cacheUpdate", { key, value });
  },

  /**
   * Returns the raw entry with freshness info:
   *   { value, fresh: boolean, stale: boolean (usable under SWR) } or null.
   * Falls back to the persistent layer (hydrating memory) when not in memory.
   */
  getEntry(key) {
    let item = this.data.get(key);
    if (!item) {
      const persisted = persistentStore.read(key);
      if (persisted) {
        item = {
          value: persisted.value,
          timestamp: persisted.timestamp,
          ttl: persisted.ttl,
          swr: !!persisted.swr,
        };
        this.data.set(key, item);
      }
    }
    if (!item) return null;

    const age = Date.now() - item.timestamp;
    if (age <= item.ttl) return { value: item.value, fresh: true, stale: false };

    // SWR: allow serving stale data for up to one extra TTL window while revalidating.
    if (item.swr && age <= item.ttl * 2) {
      return { value: item.value, fresh: false, stale: true };
    }

    this.data.delete(key);
    persistentStore.remove(key);
    return null;
  },

  get(key) {
    const entry = this.getEntry(key);
    return entry && entry.fresh ? entry.value : null;
  },

  /** All known keys (memory + persistent). */
  keys() {
    return new Set([...this.data.keys(), ...persistentStore.keys()]);
  },

  delete(key) {
    this.data.delete(key);
    persistentStore.remove(key);
    this.triggerEvent("cacheDelete", { key });
  },

  clear() {
    this.data.clear();
    for (const key of persistentStore.keys()) persistentStore.remove(key);
    this.triggerEvent("cacheClear", {});
  },

  /**
   * Drop every entry fetched while authenticated (user-specific data).
   * Public static/catalog entries are kept. Used on login / logout / account switch.
   */
  clearUserScoped() {
    for (const key of this.keys()) {
      if (key.includes('"auth":true')) this.delete(key);
    }
    this.triggerEvent("cacheClear", { scope: "user" });
  },

  pruneExpired() {
    persistentStore.prune();
  },

  // Event system methods
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
  },

  off(event, callback) {
    if (this.events.has(event)) {
      this.events.get(event).delete(callback);
    }
  },

  triggerEvent(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in cache event handler for ${event}:`, error);
        }
      });
    }
  },
};

// Clean out expired / old-version persisted entries once at startup.
if (typeof window !== "undefined") {
  apiCache.pruneExpired();
}

// Create a global event system for cross-component communication
export const globalEvents = {
  events: new Map(),

  emit(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in global event handler for ${event}:`, error);
        }
      });
    }
  },

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
  },

  off(event, callback) {
    if (this.events.has(event)) {
      this.events.get(event).delete(callback);
    }
  },
};
