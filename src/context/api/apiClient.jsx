import axios from "axios";
import i18n from "../../i18n";
import {
  apiCache,
  globalEvents,
  CACHE_POLICIES,
  resolveCachePolicy,
} from "./apiCache.jsx";

export const DEFAULT_SESSION_DURATION_SEC = 604800; // 7 days in seconds

/**
 * Helper to clear all authentication data across localStorage and cookies
 */
export const clearAuthStorageClient = () => {
  try {
    localStorage.removeItem("DR_KROK_tokenData");
    localStorage.removeItem("DR_KROK_token");
    localStorage.removeItem("DR_KROK_userToken");
    localStorage.removeItem("DR_KROK_user");
    localStorage.removeItem("DR_KROK_userName");
    localStorage.removeItem("token");
  } catch (err) {
    console.error("Error clearing auth storage:", err);
  }

  try {
    document.cookie = "DR_KROK_token=; max-age=0; path=/; SameSite=Lax";
  } catch {
    // Ignore
  }
};

// Global axios interceptor ensuring ONLY 401 Unauthorized clears token & logs out.
// Temporary network errors, timeouts, 422, 429, 500 etc. must NEVER clear tokens or log out.
if (axios && axios.interceptors) {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response && error.response.status === 401) {
        clearAuthStorageClient();
        window.dispatchEvent(new CustomEvent("user-logout"));
      }
      return Promise.reject(error);
    }
  );
}

export const getAuthToken = () => {
  const tokenData = localStorage.getItem("DR_KROK_tokenData");
  if (tokenData) {
    try {
      const parsed = JSON.parse(tokenData);
      const now = Date.now();

      // Check expiry: prioritize expires_at, then expires_in, then expiresAt, fallback 7 days
      let tokenExpiry = parsed.expiresAt;
      if (parsed.expires_at) {
        const parsedExpiry = new Date(parsed.expires_at).getTime();
        if (!isNaN(parsedExpiry)) {
          tokenExpiry = parsedExpiry;
        }
      } else if (parsed.expires_in) {
        const base = parsed.savedAt || now;
        tokenExpiry = base + Number(parsed.expires_in) * 1000;
      }

      if (tokenExpiry && tokenExpiry > now) {
        return parsed.token;
      } else if (!parsed.expires_at && parsed.token) {
        // Migration grace period: old stored token didn't have expires_at from server.
        // Return token and let server 401 invalidate if actually expired.
        return parsed.token;
      } else {
        // Token genuinely expired, clear it
        clearAuthStorageClient();
        window.dispatchEvent(new CustomEvent("user-logout"));
        return null;
      }
    } catch (error) {
      console.error("Error parsing token data:", error);
      clearAuthStorageClient();
      return null;
    }
  }

  // Fallback to legacy token keys
  const legacyToken =
    localStorage.getItem("DR_KROK_token") || localStorage.getItem("token");
  if (legacyToken) {
    return legacyToken;
  }

  return null;
};

export const buildUrlHelper = (baseUrl, path) => {
  if (!path) return baseUrl;
  if (path.startsWith("http")) return path;
  const trimmed = path.startsWith("/") ? path.slice(1) : path;
  return `${baseUrl}/${trimmed}`;
};

/**
 * Cache key = path + language + auth scope (+ method/body).
 * `publicScope: true` drops the auth flag so public static data is shared between
 * logged-in and logged-out states (and can be persisted safely).
 */
export const generateCacheKey = (path, options = {}) => {
  const authToken = getAuthToken();
  const lang = (
    i18n?.language ||
    localStorage.getItem("DR_KROK_i18nextLng") ||
    "en"
  ).split("-")[0];

  return JSON.stringify({
    path,
    auth: options.publicScope ? false : !!authToken,
    lang,
    method: options.method || "GET",
    body: options.body ? JSON.stringify(options.body) : null,
  });
};

export const clearCache = (pattern = null) => {
  if (pattern) {
    for (const key of apiCache.keys()) {
      if (key.includes(pattern)) {
        apiCache.delete(key);
      }
    }
  } else {
    apiCache.clear();
  }
};

/** Clear user-specific cached responses, keeping public static/catalog data. */
export const clearUserCache = () => {
  apiCache.clearUserScoped();
};

export const invalidateCache = (patterns = []) => {
  if (patterns.length === 0) {
    apiCache.clear();
    return;
  }

  for (const key of apiCache.keys()) {
    for (const pattern of patterns) {
      if (key.includes(pattern)) {
        apiCache.delete(key);
        break;
      }
    }
  }

  // Emit global event
  globalEvents.emit("dataUpdated", {
    type: "cacheInvalidation",
    patterns: patterns,
  });
};

