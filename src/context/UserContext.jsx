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
    const token = localStorage.getItem("token") || localStorage.getItem("userToken");
    const user = localStorage.getItem("user");
    
    if (token) {
      setIsLoggedIn(true);
      if (user) {
        setUserData(JSON.parse(user));
      }
    }
  }, []);

  const login = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setIsLoggedIn(true);
    setUserData(user);
  };

  const register = (token, user) => {
    localStorage.setItem("userToken", token);
    localStorage.setItem("userName", user.name);
    setIsLoggedIn(true);
    setUserData(user);
  };

  const logout = () => {
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