// UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // التحقق من وجود توكن المستخدم عند تحميل التطبيق
    const tokenData = localStorage.getItem("tokenData");
    const user = localStorage.getItem("user");

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
          localStorage.removeItem("tokenData");
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          localStorage.removeItem("userToken");
          localStorage.removeItem("userName");
        }
      } catch (error) {
        console.error("Error parsing token data:", error);
        // Clear corrupted data
        localStorage.removeItem("tokenData");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("userToken");
        localStorage.removeItem("userName");
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

  const login = (token, user) => {
    // Store token with expiration (24 hours from now)
    const tokenData = {
      token: token,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours in milliseconds
    };
    localStorage.setItem("tokenData", JSON.stringify(tokenData));
    localStorage.setItem("user", JSON.stringify(user));
    setIsLoggedIn(true);
    setUserData(user);
  };

  const register = (token, user) => {
    // Store token with expiration (24 hours from now)
    const tokenData = {
      token: token,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours in milliseconds
    };
    localStorage.setItem("tokenData", JSON.stringify(tokenData));
    localStorage.setItem("userName", user.name);
    setIsLoggedIn(true);
    setUserData(user);
  };

  const logout = () => {
    localStorage.removeItem("tokenData");
    localStorage.removeItem("token");
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    setUserData(null);
  };

  const updateUser = (updater) => {
    setUserData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next) {
        localStorage.setItem("user", JSON.stringify(next));
      }
      return next;
    });
  };

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