// ProgressSystem/ProgressCircle.jsx
import React from "react";
import { FaCheck } from "react-icons/fa";

export const ProgressCircle = ({
  percent = 0,
  size = 32,
  stroke = 4,
  completed = false,
  active = false,
}) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const offset = circumference * (1 - clamped / 100);
  const trackColor = active ? "#22c55e33" : "#94a3b833";
  const barColor = completed ? "#22c55e" : active ? "#22c55e" : "#0ea5e9";

  return (
    <svg width={size} height={size} className="shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={trackColor}
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={barColor}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {completed ? (
        <g transform={`translate(${size / 2 - 6} ${size / 2 - 6})`}>
          <FaCheck className="text-xs text-green-500" />
        </g>
      ) : (
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="8"
          fill={active ? "#fff" : "#334155"}
          fontWeight="bold"
        >
          {clamped}%
        </text>
      )}
    </svg>
  );
};