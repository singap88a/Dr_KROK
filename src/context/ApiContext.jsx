import React, { createContext, useContext, useMemo, useCallback } from "react";
import i18n from "../i18n";
import axios from "axios";

const ApiContext = createContext(null);

// Create a simple cache system with event emitter
const apiCache = {
  data: new Map(),
  events: new Map(), // Event system for real-time updates

  set(key, value, ttl = 10 * 60 * 1000) {
    this.data.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });

    // Trigger cache update events
    this.triggerEvent('cacheUpdate', { key, value });
  },

  get(key) {
    const item = this.data.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.data.delete(key);
      return null;
    }

    return item.value;
  },

  delete(key) {
    this.data.delete(key);
    this.triggerEvent('cacheDelete', { key });
  },

  clear() {
    this.data.clear();
    this.triggerEvent('cacheClear', {});
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
      this.events.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in cache event handler for ${event}:`, error);
        }
      });
    }
  }
};

// Create a global event system for cross-component communication
const globalEvents = {
  events: new Map(),

  emit(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(callback => {
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
  }
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApi = () => {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error("useApi must be used within an ApiProvider");
  return ctx;
};

export const ApiProvider = ({ children, baseUrl = "https://admin.dr-krok.com/api" }) => {
  const getAuthToken = useCallback(() => {
    const tokenData = localStorage.getItem("DR_KROK_tokenData");
    if (tokenData) {
      try {
        const parsed = JSON.parse(tokenData);
        const now = Date.now();
        if (parsed.expiresAt > now) {
          return parsed.token;
        } else {
          // Token expired, clear it
          localStorage.removeItem("DR_KROK_tokenData");
          localStorage.removeItem("DR_KROK_user");
          localStorage.removeItem("DR_KROK_token");
          localStorage.removeItem("DR_KROK_userToken");
          localStorage.removeItem("DR_KROK_userName");
          // Emit logout event
          window.dispatchEvent(new CustomEvent('user-logout'));
          return null;
        }
      } catch (error) {
        console.error("Error parsing token data:", error);
        localStorage.removeItem("DR_KROK_tokenData");
        return null;
      }
    }
    return null;
  }, []);

  const buildUrl = useCallback(
    (path) => {
      if (!path) return baseUrl;
      if (path.startsWith("http")) return path;
      const trimmed = path.startsWith("/") ? path.slice(1) : path;
      return `${baseUrl}/${trimmed}`;
    },
    [baseUrl]
  );

  // Generate cache key for requests
  const generateCacheKey = useCallback((path, options = {}) => {
    const authToken = getAuthToken();
    const lang = (i18n?.language || localStorage.getItem("DR_KROK_i18nextLng") || "en").split("-")[0];

    return JSON.stringify({
      path,
      auth: !!authToken,
      lang,
      method: options.method || 'GET',
      body: options.body ? JSON.stringify(options.body) : null
    });
  }, [getAuthToken]);

  const request = useCallback(
    async (path, {
      method = "GET",
      headers = {},
      body,
      auth = false,
      isFormData = false,
      useCache = true,
      cacheTTL = 10 * 60 * 1000,
      invalidateCacheOnSuccess = [], // New: specify cache patterns to invalidate on success
      signal = null // New: support request cancellation
    } = {}) => {

      // Don't cache non-GET requests or form data
      if (method !== 'GET' || isFormData) {
        useCache = false;
      }

      const cacheKey = generateCacheKey(path, { method, body });

      // Try to get from cache first
      if (useCache) {
        const cached = apiCache.get(cacheKey);
        if (cached) {
          console.log('📦 Serving from cache:', path);
          return cached;
        }
      }

      const url = buildUrl(path);
      const finalHeaders = { ...headers };

      // Special handling for payment endpoints to prevent 302 redirects in fetch
      const isPaymentOrder = ['place_order_book', 'place_video_course', 'place_live_course'].includes(path);

      // Attach Accept-Language from current i18n language (map ua -> uk for backend)
      const currentLng = (i18n?.language || localStorage.getItem("DR_KROK_i18nextLng") || "en").split("-")[0];
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
          redirect: isPaymentOrder ? 'manual' : 'follow',
          mode: 'cors',
          signal: signal,
        });
      } catch (fetchError) {
        if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
          if (path === 'place_video_course' || path === 'place_order_book' || path === 'place_live_course') {
            console.warn(`CORS issue with ${path} endpoint, but request might have succeeded on server side`);
            const error = new Error(`CORS issue detected with ${path} endpoint`);
            error.status = 0;
            error.data = null;
            error.isCorsIssue = true;
            throw error;
          }
          const error = new Error("Network error or CORS issue. Please check your connection and try again.");
          error.status = 0;
          error.data = null;
          throw error;
        }
        throw fetchError;
      }

      // Handle redirects manually for payment endpoints
      if (isPaymentOrder && (res.type === 'opaqueredirect' || res.status === 302 || res.status === 301)) {
        console.warn('place_order_book endpoint redirected, but continuing...');
        if (res.type === 'opaqueredirect') {
          try {
            const retryRes = await fetch(url, {
              method,
              headers: finalHeaders,
              body: isFormData ? body : body ? JSON.stringify(body) : undefined,
              redirect: 'follow',
              mode: 'no-cors',
            });
            if (retryRes.ok) {
              res = retryRes;
            }
          } catch (retryError) {
            console.warn('Retry with no-cors also failed:', retryError);
          }
        }
      } else if (!isPaymentOrder && (res.type === 'opaqueredirect' || res.status === 302 || res.status === 301)) {
        const error = new Error("API endpoint redirected. This may indicate a server configuration issue.");
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
        let message = data?.message || `Request failed: ${res.status}`;

        if (res.status === 401) {
          localStorage.removeItem("DR_KROK_token");
          localStorage.removeItem("DR_KROK_userToken");
          localStorage.removeItem("DR_KROK_user");
          localStorage.removeItem("DR_KROK_userName");
          window.dispatchEvent(new CustomEvent('user-logout'));
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
      if (useCache && method === 'GET' && res.ok) {
        apiCache.set(cacheKey, data, cacheTTL);
      }

      // Invalidate specified cache on successful non-GET requests
      if (method !== 'GET' && res.ok && invalidateCacheOnSuccess.length > 0) {
        invalidateCache(invalidateCacheOnSuccess);

        // Emit global event for real-time updates
        globalEvents.emit('dataUpdated', {
          type: 'cacheInvalidation',
          patterns: invalidateCacheOnSuccess,
          source: path
        });
      }

      return data;
    },
    [buildUrl, getAuthToken, generateCacheKey]
  );

  // Cache management functions
  const clearCache = useCallback((pattern = null) => {
    if (pattern) {
      for (const key of apiCache.data.keys()) {
        if (key.includes(pattern)) {
          apiCache.delete(key);
        }
      }
    } else {
      apiCache.clear();
    }
  }, []);

  const invalidateCache = useCallback((patterns = []) => {
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
    globalEvents.emit('dataUpdated', {
      type: 'cacheInvalidation',
      patterns: patterns
    });
  }, []);

  const updateCache = useCallback((key, value) => {
    apiCache.set(key, value);
  }, []);

  // Real-time update functions
  const emitDataUpdate = useCallback((eventData) => {
    globalEvents.emit('dataUpdated', eventData);
  }, []);

  const onDataUpdate = useCallback((callback) => {
    globalEvents.on('dataUpdated', callback);
    return () => globalEvents.off('dataUpdated', callback);
  }, []);

  // Existing API functions...
  const getSettings = useCallback(async () => {
    return await request("setting");
  }, [request]);

  const getMyProfile = useCallback(async () => {
    return await request("profile/get-my-profile", { auth: true });
  }, [request]);

  const login = useCallback(async (email, password, type = null) => {
    const body = type === "google" ? { type: "google" } : { email, password };
    return await request("auth/login", {
      method: "POST",
      body
    });
  }, [request]);

  const register = useCallback(async (name, email, otp, password, password_confirmation, university, role = "student") => {
    return await request("auth/register", {
      method: "POST",
      body: { name, email, otp, password, password_confirmation, university, role }
    });
  }, [request]);

  const sendOtp = useCallback(async (email) => {
    return await request("auth/send-otp", {
      method: "POST",
      body: { email }
    });
  }, [request]);

  const forgotPassword = useCallback(async (email) => {
    return await request("auth/password/forget", {
      method: "POST",
      body: { email }
    });
  }, [request]);

  const resetPassword = useCallback(async (email, otp, password, password_confirmation) => {
    return await request("auth/password/reset", {
      method: "POST",
      body: { email, otp, password, password_confirmation }
    });
  }, [request]);

  // Favorites API functions
  const getFavorites = useCallback(async () => {
    return await request("favorites", { auth: true });
  }, [request]);

  const toggleFavorite = useCallback(async (tableId, type) => {
    const formData = new FormData();
    formData.append("table_id", tableId);
    formData.append("type", type);

    return await request("favorites/toggle", {
      method: "POST",
      body: formData,
      auth: true,
      isFormData: true,
      invalidateCacheOnSuccess: ['favorites']
    });
  }, [request]);

  // Instructor API functions
  const getInstructors = useCallback(async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.per_page) query.set("per_page", params.per_page);
    const path = query.toString() ? `instructor?${query.toString()}` : "instructor";
    const response = await request(path, { useCache: true });
    return {
      data: Array.isArray(response?.data) ? response.data : (response.data || []),
      pagination: response?.pagination || null,
      raw: response,
    };
  }, [request]);

  const getInstructorById = useCallback(async (id) => {
    const response = await request(`instructor/${id}`, { useCache: true });
    return response.data;
  }, [request]);

  const value = useMemo(
    () => ({
      baseUrl,
      buildUrl,
      request,
      getAuthToken,
      getSettings,
      getMyProfile,
      login,
      register,
      sendOtp,
      forgotPassword,
      resetPassword,
      getFavorites,
      toggleFavorite,
      getInstructors,
      getInstructorById,
      clearCache,
      invalidateCache,
      updateCache,
      emitDataUpdate,
      onDataUpdate,

      // Placement Courses API
      async getPlacementCourses(params = {}) {
        const type = params.type || 'all';

        if (type === 'video') {
          const res = await request('placementCourses/video', { useCache: true });
          const list = Array.isArray(res?.data) ? res.data.map((c) => ({ ...c, type: 'video' })) : [];
          return { data: list, raw: res };
        }
        if (type === 'live') {
          const res = await request('placementCourses/live', { useCache: true });
          const list = Array.isArray(res?.data) ? res.data.map((c) => ({ ...c, type: 'live' })) : [];
          return { data: list, raw: res };
        }
        const [videoRes, liveRes] = await Promise.all([
          request('placementCourses/video', { useCache: true }),
          request('placementCourses/live', { useCache: true })
        ]);
        const video = Array.isArray(videoRes?.data) ? videoRes.data.map((c) => ({ ...c, type: 'video' })) : [];
        const live = Array.isArray(liveRes?.data) ? liveRes.data.map((c) => ({ ...c, type: 'live' })) : [];
        return { data: [...video, ...live], raw: { video: videoRes, live: liveRes } };
      },

      // Video Courses API
      async getVideoCourses(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.set("page", params.page);
        if (params.per_page) query.set("per_page", params.per_page);
        const path = query.toString() ? `video_courses?${query.toString()}` : "video_courses";
        const response = await request(path, { useCache: true });
        return {
          data: Array.isArray(response?.data) ? response.data : [],
          pagination: response?.pagination || null,
          raw: response,
        };
      },

      async getLiveCourses(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.set("page", params.page);
        if (params.per_page) query.set("per_page", params.per_page);
        const path = query.toString() ? `live_courses?${query.toString()}` : "live_courses";
        const response = await request(path, { useCache: true });
        return {
          data: Array.isArray(response?.data) ? response.data : [],
          pagination: response?.pagination || null,
          raw: response,
        };
      },

      async getVideoCourseById(id, auth = false) {
        if (!id) throw new Error("Course id is required");
        try {
          const response = await request(`video_course/${id}`, { auth, useCache: true });
          return response?.data || null;
        } catch (err) {
          if (err?.status === 404) {
            const candidates = [
              `courses/video/${id}`,
              `courses/${id}`,
            ];
            for (const path of candidates) {
              try {
                const res2 = await request(path, { auth, useCache: true });
                if (res2?.data) return res2.data;
              } catch {
                // try next
              }
            }
          }
          throw err;
        }
      },

      async getLiveCourseById(id, auth = false) {
        if (!id) throw new Error("Course id is required");
        try {
          const response = await request(`live_course/${id}`, { auth, useCache: true });
          return response?.data || null;
        } catch (err) {
          if (err?.status === 404) {
            const candidates = [
              `courses/live/${id}`,
              `courses/${id}`,
            ];
            for (const path of candidates) {
              try {
                const res2 = await request(path, { auth, useCache: true });
                if (res2?.data) return res2.data;
              } catch {
                // try next
              }
            }
          }
          throw err;
        }
      },

      async getLiveCourseLessons(courseId) {
        if (!courseId) throw new Error("Course id is required");
        try {
          const response = await request(`live_courses/${courseId}/lessons`, { useCache: true });
          return {
            data: Array.isArray(response?.data) ? response.data : [],
            raw: response,
          };
        } catch (err) {
          const candidates = [
            `courses/${courseId}/lessons`,
            `lessons?course_id=${courseId}`,
          ];
          for (const path of candidates) {
            try {
              const res2 = await request(path, { useCache: true });
              if (res2?.data) {
                return {
                  data: Array.isArray(res2.data) ? res2.data : [],
                  raw: res2,
                };
              }
            } catch {
              // try next
            }
          }
          throw err;
        }
      },

      async getCourseLessons(courseId) {
        if (!courseId) throw new Error("Course id is required");
        try {
          const response = await request(`video_courses/${courseId}/lessons`, { useCache: true });
          return {
            data: Array.isArray(response?.data) ? response.data : [],
            raw: response,
          };
        } catch (err) {
          const candidates = [
            `courses/${courseId}/lessons`,
            `lessons?course_id=${courseId}`,
          ];
          for (const path of candidates) {
            try {
              const res2 = await request(path, { useCache: true });
              if (res2?.data) {
                return {
                  data: Array.isArray(res2.data) ? res2.data : [],
                  raw: res2,
                };
              }
            } catch {
              // try next
            }
          }
          throw err;
        }
      },

      async getCourseAccess(courseId, type = null) {
        if (!courseId) throw new Error("Course id is required");
        try {
          const response = await request(`profile/get-my-courses`, { auth: true });
          const myCourses = response.data || [];

          const detectType = (item) => {
            if (!item) return null;
            if (item.type) return String(item.type);
            if (item.course_type) return String(item.course_type);
            if (item.is_live !== undefined) return item.is_live ? "live_course" : "video_course";
            if (item.resource_type) return String(item.resource_type);
            return null;
          };

          if (type) {
            return myCourses.some((c) => {
              const itemId = Number(c.id || c.course_id || c.id_course || 0);
              const itemType = detectType(c);
              return itemId === Number(courseId) && itemType && itemType.includes(type);
            });
          }

          return myCourses.some(course => Number(course.id) === Number(courseId));
        } catch (err) {
          console.warn('Failed to get my courses for access check:', err);
          return false;
        }
      },

      // Video course progress API - UPDATED with auto cache invalidation
      async getCourseProgress(courseId) {
        if (!courseId) throw new Error("Course id is required");
        const candidates = [
          `courses/${courseId}/progress`,
          `video_courses/${courseId}/progress`,
          `video_course/${courseId}/progress`
        ];
        for (const path of candidates) {
          try {
            const res = await request(path, { auth: true });
            return res?.data || null;
          } catch (e) {
            if (e?.status && e.status !== 404) throw e;
          }
        }
        return { status: 'not_started', percentage: 0, course_id: Number(courseId) };
      },

      async startLessonProgress(courseId, lessonId) {
        if (!courseId || !lessonId) throw new Error("Both courseId and lessonId are required");
        const candidates = [
          `courses/${courseId}/progress/${lessonId}/start`,
          `video_courses/${courseId}/progress/${lessonId}/start`,
          `video_course/${courseId}/progress/${lessonId}/start`
        ];
        for (const path of candidates) {
          try {
            const res = await request(path, {
              method: 'POST',
              auth: true,
              invalidateCacheOnSuccess: [`courses/${courseId}`, `progress`]
            });
            return res?.data || null;
          } catch (e) {
            if (e?.status && e.status !== 404) throw e;
          }
        }
        throw new Error('Progress start endpoint not available');
      },

      async completeLessonProgress(courseId, lessonId, type) {
        if (!courseId || !lessonId) throw new Error("Both courseId and lessonId are required");

        const formData = new FormData();
        formData.append('course', String(courseId));
        formData.append('lesson', String(lessonId));
        formData.append('type', type || 'lesson');

        const candidates = [
          `courses/${courseId}/progress/${lessonId}/complete`,
          `video_courses/${courseId}/progress/${lessonId}/complete`,
          `video_course/${courseId}/progress/${lessonId}/complete`
        ];

        for (const path of candidates) {
          try {
            const res = await request(path, {
              method: 'POST',
              auth: true,
              body: formData,
              isFormData: true,
              invalidateCacheOnSuccess: [
                `courses/${courseId}`,
                `progress`,
                `video_course/${courseId}`,
                `course/${courseId}`
              ]
            });
            return res?.data || null;
          } catch (e) {
            if (e?.status && e.status !== 404) throw e;
          }
        }
        throw new Error('Progress complete endpoint not available');
      },

      // Course Progress API functions - UPDATED
      async getCourseProgressDetails(courseId) {
        if (!courseId) throw new Error("Course id is required");
        const candidates = [
          `courses/${courseId}/progress`,
          `video_courses/${courseId}/progress`,
          `video_course/${courseId}/progress`
        ];
        for (const path of candidates) {
          try {
            const res = await request(path, { auth: true });
            return res?.data || null;
          } catch (e) {
            if (e?.status && e.status !== 404) throw e;
          }
        }
        return null;
      },

      async markLessonAsCompleted(courseId, lessonId) {
        if (!courseId || !lessonId) throw new Error("Both courseId and lessonId are required");

        const formData = new FormData();
        formData.append('course', String(courseId));
        formData.append('lesson', String(lessonId));
        formData.append('type', 'lesson');

        const candidates = [
          `courses/${courseId}/progress/${lessonId}/complete`,
          `video_courses/${courseId}/progress/${lessonId}/complete`,
          `video_course/${courseId}/progress/${lessonId}/complete`
        ];

        for (const path of candidates) {
          try {
            const res = await request(path, {
              method: 'POST',
              auth: true,
              body: formData,
              isFormData: true,
              invalidateCacheOnSuccess: [
                `courses/${courseId}`,
                `progress`,
                `video_course/${courseId}`
              ]
            });
            return res?.data || null;
          } catch (e) {
            if (e?.status && e.status !== 404) {
              console.warn(`Failed with endpoint ${path}:`, e.message);
              continue;
            }
          }
        }
        throw new Error('Lesson complete endpoint not available');
      },

      // Live Course Progress API functions - UPDATED بنفس نظام الفيديو
      async getLiveCourseProgress(courseId) {
        if (!courseId) throw new Error("Course id is required");
        const candidates = [
          `live_courses/${courseId}/progress`,
          `courses/${courseId}/progress`
        ];
        for (const path of candidates) {
          try {
            const res = await request(path, { auth: true });
            return res?.data || null;
          } catch (e) {
            if (e?.status && e.status !== 404) throw e;
          }
        }
        return { status: 'not_started', percentage: 0, course_id: Number(courseId) };
      },

      async startLiveLessonProgress(courseId, lessonId) {
        if (!courseId || !lessonId) throw new Error("Both courseId and lessonId are required");
        const candidates = [
          `live_courses/${courseId}/progress/${lessonId}/start`,
          `courses/${courseId}/progress/${lessonId}/start`
        ];
        for (const path of candidates) {
          try {
            const res = await request(path, {
              method: 'POST',
              auth: true,
              invalidateCacheOnSuccess: [
                `courses/${courseId}`,
                `progress`,
                `live_courses/${courseId}`,
                `live_course/${courseId}`
              ]
            });
            return res?.data || null;
          } catch (e) {
            if (e?.status && e.status !== 404) throw e;
          }
        }
        throw new Error('Live course progress start endpoint not available');
      },

      async completeLiveLessonProgress(courseId, lessonId, type) {
        if (!courseId || !lessonId) throw new Error("Both courseId and lessonId are required");

        const token = getAuthToken();
        if (!token) {
          throw new Error("Authentication token is required");
        }

        const formData = new FormData();
        formData.append('course', String(courseId));
        formData.append('lesson', String(lessonId));
        formData.append('type', type || 'lesson');

        console.log('Sending completeLiveLessonProgress request:', {
          courseId,
          lessonId,
          type,
          formData: {
            course: courseId,
            lesson: lessonId,
            type: type || 'lesson'
          }
        });

        try {
          const res = await request(`live_courses/${courseId}/progress/${lessonId}/complete`, {
            method: 'POST',
            body: formData,
            isFormData: true,
            auth: true,
            invalidateCacheOnSuccess: [
              `courses/${courseId}`,
              `progress`,
              `live_courses/${courseId}`,
              `live_course/${courseId}`,
              `course/${courseId}`
            ]
          });

          if (!res) {
            throw new Error("No response from server");
          }

          if (res.code === 422) {
            throw new Error(res.message || "The selected lesson is invalid.");
          }

          if (!res.success && res.code !== 200) {
            throw new Error(res.message || "Failed to complete lesson progress");
          }

          return res;
        } catch (error) {
          console.error("Error completing lesson progress:", error);

          if (error.message.includes("The selected lesson is invalid") || error.status === 422) {
            console.log('Trying alternative endpoint for quiz completion...');

            const alternativeFormData = new FormData();
            alternativeFormData.append('course_id', String(courseId));
            alternativeFormData.append('lesson_id', String(lessonId));
            alternativeFormData.append('type', type || 'quiz');

            try {
              const altRes = await request(`courses/${courseId}/progress/${lessonId}/complete`, {
                method: 'POST',
                body: alternativeFormData,
                isFormData: true,
                auth: true,
                invalidateCacheOnSuccess: [
                  `courses/${courseId}`,
                  `progress`,
                  `live_courses/${courseId}`,
                  `live_course/${courseId}`
                ]
              });

              return altRes;
            } catch (altError) {
              console.error("Alternative endpoint also failed:", altError);
              throw altError;
            }
          }

          throw error;
        }
      },

      async getLiveCourseProgressDetails(courseId) {
        if (!courseId) throw new Error("Course id is required");
        const candidates = [
          `live_courses/${courseId}/progress`,
          `courses/${courseId}/progress`
        ];
        for (const path of candidates) {
          try {
            const res = await request(path, { auth: true });
            return res?.data || null;
          } catch (e) {
            if (e?.status && e.status !== 404) throw e;
          }
        }
        return null;
      },

      async markLiveLessonAsCompleted(courseId, lessonId) {
        if (!courseId || !lessonId) throw new Error("Both courseId and lessonId are required");

        const formData = new FormData();
        formData.append('course', String(courseId));
        formData.append('lesson', String(lessonId));
        formData.append('type', 'lesson');

        const candidates = [
          `live_courses/${courseId}/progress/${lessonId}/complete`,
          `courses/${courseId}/progress/${lessonId}/complete`
        ];

        for (const path of candidates) {
          try {
            const res = await request(path, {
              method: 'POST',
              auth: true,
              body: formData,
              isFormData: true,
              invalidateCacheOnSuccess: [
                `courses/${courseId}`,
                `progress`,
                `live_courses/${courseId}`,
                `live_course/${courseId}`
              ]
            });
            return res?.data || null;
          } catch (e) {
            if (e?.status && e.status !== 404) {
              console.warn(`Failed with endpoint ${path}:`, e.message);
              continue;
            }
          }
        }
        throw new Error('Live lesson complete endpoint not available');
      },

      async getLiveLessonProgress(courseId, lessonId) {
        if (!courseId || !lessonId) throw new Error("Both courseId and lessonId are required");
        const candidates = [
          `live_courses/${courseId}/progress/${lessonId}`,
          `courses/${courseId}/progress/${lessonId}`
        ];
        for (const path of candidates) {
          try {
            const res = await request(path, { auth: true });
            return res?.data || null;
          } catch (e) {
            if (e?.status && e.status !== 404) throw e;
          }
        }
        return null;
      },

      // Course subscription - UPDATED with auto cache invalidation
      async subscribeToCourse(courseId, paymentMethod, amount, couponId = null) {
        const formData = new FormData();

        const userData = JSON.parse(localStorage.getItem("DR_KROK_user") || "{}");
        const userId = userData.id || userData.user_id || userData.client_id || courseId;

        formData.append('client_id', userId.toString());
        formData.append('course_id', courseId.toString());
        formData.append('payment_method', paymentMethod);
        formData.append('amount', amount.toString());
        formData.append('deposit_amount', amount.toString());
        if (couponId) {
          formData.append('coupon_id', couponId);
        }

        try {
          const result = await request('place_video_course', {
            method: 'POST',
            body: formData,
            auth: true,
            isFormData: true,
            invalidateCacheOnSuccess: [
              `profile/get-my-courses`,
              `video_course/${courseId}`,
              `course/${courseId}`,
              `courses/${courseId}`,
              'my-courses'
            ]
          });

          globalEvents.emit('dataUpdated', {
            type: 'purchaseSuccess',
            courseId: courseId,
            courseType: 'video_course',
            source: 'subscribeToCourse'
          });

          return result;
        } catch (error) {
          console.error("Purchase error for video course:", error);
          throw error;
        }
      },

      // Live course subscription - UPDATED بنفس النظام
      async subscribeToLiveCourse(courseId, paymentMethod, amount, couponId = null) {
        const formData = new FormData();

        const userData = JSON.parse(localStorage.getItem("DR_KROK_user") || "{}");
        const userId = userData.id || userData.user_id || userData.client_id || courseId;

        formData.append('client_id', userId.toString());
        formData.append('course_id', courseId.toString());
        formData.append('payment_method', paymentMethod);
        formData.append('amount', amount.toString());
        formData.append('deposit_amount', amount.toString());
        if (couponId) {
          formData.append('coupon_id', couponId);
        }

        try {
          const result = await request('place_live_course', {
            method: 'POST',
            body: formData,
            auth: true,
            isFormData: true,
            invalidateCacheOnSuccess: [
              `profile/get-my-courses`,
              `live_course/${courseId}`,
              `course/${courseId}`,
              `courses/${courseId}`,
              'my-courses'
            ]
          });

          globalEvents.emit('dataUpdated', {
            type: 'purchaseSuccess',
            courseId: courseId,
            courseType: 'live_course',
            source: 'subscribeToLiveCourse'
          });

          return result;
        } catch (error) {
          console.error("Purchase error for live course:", error);
          throw error;
        }
      },

      // Get user's enrolled courses
      async getMyCourses() {
        const response = await request("profile/get-my-courses", { auth: true });
        return response.data || [];
      },

      // Add student test results - UPDATED
      async addStudentTest(testData) {
        console.log('🎯 addStudentTest called with:', testData);

        try {
          const response = await request("add_student_test", {
            method: "POST",
            body: testData,
            auth: true,
            invalidateCacheOnSuccess: [
              `progress`,
              `courses/${testData.course_id}`,
              `student_test`,
              `test`
            ]
          });

          globalEvents.emit('dataUpdated', {
            type: 'testCompleted',
            courseId: testData.course_id,
            lessonId: testData.lesson_id,
            testId: testData.test_id
          });

          return response;
        } catch (error) {
          console.error('❌ Error in addStudentTest:', error);

          const formData = new FormData();
          formData.append('test_id', testData.test_id?.toString() || "");
          formData.append('course_id', testData.course_id?.toString() || "");
          if (testData.lesson_id) {
            formData.append('lesson_id', testData.lesson_id?.toString() || "");
          }
          formData.append('type', testData.type || "");
          formData.append('student_score', testData.student_score?.toString() || "0");
          formData.append('total_score', testData.total_score?.toString() || "0");
          formData.append('result_status', testData.result_status?.toString() || "1");
          formData.append('total_questions', testData.total_questions?.toString() || "0");
          formData.append('questions', JSON.stringify(testData.questions || []));

          try {
            const formDataResponse = await request("add_student_test", {
              method: "POST",
              body: formData,
              auth: true,
              isFormData: true,
              invalidateCacheOnSuccess: [
                `progress`,
                `courses/${testData.course_id}`,
                `student_test`,
                `test`
              ]
            });

            globalEvents.emit('dataUpdated', {
              type: 'testCompleted',
              courseId: testData.course_id,
              lessonId: testData.lesson_id,
              testId: testData.test_id
            });

            return formDataResponse;
          } catch (formDataError) {
            console.error('❌ FormData also failed:', formDataError);
            throw formDataError;
          }
        }
      },

      // Check student test - UPDATED مع cache invalidation
      async checkStudentTest(testData) {
        console.log('🔍 checkStudentTest called with:', testData);

        try {
          const response = await request("checkStudentTest", {
            method: "POST",
            body: testData,
            auth: true,
            invalidateCacheOnSuccess: [
              `student_test`,
              `test`
            ]
          });

          console.log('✅ checkStudentTest response:', response);
          return response;

        } catch (error) {
          console.error('❌ Error in checkStudentTest:', error);

          const formData = new FormData();
          formData.append('test_id', testData.test_id?.toString() || "");
          formData.append('course_id', testData.course_id?.toString() || "");
          if (testData.lesson_id) {
            formData.append('lesson_id', testData.lesson_id?.toString() || "");
          }
          formData.append('type', testData.type || "");

          try {
            const formDataResponse = await request("checkStudentTest", {
              method: "POST",
              body: formData,
              auth: true,
              isFormData: true,
              invalidateCacheOnSuccess: [
                `student_test`,
                `test`
              ]
            });

            console.log('✅ FormData response for checkStudentTest:', formDataResponse);
            return formDataResponse;
          } catch (formDataError) {
            console.error('❌ FormData also failed for checkStudentTest:', formDataError);
            throw formDataError;
          }
        }
      },

      async getStudentTestReview(testId, studentTestId) {
        console.log('🔍 getStudentTestReview called with:', { testId, studentTestId });
        return await request(`student_test_review?test_id=${testId}&student_test_id=${studentTestId}`, {
          auth: true,
          useCache: false
        });
      },

      // Blogs API
      async getBlogs(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.set("page", params.page);
        if (params.per_page) query.set("per_page", params.per_page);
        if (params.instructor_id) query.set("instructor_id", params.instructor_id);
        const path = query.toString() ? `blog?${query.toString()}` : "blog";
        const response = await request(path, { useCache: true });
        return {
          data: Array.isArray(response?.data) ? response.data : [],
          pagination: response?.pagination || null,
          raw: response
        };
      },

      async getBlogBySlug(slugOrId) {
        if (!slugOrId) throw new Error("Article slug is required");

        let decoded = slugOrId;
        try {
          decoded = decodeURIComponent(slugOrId);
        } catch {
          decoded = slugOrId;
        }

        try {
          const direct = await request(`blog/${encodeURIComponent(decoded)}`, { useCache: true });
          const blogData = direct?.data;
          if (blogData?.id) {
            return {
              ...blogData,
              instructor: blogData.instructor || blogData.instructor_id || null,
            };
          }
        } catch {
          // Fall back to paginated list search
        }

        let page = 1;
        let totalPages = 1;

        do {
          const response = await request(`blog?page=${page}&per_page=50`, { useCache: true });
          const instructors = Array.isArray(response?.data) ? response.data : [];

          for (const instructor of instructors) {
            for (const blog of instructor.blogs || []) {
              const matchesSlug = blog.slug && blog.slug === decoded;
              const matchesId = String(blog.id) === decoded || String(blog.id) === slugOrId;

              if (matchesSlug || matchesId) {
                return {
                  ...blog,
                  instructor: {
                    id: instructor.id,
                    name: instructor.name,
                    image: instructor.image,
                    facebook: instructor.facebook,
                    instagram: instructor.instagram,
                    youtube: instructor.youtube,
                  },
                };
              }
            }
          }

          totalPages = response?.pagination?.total_pages || 1;
          page += 1;
        } while (page <= totalPages);

        throw new Error("Article not found");
      },

      // Reviews API
      async submitCourseReview(courseId, rating, comment, type = 'video_course') {
        const formData = new FormData();
        formData.append('course_id', courseId);
        formData.append('rate_number', rating);
        formData.append('rate_comment', comment);
        formData.append('type', type);

        console.log('API Request - submitCourseReview:', {
          courseId,
          rating,
          comment,
          type,
          formData: {
            course_id: courseId,
            rate_number: rating,
            rate_comment: comment,
            type: type
          }
        });

        return await request('ratings/add', {
          method: 'POST',
          body: formData,
          auth: true,
          isFormData: true,
          invalidateCacheOnSuccess: [
            `ratings`,
            `courses/${courseId}`,
            `video_course/${courseId}`,
            `live_course/${courseId}`
          ]
        });
      },

      async getUserRatings() {
        return await request('user/ratings', { auth: true });
      },

      async checkUserReview(courseId) {
        return await request(`courses/${courseId}/user-review`, { auth: true });
      },

      // Orders API
      async getOrders() {
        const response = await request('orders', { auth: true });
        return response.data || { orders: [] };
      },

      // Final Test Results API
      async getFinalTestResult(courseId) {
        if (!courseId) throw new Error("Course id is required");

        const candidates = [
          `live_courses/${courseId}/final-test-result`,
          `courses/${courseId}/final-test-result`
        ];

        for (const path of candidates) {
          try {
            const response = await request(path, { auth: true });
            if (response && response.data) return response.data;
          } catch (err) {
            if (err?.status !== 404) {
              console.warn(`Failed with endpoint ${path}:`, err);
            }
          }
        }
        return null;
      },

      async saveFinalTestResult(courseId, testData) {
        if (!courseId) throw new Error("Course id is required");
        try {
          const formData = new FormData();
          formData.append('course_id', courseId.toString());
          formData.append('score', testData.score?.toString() || '0');
          formData.append('percentage', testData.percentage?.toString() || '0');
          formData.append('passed', testData.passed ? '1' : '0');

          const candidates = [
            `live_courses/${courseId}/final-test-result`,
            `courses/${courseId}/final-test-result`
          ];

          for (const path of candidates) {
            try {
              const response = await request(path, {
                method: 'POST',
                body: formData,
                auth: true,
                isFormData: true,
                invalidateCacheOnSuccess: [
                  `courses/${courseId}`,
                  `video_course/${courseId}`,
                  `live_courses/${courseId}`,
                  `live_course/${courseId}`,
                  `final-test-result`
                ]
              });
              return response?.data || null;
            } catch (err) {
              if (err?.status !== 404) {
                console.warn(`Failed saving final test result with endpoint ${path}:`, err);
              }
            }
          }
          throw new Error('Failed to save final test result for both paths');
        } catch (err) {
          console.error('Failed to save final test result:', err);
          throw err;
        }
      },

      // Certificate API functions
      // Certificate API functions - إصلاح الدوال
      async uploadCertificate(token, formData) {
        if (!token) throw new Error("Token is required");
        if (!formData) throw new Error("FormData is required");

        try {
          // استخدام request العادية بدل axios
          const response = await request("create_student_certificate", {
            method: "POST",
            body: formData,
            auth: true,
            isFormData: true
          });
          return response;
        } catch (error) {
          console.error('Failed to upload certificate:', error);

          // محاولة باستخدام axios كـ fallback
          try {
            const url = buildUrl("create_student_certificate");
            const axiosResponse = await axios.post(url, formData, {
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
              },
              timeout: 30000
            });
            return axiosResponse.data;
          } catch (axiosError) {
            console.error('Axios upload also failed:', axiosError);
            throw axiosError;
          }
        }
      },

      // Certificate API functions - الإصدار المحسن
      async getCertificateFile(token, courseId, courseType = 'video') {
        if (!token) throw new Error("Token is required");
        if (!courseId) throw new Error("Course id is required");

        try {
          // بناء الـ URL مع إضافة الـ type parameter
          const url = buildUrl(`get_certificate_file?course_id=${courseId}&type=${courseType}`);
          console.log('🔍 Fetching certificate from:', url);

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              "Authorization": `Bearer ${token}`,
              "Accept": "application/pdf, application/json, */*",
              "Accept-Language": (i18n?.language || "en").split("-")[0]
            },
            // إضافة timeout لمنع التجميد
            signal: AbortSignal.timeout(30000)
          });

          if (!response.ok) {
            // إذا كان الرد 404، هذا يعني لا توجد شهادة
            if (response.status === 404) {
              throw new Error("CERTIFICATE_NOT_FOUND");
            }
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
          }

          // محاولة parsing كـ JSON أولاً
          const contentType = response.headers.get('content-type') || '';

          if (contentType.includes('application/json')) {
            const jsonResponse = await response.json();
            console.log('📄 JSON Response:', jsonResponse);

            // التحقق من الـ code الجديد (208 أو 200)
            if (jsonResponse && (jsonResponse.code === 200 || jsonResponse.code === 208) && jsonResponse.success) {
              if (jsonResponse.data && jsonResponse.data.certificate) {
                // إذا كان فيه رابط للشهادة، نحمله
                const certificateUrl = jsonResponse.data.certificate;
                console.log('📥 Downloading certificate from URL:', certificateUrl);

                try {
                  // محاولة تحميل الشهادة من الـ URL
                  const pdfResponse = await fetch(certificateUrl, {
                    method: 'GET',
                    headers: {
                      "Authorization": `Bearer ${token}`,
                    },
                    signal: AbortSignal.timeout(30000)
                  });

                  if (pdfResponse.ok) {
                    const pdfBlob = await pdfResponse.blob();
                    if (pdfBlob && pdfBlob.size > 0) {
                      console.log('✅ Certificate downloaded successfully, size:', pdfBlob.size);
                      return pdfBlob;
                    } else {
                      console.warn('⚠️ Certificate blob is empty');
                      throw new Error("CERTIFICATE_EMPTY");
                    }
                  } else {
                    console.warn('⚠️ Failed to download certificate from URL:', pdfResponse.status);
                    throw new Error("CERTIFICATE_DOWNLOAD_FAILED");
                  }
                } catch (fetchError) {
                  console.warn('⚠️ Error fetching certificate URL:', fetchError.message);
                  throw new Error("CERTIFICATE_URL_FETCH_FAILED");
                }
              } else {
                throw new Error("CERTIFICATE_URL_MISSING");
              }
            } else {
              throw new Error(jsonResponse.message || "CERTIFICATE_NOT_AVAILABLE");
            }
          } else if (contentType.includes('application/pdf')) {
            // إذا كان الرد مباشرة PDF
            const blob = await response.blob();
            if (!blob || blob.size === 0) {
              throw new Error("CERTIFICATE_EMPTY");
            }
            console.log('✅ PDF received directly, size:', blob.size);
            return blob;
          } else {
            // إذا لم نعرف نوع المحتوى، نحاول كـ PDF
            console.warn('⚠️ Unknown content type, trying as PDF:', contentType);
            const blob = await response.blob();
            if (blob && blob.size > 1000) { // حجم معقول للـ PDF
              console.log('✅ PDF received (unknown type), size:', blob.size);
              return blob;
            }
            throw new Error("UNKNOWN_CONTENT_TYPE");
          }

        } catch (error) {
          console.error('❌ Failed to get certificate file:', error);

          // إذا كان الخطأ بسبب timeout أو network
          if (error.name === 'TimeoutError' || error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
            throw new Error("NETWORK_ERROR");
          }

          // إذا كان الخطأ معروفاً نرميه كما هو
          if (error.message.startsWith('CERTIFICATE_') || error.message === 'CERTIFICATE_NOT_FOUND') {
            throw error;
          }

          // لأي خطأ آخر
          throw new Error("CERTIFICATE_FETCH_ERROR");
        }
      },



      // دالة للتحقق من وجود الشهادة فقط (بدون تحميلها)
      async checkCertificateExists(token, courseId, courseType = 'video') {
        if (!token) throw new Error("Token is required");
        if (!courseId) throw new Error("Course id is required");

        try {
          const url = buildUrl(`get_certificate_file?course_id=${courseId}&type=${courseType}`);
          console.log('🔍 Checking if certificate exists:', url);

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              "Authorization": `Bearer ${token}`,
              "Accept": "application/json"
            }
          });

          if (!response.ok) {
            return false;
          }

          const contentType = response.headers.get('content-type');

          if (contentType && contentType.includes('application/json')) {
            const jsonResponse = await response.json();
            console.log('📄 Certificate check response:', jsonResponse);

            // إذا كان الـ response فيه success: true و certificate URL، يعني الشهادة موجودة
            if (jsonResponse && (jsonResponse.code === 200 || jsonResponse.code === 208) && jsonResponse.success) {
              if (jsonResponse.data && jsonResponse.data.certificate) {
                console.log('✅ Certificate exists on server');
                return true;
              }
            }
          } else if (contentType && contentType.includes('application/pdf')) {
            // إذا كان الرد مباشرة PDF، يعني الشهادة موجودة
            console.log('✅ Certificate exists (PDF response)');
            return true;
          }

          return false;
        } catch (error) {
          console.error('❌ Failed to check certificate existence:', error);
          return false;
        }
      },

      // دالة للحصول على رابط الشهادة مباشرة من السيرفر
      async getCertificateUrl(token, courseId, courseType = 'video') {
        if (!token) throw new Error("Token is required");
        if (!courseId) throw new Error("Course id is required");

        try {
          const url = buildUrl(`get_certificate_file?course_id=${courseId}&type=${courseType}`);
          console.log('🔍 Getting certificate URL from:', url);

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              "Authorization": `Bearer ${token}`,
              "Accept": "application/json"
            }
          });

          if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
          }

          const contentType = response.headers.get('content-type');

          if (contentType && contentType.includes('application/json')) {
            const jsonResponse = await response.json();
            console.log('📄 Certificate URL response:', jsonResponse);

            if (jsonResponse && (jsonResponse.code === 200 || jsonResponse.code === 208) && jsonResponse.success) {
              if (jsonResponse.data && jsonResponse.data.certificate) {
                const certificateUrl = jsonResponse.data.certificate;
                console.log('✅ Certificate URL found:', certificateUrl);
                return certificateUrl;
              }
            }
            throw new Error(jsonResponse.message || "Certificate URL not found in response");
          } else if (contentType && contentType.includes('application/pdf')) {
            // إذا كان الرد مباشرة PDF، نرجع blob URL
            const blob = await response.blob();
            if (blob && blob.size > 0) {
              const blobUrl = URL.createObjectURL(blob);
              console.log('✅ PDF received directly, created blob URL');
              return blobUrl;
            }
            throw new Error("Empty PDF received from server");
          } else {
            throw new Error(`Unexpected content type: ${contentType}`);
          }
        } catch (error) {
          console.error('❌ Failed to get certificate URL:', error);
          throw error;
        }
      },

      // Gemini Chat API
      async getChatStatus(signal = null) {
        return await request("chat/status", { auth: true, signal });
      },

      async sendChatMessage(message, signal = null) {
        return await request("chat/send", {
          method: "POST",
          body: { message },
          auth: true,
          signal
        });
      },

      async getNotifications(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.set("page", params.page);
        const path = query.toString() ? `profile/my-notifications?${query.toString()}` : "profile/my-notifications";
        return await request(path, { auth: true, useCache: true });
      },

      async getJobs() {
        return await request("job", { useCache: true });
      },

      async submitJobApplication(formData) {
        return await request("job_applications", {
          method: "POST",
          body: formData,
          isFormData: true,
          auth: false // التقديم غالباً متاح للكل حتى لو مش عامل لوجن
        });
      },

      // ─── Lesson Interactions (Video Course) ───────────────────────────────────

      async getVideoLessonInteractions(lessonId) {
        if (!lessonId) throw new Error("lessonId is required");
        const res = await request(`video_course/lesson/${lessonId}/interactions`, {
          auth: true,
          useCache: false,
        });
        return res?.data || null;
      },

      async toggleVideoLessonLike(lessonId) {
        if (!lessonId) throw new Error("lessonId is required");
        return await request(`video_lesson/${lessonId}/like`, {
          method: "POST",
          auth: true,
        });
      },

      async addVideoLessonComment(lessonId, body) {
        if (!lessonId) throw new Error("lessonId is required");
        const formData = new FormData();
        formData.append("body", body);
        return await request(`video_lesson/${lessonId}/comment`, {
          method: "POST",
          auth: true,
          body: formData,
          isFormData: true,
        });
      },

      async editVideoLessonComment(commentId, body) {
        if (!commentId) throw new Error("commentId is required");
        return await request(`video_lesson/video_course/comment/${commentId}`, {
          method: "PUT",
          auth: true,
          body: { body },
        });
      },

      async deleteVideoLessonComment(lessonId, commentId) {
        if (!lessonId || !commentId) throw new Error("lessonId and commentId are required");
        return await request(`video_lesson/${lessonId}/comment/${commentId}`, {
          method: "DELETE",
          auth: true,
        });
      },

      // ─── Lesson Interactions (Live Course) ───────────────────────────────────

      async getLiveLessonInteractions(lessonId, batch_id) {
        if (!lessonId || !batch_id) throw new Error("lessonId and batch_id are required");
        const res = await request(`live-course/interactions/${batch_id}/${lessonId}`, {
          auth: true,
          useCache: false,
        });
        return res?.data || null;
      },

      async toggleLiveLessonLike(lessonId) {
        if (!lessonId) throw new Error("lessonId is required");
        return await request(`live_lesson/${lessonId}/like`, {
          method: "POST",
          auth: true,
        });
      },

      async addLiveLessonComment(lessonId, body) {
        if (!lessonId) throw new Error("lessonId is required");
        const formData = new FormData();
        formData.append("body", body);
        return await request(`live_lesson/${lessonId}/comment`, {
          method: "POST",
          auth: true,
          body: formData,
          isFormData: true,
        });
      },

      async editLiveLessonComment(lessonId, commentId, body) {
        if (!lessonId || !commentId) throw new Error("IDs are required");
        return await request(`live_lesson/${lessonId}/comment/${commentId}`, {
          method: "PUT",
          auth: true,
          body: { body },
        });
      },

      async deleteLiveLessonComment(lessonId, commentId) {
        if (!lessonId || !commentId) throw new Error("lessonId and commentId are required");
        return await request(`live_lesson/${lessonId}/comment/${commentId}`, {
          method: "DELETE",
          auth: true,
        });
      },

      async getLessonFlashCards(lessonId, page = 1, limit = 100) {
        if (!lessonId) throw new Error("lessonId is required");
        return await request(`lesson/${lessonId}/flash-cards?limit=${limit}&page=${page}`, {
          auth: true,
          useCache: true,
        });
      },

      async getLiveLessonFlashCards(liveLessonId, page = 1, limit = 100) {
        if (!liveLessonId) throw new Error("liveLessonId is required");
        return await request(`live-lesson/${liveLessonId}/flash-cards?limit=${limit}&page=${page}`, {
          auth: true,
          useCache: true,
        });
      },

      async getMyMaterials() {
        return await request("profile/my-material", {
          auth: true,
          useCache: true,
        });
      },
    }),
    [
      baseUrl,
      buildUrl,
      request,
      getAuthToken,
      getSettings,
      getMyProfile,
      login,
      register,
      getFavorites,
      toggleFavorite,
      getInstructors,
      getInstructorById,
      clearCache,
      invalidateCache,
      updateCache,
      emitDataUpdate,
      onDataUpdate
    ]
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