// Logout (incl. 401-triggered) must drop user-specific cached data.
if (typeof window !== "undefined") {
  window.addEventListener("user-logout", () => apiCache.clearUserScoped());
}

export const updateCache = (key, value) => {
  apiCache.set(key, value);
};

export const emitDataUpdate = (eventData) => {
  globalEvents.emit("dataUpdated", eventData);
};

export const onDataUpdate = (callback) => {
  globalEvents.on("dataUpdated", callback);
  return () => globalEvents.off("dataUpdated", callback);
};

const logCache = (...args) => {
  if (import.meta.env.DEV) console.log(...args);
};

/**
 * Decide how a request should be cached.
 * Precedence:
 *   1. Non-GET / FormData            → never cached
 *   2. useCache === false            → never cached (explicit opt-out)
 *   3. Matching endpoint policy      → policy (STATIC_LONG / STATIC_MEDIUM / CATALOG)
 *      - DYNAMIC policy is only cached when the caller explicitly opts in (useCache: true)
 *   4. useCache === true, no policy  → DEFAULT (10 min in-memory)
 *   5. useCache unset, no policy     → DEFAULT for public calls, no cache for auth calls
 * An explicit `cacheTTL` always overrides the policy TTL.
 */
export const resolveRequestCaching = (path, { method = "GET", isFormData = false, auth = false, useCache, cacheTTL } = {}) => {
  const off = { enabled: false };
  if (method !== "GET" || isFormData || useCache === false) return off;

  const policy = resolveCachePolicy(path);
  let chosen;

  if (policy === CACHE_POLICIES.DYNAMIC) {
    if (useCache !== true) return off;
    chosen = { ...CACHE_POLICIES.DEFAULT, name: "DYNAMIC(opt-in)" };
  } else if (policy) {
    chosen = { ...policy };
  } else if (useCache === true || !auth) {
    chosen = { ...CACHE_POLICIES.DEFAULT };
  } else {
    return off;
  }

  if (typeof cacheTTL === "number") chosen.ttl = cacheTTL;

  // Persist only public data: anything requested with auth may be user-specific.
  const isStatic = chosen.name === "STATIC_LONG" || chosen.name === "STATIC_MEDIUM";
  const publicScope = isStatic && !auth;
  chosen.persistent = !!chosen.persistent && publicScope;

  return { enabled: true, policy: chosen, publicScope };
};

// In-flight GET de-duplication: concurrent identical requests share one network call.
const inflightRequests = new Map();

/**
 * Execute HTTP request with tiered caching, auth, headers, CORS protection, and redirect bypass
 */
export async function executeRequest(path, options = {}, ctx) {
  const { method = "GET", body, signal = null } = options;
  const caching = resolveRequestCaching(path, options);
  const cacheKey = generateCacheKey(path, { method, body, publicScope: caching.publicScope });

  const fetchAndStore = () => {
    // Only share in-flight promises for GETs without an AbortSignal (an abort must not
    // reject other callers' requests).
    const canDedupe = method === "GET" && !signal;
    if (canDedupe && inflightRequests.has(cacheKey)) {
      return inflightRequests.get(cacheKey);
    }
    const promise = performRequest(path, options, ctx)
      .then((data) => {
        if (caching.enabled) apiCache.set(cacheKey, data, caching.policy);
        return data;
      })
      .finally(() => {
        if (canDedupe) inflightRequests.delete(cacheKey);
      });
    if (canDedupe) inflightRequests.set(cacheKey, promise);
    return promise;
  };

  if (caching.enabled) {
    const entry = apiCache.getEntry(cacheKey);
    if (entry && entry.value != null) {
      if (entry.fresh) {
        logCache(`📦 Serving from cache [${caching.policy.name}]:`, path);
        return entry.value;
      }
      if (entry.stale) {
        logCache(`📦 Serving stale from cache, revalidating [${caching.policy.name}]:`, path);
        fetchAndStore().catch(() => {
          // Background revalidation failure: keep serving the stale value.
        });
        return entry.value;
      }
    }
  }

  return fetchAndStore();
}

/**
 * Raw network request (no caching layer).
 */
