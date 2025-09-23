import React from "react"

const LoadingSpinner = ({
  variant = "spinner", // spinner | skeleton
  size = "md", // sm | md | lg
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  }

  // Skeleton loader
  if (variant === "skeleton") {
    return (
      <div
        className={`animate-pulse rounded-md bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] ${className}`}
      ></div>
    )
  }

  // Spinner loader
  return (
    <div className={`relative flex items-center justify-center py-20 ${className}`}>
      {/* Outer spinning ring */}
      <div
        className={`${sizeClasses[size]} border-4 border-primary/30 border-t-primary rounded-full animate-spin`}
      ></div>
      {/* Pulse ring */}
      <div
        className={`${sizeClasses[size]} absolute border-2 border-primary/20 rounded-full animate-ping`}
      ></div>
    </div>
  )
}

export default LoadingSpinner
