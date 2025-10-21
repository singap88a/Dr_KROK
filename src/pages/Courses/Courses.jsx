// CoursesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  FaPlayCircle,
  FaVideo,
} from "react-icons/fa";
import { FiHeart, FiCalendar, FiClock, FiUsers } from "react-icons/fi";
import { MdLiveTv } from "react-icons/md";
import { useApi } from "../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "../../context/UserContext";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/LoadingSpinner";
import RatingStars from "./components/RatingStars"; // تأكد من استيراد RatingStars

export default function Courses() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { getVideoCourses, getLiveCourses, getFavorites, toggleFavorite } = useApi();
  const { isLoggedIn } = useUser();
  const [activeTab, setActiveTab] = useState("video"); // video | live
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoCourses, setVideoCourses] = useState([]);
  const [liveCourses, setLiveCourses] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [renderKey, setRenderKey] = useState(0);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    const handleLanguageChange = () => {
      setRenderKey((prev) => prev + 1);
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  // Load video courses
  useEffect(() => {
    if (activeTab !== "video") return;
    let mounted = true;
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
          discount: c.discount ? Number(c.discount) : 0,
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

  // Load live courses
  useEffect(() => {
    if (activeTab !== "live") return;
    let mounted = true;
    if (!initialLoadDone) {
      setLoading(true);
    }
    setError("");
    getLiveCourses({ page: 1, per_page: 30 })
      .then((res) => {
        if (!mounted) return;
        const mapped = (res.data || []).map((c) => ({
          id: c.id,
          type: "live",
          title: c.title,
          description: c.description,
          category: c.category,
          level: c.level,
          language: c.language,
          started_at: c.started_at,
          college_year: c.college_year,
          price: c.price ? Number(c.price) : 0,
          discount: c.discount ? Number(c.discount) : 0,
          rating: c.avg_rating ?? 0,
          img:
            c.image && typeof c.image === "string" && c.image.length > 0
              ? c.image
              : "/logo.png",
        }));
        setLiveCourses(mapped);
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
  }, [activeTab, getLiveCourses, i18n.language, initialLoadDone]);

  // Load favorites to reflect heart state
  useEffect(() => {
    let mounted = true;
    getFavorites()
      .then((res) => {
        if (!mounted) return;
        const videoFavs = (res.data || [])
          .filter((f) => f.type === "video_course")
          .map((f) => f.table_id);
        const liveFavs = (res.data || [])
          .filter((f) => f.type === "live_course")
          .map((f) => f.table_id);
        setFavoriteIds([...videoFavs, ...liveFavs]);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [getFavorites]);

  const onToggleFavorite = async (courseId, courseType) => {
    if (!isLoggedIn) {
      toast.info(t("auth.login_required", "Please login to use favorites"));
      return;
    }
    try {
      const type = courseType === "video" ? "video_course" : "live_course";
      const res = await toggleFavorite(courseId, type);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeStatus = (dateString) => {
    const now = new Date();
    const courseDate = new Date(dateString);
    const diffTime = courseDate.getTime() - now.getTime();
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 0) return { status: 'completed', text: 'ENDED', color: 'bg-gray-500' };
    if (diffHours <= 24) return { status: 'today', text: 'LIVE TODAY', color: 'bg-red-500' };
    if (diffHours <= 168) return { status: 'soon', text: 'COMING SOON', color: 'bg-orange-500' };
    return { status: 'upcoming', text: 'UPCOMING', color: 'bg-blue-500' };
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
<div className="flex items-center px-3 py-2 transition-all duration-200 bg-white border border-gray-300 rounded-full shadow-sm focus-within:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:focus-within:border-blue-400">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 text-gray-500 dark:text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z"
    />
  </svg>

  <input
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    className="w-48 px-3 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none sm:w-64 dark:text-gray-200 dark:placeholder-gray-500"
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

        {loading && <LoadingSpinner />}
        {!!error && (
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
                ? "sm:grid-cols-2 lg:grid-cols-3" // فيديو كورس: 3 أعمدة
                : "lg:grid-cols-2" // لايف كورس: عمودين فقط للشاشات الكبيرة
            }`}
          >
            {filtered.map((course) =>
              course.type === "video" ? (
                // فيديو كورس - نفس التصميم الأصلي تماماً
                <div
                  key={course.id}
                  className="relative flex flex-col overflow-hidden transition-all duration-300 bg-white border border-gray-200 cursor-pointer rounded-2xl dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 group"
                  onClick={() => goToDetails(course)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={course.img}
                      alt={course.title}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                    <button
                      aria-label="toggle favorite"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleFavorite(course.id, "video");
                      }}
                      className="absolute z-10 p-2 transition-all duration-200 bg-white rounded-full shadow top-3 right-3 hover:bg-white/90"
                    >
                      <FiHeart className={`text-xl ${favoriteIds.includes(course.id) ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
                    </button>
                    {course.discount > 0 && (
                      <span className="absolute px-2 py-1 text-xs font-bold text-white bg-red-600 rounded shadow top-3 left-3">
                        {Math.round((course.discount / course.price) * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 px-6 pt-6">
                    <h3 className="mb-2 text-lg font-bold text-primary line-clamp-1">{course.title}</h3>
                    <p className="flex-1 mb-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{course.description}</p>
                    <div className="mb-3 space-y-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={course.instructorImg}
                            alt={course.instructor}
                            className="w-8 h-8 rounded-full"
                          />
                          <span>{course.instructor}</span>
                        </div>
                        <span>{course.lessons} {t("courses.lessons")}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {/* التعديل الأول: استبدال الرقم بالنجوم */}
                          <RatingStars value={course.rating} size={14} />
                          <span className="text-xs text-gray-500">({course.rating.toFixed(1)})</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xl font-bold text-primary">${(course.price - course.discount).toFixed(2)}</span>
                          {course.discount > 0 && (
                            <span className="ml-2 text-sm text-gray-400 line-through">${course.price.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pb-4">
                    <button
                      onClick={() => goToDetails(course)}
                      className="block w-full px-4 py-2 text-sm font-medium text-center text-white rounded-xl bg-primary hover:shadow-md hover:brightness-110"
                    >
                      {t("courses.details", "تفاصيل")}
                    </button>
                  </div>
                </div>
              ) : (
                // لايف كورس - تصميم أفقي بعمودين
                <div
                  key={course.id}
                  onClick={() => goToDetails(course)}
                  className="flex overflow-hidden transition-all duration-300 bg-white border border-gray-200 cursor-pointer rounded-2xl dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg"
                >
                  {/* الصورة على اليسار */}
                  <div className="relative w-2/5">
                    <img
                      src={course.img}
                      alt={course.title}
                      className="object-cover w-full h-full"
                    />
                    
                    {/* Live Badge */}
                    <div className="absolute z-10 top-3 left-3">
                      <div className="flex items-center gap-1 px-2 py-1 text-white rounded-full shadow-lg bg-gradient-to-r from-[#FF416C] to-[#FF4B2B]">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold">LIVE</span>
                      </div>
                    </div>

                    {/* Time Status Badge */}
                    <div className="absolute z-10 bottom-3 left-3">
                      <div className={`px-2 py-1 text-xs font-semibold text-white rounded-full shadow-lg ${getTimeStatus(course.started_at).color}`}>
                        {getTimeStatus(course.started_at).text}
                      </div>
                    </div>
                  </div>

                  {/* المحتوى على اليمين */}
                  <div className="flex flex-col flex-1 w-3/5 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs font-medium rounded text-primary bg-blue-50 dark:bg-blue-900/30">
                          {course.category}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded dark:bg-gray-700 dark:text-gray-300">
                          {course.level}
                        </span>
                      </div>
                      
                      {/* التعديل الثاني: نقل الخصم إلى اليمين واستبدال مكان القلب */}
                      {course.discount > 0 && (
                        <div className="px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full shadow">
                          {Math.round((course.discount / course.price) * 100)}% OFF
                        </div>
                      )}
                    </div>
                    
                    <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white line-clamp-2">
                      {course.title}
                    </h3>
                    
                    <p className="flex-1 mb-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Live Session Info */}
                    <div className="p-2 mb-2 border border-blue-100 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <FiCalendar className="text-primary" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {formatDate(course.started_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiClock className="text-primary" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {formatTime(course.started_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center justify-between mb-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FiUsers className="text-xs" />
                        <span>Year {course.college_year}</span>
                      </div>
                      <span className="px-2 py-1 bg-gray-100 rounded dark:bg-gray-700">
                        {course.language}
                      </span>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                          ${(course.price - course.discount).toFixed(2)}
                        </span>
                        {course.discount > 0 && (
                          <span className="text-sm text-gray-400 line-through">
                            ${course.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* زر المفضلة مكان الخصم */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(course.id, "live");
                          }}
                          className="p-2 transition-all duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <FiHeart className={`text-lg ${favoriteIds.includes(course.id) ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
                        </button>
                        <button className="px-3 py-2 text-sm font-medium text-white rounded-lg bg-primary hover:shadow-md hover:brightness-110">
                          {new Date(course.started_at) > new Date() ? 'Join Live' : 'View Details'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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