async function performRequest(
  path,
  {
    method = "GET",
    headers = {},
    body,
    auth = false,
    isFormData = false,
    invalidateCacheOnSuccess = [],
    signal = null,
  } = {},
  { baseUrl, onMaintenanceTrigger }
) {
  const url = buildUrlHelper(baseUrl, path);
  const finalHeaders = { ...headers };

  // Special handling for payment endpoints to prevent 302 redirects in fetch
  const isPaymentOrder = [
    "place_order_book",
    "place_video_course",
    "place_live_course",
  ].includes(path);

  // Attach Accept-Language from current i18n language (map ua -> uk for backend)
  const currentLng = (
    i18n?.language ||
    localStorage.getItem("DR_KROK_i18nextLng") ||
    "en"
  ).split("-")[0];
  const backendLng = currentLng === "ua" ? "uk" : currentLng;
  if (!finalHeaders["Accept-Language"]) {
    finalHeaders["Accept-Language"] = backendLng;
  }
  if (!finalHeaders["Accept"]) {
    finalHeaders["Accept"] = "application/json";
  }
  if (!finalHeaders["X-Requested-With"]) {
    finalHeaders["X-Requested-With"] = "XMLHttpRequest";
  }
  if (auth) {
    const token = getAuthToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }
  if (!isFormData) {
    if (body && !finalHeaders["Content-Type"]) {
      finalHeaders["Content-Type"] = "application/json";
    }
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      redirect: isPaymentOrder ? "manual" : "follow",
      mode: "cors",
      signal: signal,
    });
  } catch (fetchError) {
    if (
      fetchError.name === "TypeError" &&
      fetchError.message.includes("Failed to fetch")
    ) {
      if (
        path === "place_video_course" ||
        path === "place_order_book" ||
        path === "place_live_course"
      ) {
        console.warn(
          `CORS issue with ${path} endpoint, but request might have succeeded on server side`
        );
        const error = new Error(`CORS issue detected with ${path} endpoint`);
        error.status = 0;
        error.data = null;
        error.isCorsIssue = true;
        throw error;
      }
      const error = new Error(
        "Network error or CORS issue. Please check your connection and try again."
      );
      error.status = 0;
      error.data = null;
      throw error;
    }
    throw fetchError;
  }

  // Handle redirects manually for payment endpoints
  if (
    isPaymentOrder &&
    (res.type === "opaqueredirect" || res.status === 302 || res.status === 301)
  ) {
    console.warn("place_order_book endpoint redirected, but continuing...");
    if (res.type === "opaqueredirect") {
      try {
        const retryRes = await fetch(url, {
          method,
          headers: finalHeaders,
          body: isFormData ? body : body ? JSON.stringify(body) : undefined,
          redirect: "follow",
          mode: "no-cors",
        });
        if (retryRes.ok) {
          res = retryRes;
        }
      } catch (retryError) {
        console.warn("Retry with no-cors also failed:", retryError);
      }
    }
  } else if (
    !isPaymentOrder &&
    (res.type === "opaqueredirect" || res.status === 302 || res.status === 301)
  ) {
    const error = new Error(
      "API endpoint redirected. This may indicate a server configuration issue."
    );
    error.status = res.status;
    error.data = null;
    throw error;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const isMaintenanceResponse =
      res.status === 503 ||
      data?.is_maintenance === true ||
      data?.data?.is_maintenance === true;

    if (isMaintenanceResponse) {
      if (onMaintenanceTrigger) {
        onMaintenanceTrigger(data?.data || data);
      }
    }

    let message = data?.message || `Request failed: ${res.status}`;

    // ONLY 401 Unauthorized clears the token and triggers logout.
    // Temporary network errors, timeouts, 422, 429, 500, etc. MUST NEVER clear session.
    if (res.status === 401) {
      clearAuthStorageClient();
      window.dispatchEvent(new CustomEvent("user-logout"));
      message = "Session expired. Please login again.";
    } else if (res.status === 302) {
      message = "Request was redirected. Please try again.";
    } else if (res.status === 0) {
      message = "Network error or CORS issue. Please check your connection.";
    }

    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    if (isMaintenanceResponse) {
      error.isMaintenance = true;
    }
    throw error;
  }

  // Invalidate specified cache on successful non-GET requests
  if (method !== "GET" && res.ok && invalidateCacheOnSuccess.length > 0) {
    invalidateCache(invalidateCacheOnSuccess);

    // Emit global event for real-time updates
    globalEvents.emit("dataUpdated", {
      type: "cacheInvalidation",
      patterns: invalidateCacheOnSuccess,
      source: path,
    });
  }

  return data;
}
