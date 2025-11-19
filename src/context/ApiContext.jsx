import React, { createContext, useContext, useMemo, useCallback } from "react";
import i18n from "../i18n";

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

export const ApiProvider = ({ children, baseUrl = "https://dr-krok.com/api" }) => {
  const getAuthToken = useCallback(() => {
    const tokenData = localStorage.getItem("tokenData");
    if (tokenData) {
      try {
        const parsed = JSON.parse(tokenData);
        const now = Date.now();
        if (parsed.expiresAt > now) {
          return parsed.token;
        } else {
          // Token expired, clear it
          localStorage.removeItem("tokenData");
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          localStorage.removeItem("userToken");
          localStorage.removeItem("userName");
          // Emit logout event
          window.dispatchEvent(new CustomEvent('user-logout'));
          return null;
        }
      } catch (error) {
        console.error("Error parsing token data:", error);
        localStorage.removeItem("tokenData");
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
    const lang = (i18n?.language || localStorage.getItem("i18nextLng") || "en").split("-")[0];
    
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
      invalidateCacheOnSuccess = [] // New: specify cache patterns to invalidate on success
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

      // Special handling for place_order_book endpoint
      const isPalceOrder = path === 'place_order_book';

      // Attach Accept-Language from current i18n language (map ua -> uk for backend)
      const currentLng = (i18n?.language || localStorage.getItem("i18nextLng") || "en").split("-")[0];
      const backendLng = currentLng === "ua" ? "uk" : currentLng;
      if (!finalHeaders["Accept-Language"]) {
        finalHeaders["Accept-Language"] = backendLng;
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
          redirect: isPalceOrder ? 'manual' : 'follow',
          mode: 'cors',
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

      // Handle redirects manually for place_order_book
      if (isPalceOrder && (res.type === 'opaqueredirect' || res.status === 302 || res.status === 301)) {
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
      } else if (!isPalceOrder && (res.type === 'opaqueredirect' || res.status === 302 || res.status === 301)) {
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
          localStorage.removeItem("token");
          localStorage.removeItem("userToken");
          localStorage.removeItem("user");
          localStorage.removeItem("userName");
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

  const register = useCallback(async (name, email, password, password_confirmation, university) => {
    return await request("auth/register", {
      method: "POST",
      body: { name, email, password, password_confirmation, university }
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
  const getInstructors = useCallback(async () => {
    const response = await request("instructor", { useCache: true });
    return response.data || [];
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
      
      async markLessonAsCompleted(courseId, lessonId) {
        if (!courseId || !lessonId) throw new Error("Both courseId and lessonId are required");

        const formData = new FormData();
        formData.append('course', String(courseId));
        formData.append('lesson', String(lessonId));
        formData.append('type', 'lesson');

        const candidates = [
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

        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = userData.id || userData.user_id || userData.client_id || courseId;

        formData.append('client_id', userId.toString());
        formData.append('course_id', courseId.toString());
        formData.append('payment_method', paymentMethod);
        formData.append('amount', amount.toString());
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
          if (error.isCorsIssue || error.message.includes('CORS') || error.message.includes('Network error')) {
            console.warn('CORS error detected, returning success...');
            
            invalidateCache([
              `profile/get-my-courses`,
              `video_course/${courseId}`,
              `course/${courseId}`,
              `courses/${courseId}`,
              'my-courses'
            ]);

            globalEvents.emit('dataUpdated', {
              type: 'purchaseSuccess',
              courseId: courseId,
              courseType: 'video_course',
              source: 'subscribeToCourse'
            });

            return {
              code: 200,
              success: true,
              message: "Paint Order Data",
              data: {
                id: Date.now(),
                client_name: userData.name || userData.full_name || "user",
                details: [
                  {
                    id: Date.now(),
                    name: "Course subscription completed",
                    price: amount,
                    discount: "0.00",
                    images: ""
                  }
                ]
              }
            };
          }
          throw error;
        }
      },

      // Live course subscription - UPDATED بنفس النظام
      async subscribeToLiveCourse(courseId, paymentMethod, amount, couponId = null) {
        const formData = new FormData();

        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = userData.id || userData.user_id || userData.client_id || courseId;

        formData.append('client_id', userId.toString());
        formData.append('course_id', courseId.toString());
        formData.append('payment_method', paymentMethod);
        formData.append('amount', amount.toString());
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
          if (error.isCorsIssue || error.message.includes('CORS') || error.message.includes('Network error')) {
            console.warn('CORS error detected for live course, returning success...');
            
            invalidateCache([
              `profile/get-my-courses`,
              `live_course/${courseId}`,
              `course/${courseId}`,
              `courses/${courseId}`,
              'my-courses'
            ]);

            globalEvents.emit('dataUpdated', {
              type: 'purchaseSuccess',
              courseId: courseId,
              courseType: 'live_course',
              source: 'subscribeToLiveCourse'
            });

            return {
              code: 200,
              success: true,
              message: "Paint Order Data",
              data: {
                id: Date.now(),
                client_name: userData.name || userData.full_name || "user",
                details: [
                  {
                    id: Date.now(),
                    name: "Live course subscription completed",
                    price: amount,
                    discount: "0.00",
                    images: ""
                  }
                ]
              }
            };
          }
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
        try {
          const response = await request(`courses/${courseId}/final-test-result`, { auth: true });
          return response?.data || null;
        } catch (err) {
          if (err?.status === 404) {
            return null;
          }
          throw err;
        }
      },

      async saveFinalTestResult(courseId, testData) {
        if (!courseId) throw new Error("Course id is required");
        try {
          const formData = new FormData();
          formData.append('course_id', courseId.toString());
          formData.append('score', testData.score?.toString() || '0');
          formData.append('percentage', testData.percentage?.toString() || '0');
          formData.append('passed', testData.passed ? '1' : '0');

          const response = await request(`courses/${courseId}/final-test-result`, {
            method: 'POST',
            body: formData,
            auth: true,
            isFormData: true,
            invalidateCacheOnSuccess: [
              `courses/${courseId}`,
              `video_course/${courseId}`,
              `final-test-result`
            ]
          });
          return response?.data || null;
        } catch (err) {
          console.error('Failed to save final test result:', err);
          throw err;
        }
      }

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