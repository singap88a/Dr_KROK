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

      const res = await fetch(url, {
        method,
        headers: finalHeaders,
        body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        const message = data?.message || `Request failed: ${res.status}`;
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

  const value = useMemo(
    () => ({ baseUrl, buildUrl, request, getAuthToken, getSettings }),
    [baseUrl, buildUrl, request, getAuthToken, getSettings]
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
