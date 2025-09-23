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
    return await request(`instructors/${id}`);
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
