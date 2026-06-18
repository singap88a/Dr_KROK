// UserContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // التحقق من وجود توكن المستخدم عند تحميل التطبيق
    const tokenData = localStorage.getItem("DR_KROK_tokenData");
    const user = localStorage.getItem("DR_KROK_user");

    if (tokenData) {
      try {
        const parsedTokenData = JSON.parse(tokenData);
        const now = Date.now();

        // Check if token is expired (24 hours = 24 * 60 * 60 * 1000 ms)
        if (parsedTokenData.expiresAt > now) {
          setIsLoggedIn(true);
          if (user) {
            setUserData(JSON.parse(user));
          }
        } else {
          // Token expired, clear it
          localStorage.removeItem("DR_KROK_tokenData");
          localStorage.removeItem("DR_KROK_user");
          localStorage.removeItem("DR_KROK_token");
          localStorage.removeItem("DR_KROK_userToken");
          localStorage.removeItem("DR_KROK_userName");
        }
      } catch (error) {
        console.error("Error parsing token data:", error);
        // Clear corrupted data
        localStorage.removeItem("DR_KROK_tokenData");
        localStorage.removeItem("DR_KROK_user");
        localStorage.removeItem("DR_KROK_token");
        localStorage.removeItem("DR_KROK_userToken");
        localStorage.removeItem("DR_KROK_userName");
      }
    }
  }, []);

  // Listen for logout events from ApiContext (when token expires)
  useEffect(() => {
    const handleLogoutEvent = () => {
      logout();
    };

    window.addEventListener('user-logout', handleLogoutEvent);

    return () => {
      window.removeEventListener('user-logout', handleLogoutEvent);
    };
  }, []);

  const login = useCallback((token, user) => {
    // Store token with expiration (24 hours from now)
    const tokenData = {
      token: token,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours in milliseconds
    };
    localStorage.setItem("DR_KROK_tokenData", JSON.stringify(tokenData));
    localStorage.setItem("DR_KROK_user", JSON.stringify(user));
    setIsLoggedIn(true);
    setUserData(user);
  }, []);

  const register = useCallback((token, user) => {
    // Store token with expiration (24 hours from now)
    const tokenData = {
      token: token,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours in milliseconds
    };
    localStorage.setItem("DR_KROK_tokenData", JSON.stringify(tokenData));
    localStorage.setItem("DR_KROK_user", JSON.stringify(user));
    localStorage.setItem("DR_KROK_userName", user.name);
    setIsLoggedIn(true);
    setUserData(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("DR_KROK_tokenData");
    localStorage.removeItem("DR_KROK_token");
    localStorage.removeItem("DR_KROK_userToken");
    localStorage.removeItem("DR_KROK_user");
    localStorage.removeItem("DR_KROK_userName");
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
