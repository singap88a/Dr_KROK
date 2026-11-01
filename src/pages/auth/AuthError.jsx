import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function AuthError() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code") || "";
    const email = searchParams.get("email") || "";
    const message = searchParams.get("message") || "";

    const params = new URLSearchParams();
    if (code) params.set("code", code);
    if (email) params.set("email", email);
    if (message) {
      params.set("deviceError", message);
    } else {
      params.set("deviceError", "Authentication failed");
    }

    navigate(`/login?${params.toString()}`, { replace: true });
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-text">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
