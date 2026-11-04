import axios from "axios";
import i18n from "../../i18n";
import { apiCache, globalEvents } from "./apiCache.jsx";

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

export const generateCacheKey = (path, options = {}) => {
  const authToken = getAuthToken();
  const lang = (
    i18n?.language ||
    localStorage.getItem("DR_KROK_i18nextLng") ||
    "en"
  ).split("-")[0];

  return JSON.stringify({
    path,
    auth: !!authToken,
    lang,
    method: options.method || "GET",
    body: options.body ? JSON.stringify(options.body) : null,
  });
};

export const clearCache = (pattern = null) => {
  if (pattern) {
    for (const key of apiCache.data.keys()) {
      if (key.includes(pattern)) {
        apiCache.delete(key);
      }
    }
  } else {
    apiCache.clear();
  }
};

export const invalidateCache = (patterns = []) => {
  if (patterns.length === 0) {
    apiCache.clear();
    return;
  }

  for (const key of apiCache.data.keys()) {
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

/**
 * Execute HTTP request with caching, auth, headers, CORS protection, and redirect bypass
 */
export async function executeRequest(
  path,
  {
    method = "GET",
    headers = {},
    body,
    auth = false,
    isFormData = false,
    useCache = true,
    cacheTTL = 10 * 60 * 1000,
    invalidateCacheOnSuccess = [],
    signal = null,
  } = {},
  { baseUrl, onMaintenanceTrigger }
) {
  // Don't cache non-GET requests or form data
  if (method !== "GET" || isFormData) {
    useCache = false;
  }

  const cacheKey = generateCacheKey(path, { method, body });

  // Try to get from cache first
  if (useCache) {
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log("📦 Serving from cache:", path);
      return cached;
    }
  }

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
    if (
      res.status === 503 ||
      data?.is_maintenance === true ||
      data?.data?.is_maintenance === true
    ) {
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
    throw error;
  }

  // Cache successful GET responses
  if (useCache && method === "GET" && res.ok) {
    apiCache.set(cacheKey, data, cacheTTL);
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
