import React from "react";
import { FaStar } from "react-icons/fa";

export default function RatingStars({ value, size = 14 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const total = 5;
  return (
    <div className="flex items-center gap-1" aria-hidden>
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        const filled = idx <= full || (half && idx === full + 1);
        return (
          <FaStar
            key={i}
            className={`text-sm ${filled ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
            size={size}
          />
        );
      })}
    </div>
  );
}
