import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaBook } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useUser } from "../../context/UserContext";
import { useApi } from "../../context/ApiContext";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import RatingCard from "../../components/Profile/ratings/RatingCard";

export default function MyRatings({ user, onRatingsUpdate }) {
  const { t } = useTranslation();
  const { isLoggedIn, userData } = useUser();
  const { getMyProfile } = useApi();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoggedIn && (userData || user)) {
      const userRatings = (userData || user)?.ratings || [];
      setRatings(userRatings);
      setLoading(false);
    } else if (isLoggedIn) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, userData, user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      if (data) {
        setRatings(data.ratings || []);
      } else {
        setError("Failed to load profile");
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(err.message || "Failed to load ratings");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const parts = dateString.split(" ");
      if (parts.length >= 2) {
        const datePart = parts[0];
        const timePart = parts[1];
        const ampm = parts[2];

        const [day, month, year] = datePart.split("-");
        const [hours, minutes] = timePart.split(":");

        let hour24 = parseInt(hours);
        if (ampm === "PM" && hour24 !== 12) hour24 += 12;
        if (ampm === "AM" && hour24 === 12) hour24 = 0;

        const date = new Date(year, month - 1, day, hour24, minutes);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-background">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-text">
            {t("auth.login_required") || "Please login to view your ratings"}
          </h2>
          <Link
            to="/Login"
            className="px-6 py-3 text-white transition-colors rounded-lg bg-primary hover:bg-primary/90"
          >
            {t("auth.login.title") || "Login"}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-background">
        <LoadingSpinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-background">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-red-600">
            {t("common.error") || "Error"}
          </h2>
          <p className="mb-4 text-text-secondary">{error}</p>
          <button
            onClick={fetchUserProfile}
            className="px-6 py-3 text-white transition-colors rounded-lg bg-primary hover:bg-primary/90"
          >
            {t("common.retry") || "Retry"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text animate-fadeIn">
      <div className="max-w-6xl px-4 py-8 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <FaStar className="text-2xl text-primary" />
            </div>
            <div>
              <h1 className="mb-1 text-3xl font-bold text-text">
                {t("courses.myRatings") || "My Ratings"}
              </h1>
              <p className="text-text-secondary">
                {t("courses.ratings") || "Ratings"} ({ratings.length})
              </p>
            </div>
          </div>
        </div>

        {/* Ratings List */}
        {ratings.length === 0 ? (
          <div className="py-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                  <FaBook className="text-4xl text-gray-400" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-text">
                  {t("courses.noRatings") || "No ratings yet"}
                </h3>
                <p className="leading-relaxed text-text-secondary">
                  {t("courses.noRatingsDescription") ||
                    "You haven't rated any courses yet. Start exploring courses and share your feedback!"}
                </p>
              </div>
              <Link
                to="/courses"
                className="inline-flex items-center gap-3 px-8 py-4 font-semibold text-white transition-all duration-200 transform shadow-lg bg-primary rounded-xl hover:bg-primary/90 hover:shadow-xl hover:scale-105"
              >
                <FaBook />
                {t("courses.browseCourses") || "Browse Courses"}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
            {ratings.map((rating) => (
              <RatingCard
                key={rating.id}
                rating={rating}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
