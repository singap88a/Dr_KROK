import React, { createContext, useContext, useMemo, useCallback } from "react";
import i18n from "../i18n";

const ApiContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useApi = () => {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error("useApi must be used within an ApiProvider");
  return ctx;
};

export const ApiProvider = ({ children, baseUrl = "https://dr-krok.hudurly.com/api" }) => {
  const getAuthToken = useCallback(() => {
    return localStorage.getItem("token") || localStorage.getItem("userToken");
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

  const request = useCallback(
    async (path, { method = "GET", headers = {}, body, auth = false, isFormData = false } = {}) => {
      const url = buildUrl(path);
      const finalHeaders = { ...headers };

      // Special handling for palce_order endpoint
      const isPalceOrder = path === 'palce_order';

      // Attach Accept-Language from current i18n language (map ua -> uk for backend)
      const currentLng = (i18n?.language || localStorage.getItem("i18nextLng") || "en").split("-")[0];
      const backendLng = currentLng === "ua" ? "uk" : currentLng; // backend expects uk for Ukrainian
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
          redirect: isPalceOrder ? 'manual' : 'follow', // Manual redirect handling for palce_order
          mode: 'cors', // Ensure CORS mode
        });
      } catch (fetchError) {
        // Handle network errors, CORS errors, etc.
        if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
          const error = new Error("Network error or CORS issue. Please check your connection and try again.");
          error.status = 0;
          error.data = null;
          throw error;
        }
        throw fetchError;
      }

      // Handle redirects manually for palce_order
      if (isPalceOrder && (res.type === 'opaqueredirect' || res.status === 302 || res.status === 301)) {
        // For palce_order, try to get the response anyway as it might still contain data
        console.warn('palce_order endpoint redirected, but continuing...');

        // If we can't get the response due to redirect, try a different approach
        if (res.type === 'opaqueredirect') {
          // Try to make the request again with different settings
          try {
            const retryRes = await fetch(url, {
              method,
              headers: finalHeaders,
              body: isFormData ? body : body ? JSON.stringify(body) : undefined,
              redirect: 'follow',
              mode: 'no-cors', // Try no-cors mode as fallback
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

        // Handle specific error cases
        if (res.status === 302) {
          message = "Request was redirected. Please try again.";
        } else if (res.status === 0) {
          message = "Network error or CORS issue. Please check your connection.";
        }

        const error = new Error(message);
        error.status = res.status;
        error.data = data;
        throw error;
      }
      return data;
    },
    [buildUrl, getAuthToken]
  );

  const getSettings = useCallback(async () => {
    return await request("setting");
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
      isFormData: true
    });
  }, [request]);

  // Instructor API functions
  const getInstructors = useCallback(async () => {
    const response = await request("instructor");
    return response.data || [];
  }, [request]);

  const getInstructorById = useCallback(async (id) => {
    const response = await request(`instructor/${id}`);
    return response.data;
  }, [request]);

  const value = useMemo(
    () => ({
      baseUrl,
      buildUrl,
      request,
      getAuthToken,
      getSettings,
      getFavorites,
      toggleFavorite,
      getInstructors,
      getInstructorById,
      // Video Courses API
      async getVideoCourses(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.set("page", params.page);
        if (params.per_page) query.set("per_page", params.per_page);
        const path = query.toString() ? `video_courses?${query.toString()}` : "video_courses";
        const response = await request(path);
        return {
          data: Array.isArray(response?.data) ? response.data : [],
          pagination: response?.pagination || null,
          raw: response,
        };
      },
      async getVideoCourseById(id) {
        if (!id) throw new Error("Course id is required");
        try {
          const response = await request(`video_courses/${id}`);
          return response?.data || null;
        } catch (err) {
          // Fallbacks for different backend routes
          if (err?.status === 404) {
            const candidates = [
              `video_courses/show/${id}`,
              `video_course/${id}`,
              `courses/video/${id}`,
              `courses/${id}`,
            ];
            for (const path of candidates) {
              try {
                const res2 = await request(path);
                if (res2?.data) return res2.data;
              } catch (e2) {
                // try next
              }
            }
          }
          throw err;
        }
      },
      // Course Lessons API
      async getCourseLessons(courseId) {
        if (!courseId) throw new Error("Course id is required");
        try {
          const response = await request(`video_courses/${courseId}/lessons`);
          return {
            data: Array.isArray(response?.data) ? response.data : [],
            raw: response,
          };
        } catch (err) {
          // Fallback endpoints
          const candidates = [
            `courses/${courseId}/lessons`,
            `lessons?course_id=${courseId}`,
          ];
          for (const path of candidates) {
            try {
              const res2 = await request(path);
              if (res2?.data) {
                return {
                  data: Array.isArray(res2.data) ? res2.data : [],
                  raw: res2,
                };
              }
            } catch (e2) {
              // try next
            }
          }
          throw err;
        }
      },
      async getCourseAccess(courseId) {
        if (!courseId) throw new Error("Course id is required");
        try {
          const response = await request(`video_courses/${courseId}/access`, { auth: true });
          return response?.has_access || false;
        } catch (err) {
          // Fallback
          if (err?.status === 404) {
            try {
              const userCourses = await request('user/courses', { auth: true });
              return userCourses?.data?.some(course => course.id === parseInt(courseId)) || false;
            } catch (e2) {
              return false;
            }
          }
          throw err;
        }
      },
      // Blogs API
      async getBlogs(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.set("page", params.page);
        if (params.per_page) query.set("per_page", params.per_page);
        if (params.instructor_id) query.set("instructor_id", params.instructor_id);
        const path = query.toString() ? `blog?${query.toString()}` : "blog";
        const response = await request(path);
        return {
          data: Array.isArray(response?.data) ? response.data : [],
          pagination: response?.pagination || null,
          raw: response
        };
      },
      // Reviews API
      async submitCourseReview(courseId, rating, comment) {
        const formData = new FormData();
        formData.append('course_id', courseId);
        formData.append('rate_number', rating);
        formData.append('rate_comment', comment);

        console.log('API Request - submitCourseReview:', {
          courseId,
          rating,
          comment,
          formData: {
            course_id: courseId,
            rate_number: rating,
            rate_comment: comment
          }
        });

        return await request('ratings/add', {
          method: 'POST',
          body: formData,
          auth: true,
          isFormData: true
        });
      },
      async getUserRatings() {
        return await request('user/ratings', { auth: true });
      },
      async checkUserReview(courseId) {
        return await request(`courses/${courseId}/user-review`, { auth: true });
      },
      // Course subscription
      async subscribeToCourse(courseId, paymentMethod, amount, couponId = null) {
        const formData = new FormData();
        formData.append('course_id', courseId);
        formData.append('payment_method', paymentMethod);
        formData.append('amount', amount);
        if (couponId) {
          formData.append('coupon_id', couponId);
        }

        return await request('place_video_course', {
          method: 'POST',
          body: formData,
          auth: true,
          isFormData: true
        });
      }
    }),
    [
      baseUrl,
      buildUrl,
      request,
      getAuthToken,
      getSettings,
      getFavorites,
      toggleFavorite,
      getInstructors,
      getInstructorById
    ]
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
