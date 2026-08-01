import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function AuthError() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      // Redirect to login page and pass the error message to trigger the modal
      navigate(`/login?deviceError=${encodeURIComponent(message)}`, { replace: true });
    } else {
      // Default fallback
      navigate(`/login?deviceError=Authentication+failed`, { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-text">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
