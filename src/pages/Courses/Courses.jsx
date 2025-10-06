// CoursesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  FaClock,
  FaStar,
  FaUserTie,
  FaPlayCircle,
  FaVideo,
  FaUsers,
} from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { sampleLiveCourses } from "./data/coursesData";
import RatingStars from "./components/RatingStars";
import VideoCourseCard from "./components/VideoCourseCard";
import LiveCourseCard from "./components/LiveCourseCard";
import { useApi } from "../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "../../context/UserContext";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Courses() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { getVideoCourses, getFavorites, toggleFavorite } = useApi();
  const { isLoggedIn } = useUser();
  const [activeTab, setActiveTab] = useState("video"); // video | live
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoCourses, setVideoCourses] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [renderKey, setRenderKey] = useState(0);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const liveCourses = sampleLiveCourses;

  useEffect(() => {
    const handleLanguageChange = () => {
      setRenderKey((prev) => prev + 1);
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  useEffect(() => {
    if (activeTab !== "video") return;
    let mounted = true;
    // Only show loading on initial load, not on language changes
    if (!initialLoadDone) {
      setLoading(true);
    }
    setError("");
    getVideoCourses({ page: 1, per_page: 30 })
      .then((res) => {
        if (!mounted) return;
        const mapped = (res.data || []).map((c) => ({
          id: c.id,
          type: "video",
          title: c.title,
          description: c.description,
          instructor: c.instructor?.name || c.instructor || "",
          instructorImg: c.instructor_image || "/user.png",
          hours: Math.max(1, Math.round((c.duration_minutes || 0) / 60)),
          lessons: c.lessons_count ?? 0,
          rating: c.avg_rating ?? 0,
          price: c.price ? Number(c.price) : 0,
          discount: c.discount ? Number(c.discount) : 0, // أضف هذا السطر
          img:
            c.image && typeof c.image === "string" && c.image.length > 0
              ? c.image
              : "/logo.png",
        }));
        setVideoCourses(mapped);
        setInitialLoadDone(true);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || "Failed to load courses");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [activeTab, getVideoCourses, i18n.language, initialLoadDone]);

  // Load favorites to reflect heart state
  useEffect(() => {
    let mounted = true;
    getFavorites()
      .then((res) => {
        if (!mounted) return;
        const favs = (res.data || [])
          .filter((f) => f.type === "video_course")
          .map((f) => f.table_id);
        setFavoriteIds(favs);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [getFavorites]);

  const onToggleFavorite = async (courseId) => {
    if (!isLoggedIn) {
      toast.info(t("auth.login_required", "Please login to use favorites"));
      return;
    }
    try {
      const res = await toggleFavorite(courseId, "video_course");
      setFavoriteIds((prev) =>
        res.message === "Added to favorites"
          ? [...new Set([...prev, courseId])]
          : prev.filter((id) => id !== courseId)
      );
      toast.success(res.message);
    } catch {
      toast.error(t("favorites.failedToRemove", "Failed to remove from favorites"));
    }
  };

  const visible = activeTab === "video" ? videoCourses : liveCourses;
  const filtered = useMemo(() => {
    return visible.filter((c) => {
      const text = `${c.title} ${c.instructor || ""} ${c.description || ""}`.toLowerCase();
      return text.includes(query.toLowerCase());
    });
  }, [visible, query]);

  function goToDetails(course) {
    if (!course?.id) return;
    navigate(`/courses/${course.id}`);
  }

  return (
    <div className="min-h-screen py-10 transition-colors duration-300 ">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl dark:text-white">{t("courses.allCourses", "All Courses")}</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {t("courses.chooseType", "Choose course type — Recorded Video Courses or Interactive Live Courses.")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="items-center hidden p-1 bg-white rounded-full shadow-sm sm:flex dark:bg-gray-800">
              <button
                onClick={() => setActiveTab("video")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeTab === "video"
                    ? "bg-primary text-white"
                    : "text-gray-600 dark:text-gray-200"
                }`}
              >
                <FaPlayCircle className="inline mr-2" /> {t("courses.videoCourse", "Video Course")}
              </button>
              <button
                onClick={() => setActiveTab("live")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeTab === "live"
                    ? "bg-red-600 text-white"
                    : "text-gray-600 dark:text-gray-200"
                }`}
              >
                <FaVideo className="inline mr-2" /> {t("courses.liveCourse", "Live Course")}
              </button>
            </div>

            {/* Search */}
            <div className="flex items-center overflow-hidden bg-white border border-transparent rounded-full shadow-sm dark:bg-gray-800">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-48 px-4 py-2 text-sm text-gray-700 bg-transparent outline-none sm:w-64 dark:text-gray-200"
                placeholder="Search for a course or instructor..."
                aria-label="Search courses"
              />
            </div>
          </div>
        </header>

        {/* Mobile Toggle */}
        <div className="flex gap-3 mb-4 sm:hidden">
          <button
            onClick={() => setActiveTab("video")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold ${
              activeTab === "video"
                ? "bg-primary text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            }`}
          >
            <FaPlayCircle className="inline mr-2" /> Video Course
          </button>
          <button
            onClick={() => setActiveTab("live")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold ${
              activeTab === "live"
                ? "bg-red-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            }`}
          >
            <FaVideo className="inline mr-2" /> Live Course
          </button>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {t("courses.showing", "Showing")} {filtered.length} {t("courses.of", "of")} {visible.length} — {t("courses.type", "Type")}:{" "}
            <span className="font-medium">
              {activeTab === "video" ? t("courses.videoCourse", "Video Course") : t("courses.liveCourse", "Live Course")}
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t("courses.layoutModern", "Layout: Modern Cards")}
          </div>
        </div>

        {activeTab === "video" && loading && <LoadingSpinner />}
        {activeTab === "video" && !!error && (
          <div className="p-6 mb-6 text-center text-red-600 bg-white shadow dark:bg-gray-800 rounded-2xl">
            {t("common.error", "Error")}: {error}
          </div>
        )}

        {/* Grid */}
        <section>
          <div
            key={renderKey}
            className={`grid grid-cols-1 gap-6 ${
              activeTab === "video"
                ? "sm:grid-cols-2 lg:grid-cols-3"
                : "sm:grid-cols-2"
            }`}
          >
            {filtered.map((course) =>
              course.type === "video" ? (
                <VideoCourseCard
                  key={course.id}
                  course={course}
                  onClick={goToDetails}
                  isFavorite={favoriteIds.includes(course.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ) : (
                <LiveCourseCard
                  key={course.id}
                  course={course}
                  onClick={goToDetails}
                  isFavorite={favoriteIds.includes(course.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              )
            )}

            {filtered.length === 0 && (
              <div className="p-8 text-center bg-white shadow col-span-full dark:bg-gray-800 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("courses.noResults", "No results found")}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {t("courses.tryDifferentSearch", "Try different search keywords or choose another course type.")}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}


