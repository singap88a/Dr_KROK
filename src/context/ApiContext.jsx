import React, { createContext, useContext, useEffect, useState } from "react";

const ApiContext = createContext();

export function ApiProvider({ children }) {
  const baseURL = "https://universities.hipolabs.com"; // ✅ رابط السيرفر الأساسي
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 دالة عامة للفetch تقدر تستخدمها مع أي endpoint
  async function fetchData(endpoint) {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${baseURL}${endpoint}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      return await res.json();
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  // 🔹 مثال: تجيب الجامعات
  async function fetchUniversities() {
    const data = await fetchData("/search?country=Egypt");
    if (data) setUniversities(data.map((u) => u.name));
  }

  useEffect(() => {
    fetchUniversities();
  }, []);

  return (
    <ApiContext.Provider
      value={{
        baseURL,
        universities,
        loading,
        error,
        fetchData, // ✅ دالة عامة لأي API تاني
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  return useContext(ApiContext);
}
