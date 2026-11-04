// UserContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const SEVEN_DAYS_SECONDS = 604800; // 7 days in seconds
export const SEVEN_DAYS_MS = SEVEN_DAYS_SECONDS * 1000; // 7 days in ms (604,800,000 ms)

export const calculateTokenExpiresAt = (expiryMeta) => {
  if (!expiryMeta) {
    return Date.now() + SEVEN_DAYS_MS;
  }

  // 1. Check expires_at (ISO string or unix timestamp)
  const rawExpiresAt = expiryMeta.expires_at || expiryMeta.expiresAt;
  if (rawExpiresAt) {
    if (typeof rawExpiresAt === "number") {
      const ts = rawExpiresAt > 1e11 ? rawExpiresAt : rawExpiresAt * 1000;
      if (!isNaN(ts) && ts > Date.now()) {
        return ts;
      }
    } else if (typeof rawExpiresAt === "string") {
      const ts = new Date(rawExpiresAt).getTime();
      if (!isNaN(ts) && ts > Date.now()) {
        return ts;
      }
    }
  }

  // 2. Check expires_in (seconds)
  const rawExpiresIn = expiryMeta.expires_in || expiryMeta.expiresIn;
  if (rawExpiresIn) {
    const sec = Number(rawExpiresIn);
    if (!isNaN(sec) && sec > 0) {
      return Date.now() + sec * 1000;
    }
  }

  // 3. Fallback: 7 days
  return Date.now() + SEVEN_DAYS_MS;
};

export const persistAuthData = (token, user, authMeta = {}) => {
  const meta = {
    expires_at: authMeta?.expires_at || user?.expires_at,
    expires_in: authMeta?.expires_in || user?.expires_in,
    token_type: authMeta?.token_type || user?.token_type || "Bearer",
  };

  const expiresAtMs = calculateTokenExpiresAt(meta);
  const expiresInSec = meta.expires_in ? Number(meta.expires_in) : SEVEN_DAYS_SECONDS;
  const expiresAtIso = meta.expires_at || new Date(expiresAtMs).toISOString();

  const tokenData = {
    token,
    token_type: meta.token_type,
    expires_in: expiresInSec,
    expires_at: expiresAtIso,
    expiresAt: expiresAtMs,
    savedAt: Date.now(),
  };

  try {
    localStorage.setItem("DR_KROK_tokenData", JSON.stringify(tokenData));
    localStorage.setItem("DR_KROK_token", token);
    localStorage.setItem("DR_KROK_userToken", token);
    localStorage.setItem("token", token);
    if (user) {
      localStorage.setItem("DR_KROK_user", JSON.stringify(user));
      if (user.name) {
        localStorage.setItem("DR_KROK_userName", user.name);
      }
    }
  } catch (err) {
    console.error("Error writing auth data to localStorage:", err);
  }

  // Also set cookie with 7-day max-age for environments that read cookies
  try {
    document.cookie = `DR_KROK_token=${encodeURIComponent(token)}; max-age=${SEVEN_DAYS_SECONDS}; path=/; SameSite=Lax`;
  } catch {
    // Ignore environments where cookies are restricted
  }

  return tokenData;
};

export const clearAuthData = () => {
  try {
    localStorage.removeItem("DR_KROK_tokenData");
    localStorage.removeItem("DR_KROK_token");
    localStorage.removeItem("DR_KROK_userToken");
    localStorage.removeItem("DR_KROK_user");
    localStorage.removeItem("DR_KROK_userName");
    localStorage.removeItem("token");
  } catch (err) {
    console.error("Error clearing auth data from localStorage:", err);
  }

  try {
    document.cookie = "DR_KROK_token=; max-age=0; path=/; SameSite=Lax";
  } catch {
    // Ignore
  }
};

export const UserProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check user token upon application load
    const tokenData = localStorage.getItem("DR_KROK_tokenData");
    const user = localStorage.getItem("DR_KROK_user");

    if (tokenData) {
      try {
        const parsedTokenData = JSON.parse(tokenData);
        const now = Date.now();

        // Calculate expiresAt using stored expires_at, expires_in, or expiresAt (7 days fallback)
        let tokenExpiry = parsedTokenData.expiresAt;
        if (parsedTokenData.expires_at) {
          const parsed = new Date(parsedTokenData.expires_at).getTime();
          if (!isNaN(parsed)) tokenExpiry = parsed;
        } else if (parsedTokenData.expires_in) {
          const base = parsedTokenData.savedAt || now;
          tokenExpiry = base + Number(parsedTokenData.expires_in) * 1000;
        }

        // Check if token is expired
        if (tokenExpiry && tokenExpiry > now) {
          setIsLoggedIn(true);
          if (user) {
            setUserData(JSON.parse(user));
          }
        } else if (!parsedTokenData.expires_at && parsedTokenData.token) {
          // Migration grace period: keep session active and let backend 401 invalidate if truly expired
          setIsLoggedIn(true);
          if (user) {
            setUserData(JSON.parse(user));
          }
        } else {
          // Token expired, clear it
          clearAuthData();
        }
      } catch (error) {
        console.error("Error parsing token data:", error);
        clearAuthData();
      }
    } else {
      const legacyToken = localStorage.getItem("DR_KROK_token") || localStorage.getItem("token");
      if (legacyToken) {
        setIsLoggedIn(true);
        if (user) {
          try {
            setUserData(JSON.parse(user));
          } catch {}
        }
      }
    }
  }, []);

  // Listen for logout events from ApiContext (when 401 occurs)
  useEffect(() => {
    const handleLogoutEvent = () => {
      logout();
    };

    window.addEventListener("user-logout", handleLogoutEvent);

    return () => {
      window.removeEventListener("user-logout", handleLogoutEvent);
    };
  }, []);

  const login = useCallback((token, user, authMeta = {}) => {
    persistAuthData(token, user, authMeta);
    setIsLoggedIn(true);
    setUserData(user);
  }, []);

  const register = useCallback((token, user, authMeta = {}) => {
    persistAuthData(token, user, authMeta);
    if (user?.name) {
      localStorage.setItem("DR_KROK_userName", user.name);
    }
    setIsLoggedIn(true);
    setUserData(user);
  }, []);

  const logout = useCallback(() => {
    clearAuthData();
    setIsLoggedIn(false);
    setUserData(null);
  }, []);

  const updateUser = useCallback((updater) => {
    setUserData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next) {
        localStorage.setItem("DR_KROK_user", JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const value = {
    isLoggedIn,
    userData,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
