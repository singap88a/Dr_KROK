// LiveCourseLessons/starsUtils.js
import React from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

export const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<FaStar key={i} className="text-sm text-yellow-400" />);
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(<FaStar key={i} className="text-sm text-yellow-400" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-sm text-text-muted" />);
    }
  }
  return stars;
};